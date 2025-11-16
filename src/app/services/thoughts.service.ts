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

  constructor() {
    this.loadFromCloud();
  }

  async loadFromCloud() {
  const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?order=order.asc`, {
      headers: {
        'apikey': this.supabase.anonKey,
        'Authorization': `Bearer ${this.supabase.anonKey}`,
      }
    });
    if (res.ok) {
      this.thoughts = await res.json();
      this.thoughtsSubject.next([...this.thoughts]);
    }
  }

  async addThought(text: string) {
    // Find max order value
    const maxOrder = this.thoughts.length > 0 ? Math.max(...this.thoughts.map(t => t.order ?? 0)) : 0;
    const res = await fetch(`${this.supabase.url}/rest/v1/thoughts`, {
      method: 'POST',
      headers: {
        'apikey': this.supabase.anonKey,
        'Authorization': `Bearer ${this.supabase.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ text, order: maxOrder + 1 })
    });
    if (res.ok) {
      await this.loadFromCloud();
    }
  }

  async updateThought(id: number, text: string) {
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
    }
  }

  async deleteThought(id: number) {
    const res = await fetch(`${this.supabase.url}/rest/v1/thoughts?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': this.supabase.anonKey,
        'Authorization': `Bearer ${this.supabase.anonKey}`,
      }
    });
    if (res.ok) {
      await this.loadFromCloud();
    }
  }

  async updateReply(id: number, reply: string) {
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
