import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Thought } from '../models/thought.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThoughtsService {
  private supabase: SupabaseClient | null = null;
  private useSupabase = false;

  private thoughts: Thought[] = [];
  private thoughtsSubject = new BehaviorSubject<Thought[]>(this.thoughts);
  thoughts$ = this.thoughtsSubject.asObservable();

  private readonly STORAGE_KEY = 'thoughts_backup';

  constructor() {
    try {
      if (supabase) {
        this.supabase = supabase;
        this.useSupabase = true;
      }
    } catch (err) {
      this.supabase = null;
      this.useSupabase = false;
    }
    // initialize data source
    this.init();
  }

  private async init() {
    if (this.useSupabase && this.supabase) {
      const ok = await this.loadFromSupabase();
      if (!ok) this.loadFromLocalStorage();
    } else {
      this.loadFromLocalStorage();
    }
  }

  // Force update for UI (when toggling like, etc)
  async forceUpdate() {
    this.thoughtsSubject.next([...this.thoughts]);
    await this.persistAll();
  }

  private async loadFromSupabase(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase!.from('thoughts').select('*').order('order', { ascending: true });
      if (error) throw error;
      if (Array.isArray(data)) {
        // Normalize to Thought[] and trim reply whitespace loaded from remote
        const updates: Thought[] = [];
        this.thoughts = data.map((r: any) => {
          const trimmedReply = r.reply && typeof r.reply === 'string' ? r.reply.trim() : r.reply;
          const thought: Thought = {
            id: r.id,
            text: r.text,
            reply: trimmedReply,
            order: r.order,
            liked: r.liked,
            replyLiked: r.replyLiked,
            author: r.author
          };
          // If the remote reply contains extra whitespace, schedule an update to persist the trimmed value
          if (r.reply && typeof r.reply === 'string' && r.reply !== trimmedReply) updates.push(thought);
          return thought;
        });
        this.thoughtsSubject.next([...this.thoughts]);
        // Keep a local backup
        this.saveToLocalStorage();
        // Persist cleaned replies back to remote to avoid future spacing issues
        for (const t of updates) {
          // fire-and-forget
          this.persistOne(t).catch(() => undefined);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Supabase load failed, falling back to localStorage', err);
      return false;
    }
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.thoughts = JSON.parse(saved);
        this.thoughtsSubject.next([...this.thoughts]);
      } catch (e) {
        this.thoughts = [];
        this.thoughtsSubject.next([]);
      }
    } else {
      this.thoughts = [];
      this.thoughtsSubject.next([]);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.thoughts));
  }

  private async persistAll() {
    if (this.useSupabase && this.supabase) {
      try {
        // upsert entire array; assumes `id` is primary key in supabase table
        const { error } = await this.supabase.from('thoughts').upsert(this.thoughts, { onConflict: 'id' });
        if (error) throw error;
        // also update local backup
        this.saveToLocalStorage();
      } catch (err) {
        console.warn('Persist to Supabase failed, saved to localStorage instead', err);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private async persistOne(thought: Thought) {
    if (this.useSupabase && this.supabase) {
      try {
        const { error } = await this.supabase.from('thoughts').upsert(thought, { onConflict: 'id' });
        if (error) throw error;
        this.saveToLocalStorage();
      } catch (err) {
        console.warn('Persist one to Supabase failed, saved to localStorage instead', err);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private async removeOneFromRemote(id: number) {
    if (this.useSupabase && this.supabase) {
      try {
        const { error } = await this.supabase.from('thoughts').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Remote delete failed', err);
      }
    }
  }

  async addThought(text: string) {
    const maxOrder = this.thoughts.length > 0 ? Math.max(...this.thoughts.map(t => t.order ?? 0)) : 0;
    const newThought: Thought = {
      id: Date.now(),
      text,
      order: maxOrder + 1
    };
    this.thoughts.push(newThought);
    this.thoughtsSubject.next([...this.thoughts]);
    await this.persistOne(newThought);
  }

  async updateThought(id: number, text: string) {
    const thought = this.thoughts.find(t => t.id === id);
    if (!thought) return;
    thought.text = text;
    this.thoughtsSubject.next([...this.thoughts]);
    await this.persistOne(thought);
  }

  async updateAuthor(id: number, author: string | undefined) {
    const thought = this.thoughts.find(t => t.id === id);
    if (!thought) return;
    thought.author = author;
    this.thoughtsSubject.next([...this.thoughts]);
    await this.persistOne(thought);
  }

  async deleteThought(id: number) {
    const index = this.thoughts.findIndex(t => t.id === id);
    if (index === -1) return;
    this.thoughts.splice(index, 1);
    this.thoughtsSubject.next([...this.thoughts]);
    await this.removeOneFromRemote(id);
    await this.persistAll();
  }

  async updateReply(id: number, reply: string) {
    const thought = this.thoughts.find(t => t.id === id);
    if (!thought) return;
    // Trim leading/trailing whitespace (including newlines) before saving
    thought.reply = reply && typeof reply === 'string' ? reply.trim() : reply;
    this.thoughtsSubject.next([...this.thoughts]);
    await this.persistOne(thought);
  }

  async reorderNotes(dragId: number, targetId: number) {
    const notes = [...this.thoughts];
    const dragIndex = notes.findIndex(t => t.id === dragId);
    const targetIndex = notes.findIndex(t => t.id === targetId);
    if (dragIndex > -1 && targetIndex > -1) {
      const [dragged] = notes.splice(dragIndex, 1);
      notes.splice(targetIndex, 0, dragged);
      // Update order fields
      for (let i = 0; i < notes.length; i++) {
        notes[i].order = i + 1;
      }
      this.thoughts = notes;
      this.thoughtsSubject.next([...this.thoughts]);
      await this.persistAll();
    }
  }
}
