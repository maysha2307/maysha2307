import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimelineEvent } from '../models/timeline-event.model';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private events: TimelineEvent[] = [];
  private eventsSubject = new BehaviorSubject<TimelineEvent[]>([]);
  events$ = this.eventsSubject.asObservable();

  constructor() {
    this.loadEvents();
    this.initializeWithDefaults();
  }

  private loadEvents() {
    const saved = localStorage.getItem('timeline_events');
    if (saved) {
      this.events = JSON.parse(saved);
      this.eventsSubject.next([...this.events]);
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

  private saveToLocalStorage() {
    localStorage.setItem('timeline_events', JSON.stringify(this.events));
  }

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
      this.saveToLocalStorage();
      this.eventsSubject.next([...this.events]);
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
      this.saveToLocalStorage();
      this.eventsSubject.next([...this.events]);
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

      this.events.splice(index, 1);
      this.saveToLocalStorage();
      this.eventsSubject.next([...this.events]);
      console.log('✅ Event deleted');
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  }
}
