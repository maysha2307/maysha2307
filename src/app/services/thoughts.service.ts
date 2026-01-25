import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Thought } from '../models/thought.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThoughtsService {
  private thoughts: Thought[] = [];
  private thoughtsSubject = new BehaviorSubject<Thought[]>(this.thoughts);
  thoughts$ = this.thoughtsSubject.asObservable();

  private supabase = environment.supabase;
  private useLocalStorage = true; // Use local storage as fallback

  constructor() {
    this.loadFromCloud();
  }

  async loadFromCloud() {
    try {
      // Try to load from Supabase
      const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?order=order.asc`, {
        headers: {
          'apikey': this.supabase.anonKey,
          'Authorization': `Bearer ${this.supabase.anonKey}`,
        }
      });
      if (res.ok) {
        this.thoughts = await res.json();
        this.thoughtsSubject.next([...this.thoughts]);
        console.log('✅ Thoughts loaded from Supabase:', this.thoughts);
        // Save to localStorage as backup
        localStorage.setItem('thoughts_backup', JSON.stringify(this.thoughts));
      } else {
        const error = await res.text();
        console.error('❌ Supabase error loading thoughts:', res.status, error);
        this.loadFromLocalStorage();
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from Supabase, using local storage:', error);
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem('thoughts_backup');
    if (saved) {
      this.thoughts = JSON.parse(saved);
      this.thoughtsSubject.next([...this.thoughts]);
      console.log('✅ Thoughts loaded from localStorage:', this.thoughts);
    } else {
      // Initialize with empty array
      this.thoughts = [];
      this.thoughtsSubject.next([]);
      console.log('✅ No existing thoughts, starting fresh');
    }
  }

  async addThought(text: string) {
    try {
      // Find max order value
      const maxOrder = this.thoughts.length > 0 ? Math.max(...this.thoughts.map(t => t.order ?? 0)) : 0;
      const newThought: Thought = {
        id: Date.now(), // Generate ID from timestamp
        text,
        order: maxOrder + 1
      };

      // Try to save to Supabase
      try {
        const res = await fetch(`${this.supabase.url}/rest/v1/thoughts`, {
          method: 'POST',
          headers: {
            'apikey': this.supabase.anonKey,
            'Authorization': `Bearer ${this.supabase.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ text, order: newThought.order })
        });
        if (res.ok) {
          await this.loadFromCloud();
          console.log('✅ Thought saved to Supabase');
        } else {
          throw new Error('Supabase save failed');
        }
      } catch (supabaseError) {
        // Fallback to localStorage
        console.warn('⚠️ Supabase save failed, using localStorage:', supabaseError);
        this.thoughts.push(newThought);
        this.thoughtsSubject.next([...this.thoughts]);
        localStorage.setItem('thoughts_backup', JSON.stringify(this.thoughts));
      }
    } catch (error) {
      console.error('❌ Error in addThought:', error);
      throw error;
    }
  }

  async updateThought(id: number, text: string) {
    try {
      const thought = this.thoughts.find(t => t.id === id);
      if (!thought) return;

      // Try Supabase first
      try {
        const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabase.anonKey,
            'Authorization': `Bearer ${this.supabase.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          await this.loadFromCloud();
          return;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase update failed, using localStorage:', supabaseError);
      }

      // Fallback to localStorage
      thought.text = text;
      this.thoughtsSubject.next([...this.thoughts]);
      localStorage.setItem('thoughts_backup', JSON.stringify(this.thoughts));
    } catch (error) {
      console.error('❌ Error in updateThought:', error);
      throw error;
    }
  }

  async deleteThought(id: number) {
    try {
      const index = this.thoughts.findIndex(t => t.id === id);
      if (index === -1) return;

      // Try Supabase first
      try {
        const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': this.supabase.anonKey,
            'Authorization': `Bearer ${this.supabase.anonKey}`,
          }
        });
        if (res.ok) {
          await this.loadFromCloud();
          return;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase delete failed, using localStorage:', supabaseError);
      }

      // Fallback to localStorage
      this.thoughts.splice(index, 1);
      this.thoughtsSubject.next([...this.thoughts]);
      localStorage.setItem('thoughts_backup', JSON.stringify(this.thoughts));
    } catch (error) {
      console.error('❌ Error in deleteThought:', error);
      throw error;
    }
  }

  async updateReply(id: number, reply: string) {
    try {
      const thought = this.thoughts.find(t => t.id === id);
      if (!thought) return;

      // Try Supabase first
      try {
        const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabase.anonKey,
            'Authorization': `Bearer ${this.supabase.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reply })
        });
        if (res.ok) {
          await this.loadFromCloud();
          return;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase update reply failed, using localStorage:', supabaseError);
      }

      // Fallback to localStorage
      thought.reply = reply;
      this.thoughtsSubject.next([...this.thoughts]);
      localStorage.setItem('thoughts_backup', JSON.stringify(this.thoughts));
    } catch (error) {
      console.error('❌ Error in updateReply:', error);
      throw error;
    }
  }

  async reorderNotes(dragId: number, targetId: number) {
    // Get current notes ordered
    const notes = [...this.thoughts];
    const dragIndex = notes.findIndex(t => t.id === dragId);
    const targetIndex = notes.findIndex(t => t.id === targetId);
    if (dragIndex > -1 && targetIndex > -1) {
      const [dragged] = notes.splice(dragIndex, 1);
      notes.splice(targetIndex, 0, dragged);
      // Update order fields in Supabase
      for (let i = 0; i < notes.length; i++) {
        await fetch(`${this.supabase.url}/rest/v1/thoughts?id=eq.${notes[i].id}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.supabase.anonKey,
            'Authorization': `Bearer ${this.supabase.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order: i + 1 })
        });
      }
      await this.loadFromCloud();
    }
  }
}
