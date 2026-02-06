import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimelineEvent } from '../models/timeline-event.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private supabase: SupabaseClient | null = null;
  private useSupabase = false;

  private events: TimelineEvent[] = [];
  private eventsSubject = new BehaviorSubject<TimelineEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  private readonly STORAGE_KEY = 'timeline_events_backup';

  constructor() {
    try {
      if (environment && environment.supabase && environment.supabase.url && environment.supabase.anonKey) {
        this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
        this.useSupabase = true;
      }
    } catch (err) {
      this.supabase = null;
      this.useSupabase = false;
    }
    this.init();
  }

  private async init() {
    if (this.useSupabase && this.supabase) {
      const ok = await this.loadFromSupabase();
      if (!ok) {
        this.loadEvents();
        this.initializeWithDefaults();
      }
    } else {
      this.loadEvents();
      this.initializeWithDefaults();
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.events = JSON.parse(saved);
        this.eventsSubject.next([...this.events]);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  private async persistOne(event: TimelineEvent) {
    if (this.useSupabase && this.supabase) {
      try {
        const { error } = await this.supabase.from('timeline').upsert(event);
        if (error) throw error;
        this.saveToLocalStorage();
      } catch (err) {
        console.warn('Persist timeline event failed, saved to localStorage', err);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private async persistAll() {
    if (this.useSupabase && this.supabase) {
      try {
        const { error } = await this.supabase.from('timeline').upsert(this.events);
        if (error) throw error;
        this.saveToLocalStorage();
      } catch (err) {
        console.warn('Persist all timeline events failed, saved to localStorage', err);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private async removeOneFromRemote(id: number) {
    if (this.useSupabase && this.supabase) {
      try {
        const { error } = await this.supabase.from('timeline').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Remote delete failed', err);
      }
    }
  }

  private async loadFromSupabase(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase!.from('timeline').select('*').order('order', { ascending: true });
      if (error) throw error;
      if (Array.isArray(data)) {
        this.events = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          date: r.date,
          emoji: r.emoji,
          order: r.order
        }));
        this.eventsSubject.next([...this.events]);
        this.saveToLocalStorage();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Supabase load failed, falling back to localStorage', err);
      return false;
    }
  }

  private loadEvents() {
    const ok = this.loadFromLocalStorage();
    if (ok) {
      console.log('✅ Timeline events loaded from localStorage:', this.events);
    }
  }

  private initializeWithDefaults() {
    // Only add defaults if no events exist
    if (this.events.length === 0) {
      const defaults: TimelineEvent[] = [
        {
          id: 1,
          title: "Aayesha's Birthday",
          description: "Born to bring joy into this world 🌸",
          date: '2001-01-01',
          emoji: '🎂',
          order: 1
        },
        {
          id: 2,
          title: "Mashooq's Birthday",
          description: "The day my love story began 💫",
          date: '2000-06-15',
          emoji: '🎉',
          order: 2
        },
        {
          id: 3,
          title: 'First Day Together',
          description: 'When our hearts first found each other 💕',
          date: '2023-01-14',
          emoji: '💕',
          order: 3
        },
        {
          id: 4,
          title: 'First "I Love You"',
          description: 'The moment everything changed ✨',
          date: '2023-03-20',
          emoji: '💖',
          order: 4
        }
      ];
      this.events = defaults;
      this.saveToLocalStorage();
      this.eventsSubject.next([...this.events]);
    }
  }

  // single saveToLocalStorage implementation earlier uses STORAGE_KEY

  async addEvent(event: Omit<TimelineEvent, 'id' | 'order'>) {
    try {
      const maxOrder = this.events.length > 0 ? Math.max(...this.events.map(e => e.order)) : 0;
      const newEvent: TimelineEvent = {
        ...event,
        id: Date.now(),
        order: maxOrder + 1
      };

      this.events.push(newEvent);
      this.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.eventsSubject.next([...this.events]);
      await this.persistOne(newEvent);
      console.log('✅ Event added:', newEvent);
    } catch (error) {
      console.error('❌ Error adding event:', error);
      throw error;
    }
  }

  async updateEvent(id: number, event: Partial<Omit<TimelineEvent, 'id' | 'order'>>) {
    try {
      const index = this.events.findIndex(e => e.id === id);
      if (index === -1) return;

      this.events[index] = { ...this.events[index], ...event };
      this.events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.eventsSubject.next([...this.events]);
      await this.persistOne(this.events[index]);
      console.log('✅ Event updated:', this.events[index]);
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: number) {
    try {
      const index = this.events.findIndex(e => e.id === id);
      if (index === -1) return;

      const removed = this.events.splice(index, 1);
      this.eventsSubject.next([...this.events]);
      await this.removeOneFromRemote(id);
      await this.persistAll();
      console.log('✅ Event deleted', removed);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  }
}
