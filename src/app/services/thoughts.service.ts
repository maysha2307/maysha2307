import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Thought } from '../models/thought.model';

@Injectable({ providedIn: 'root' })
export class ThoughtsService {
  private thoughts: Thought[] = [];
  private thoughtsSubject = new BehaviorSubject<Thought[]>(this.thoughts);
  thoughts$ = this.thoughtsSubject.asObservable();

  private readonly STORAGE_KEY = 'thoughts_backup';

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.thoughts = JSON.parse(saved);
      this.thoughtsSubject.next([...this.thoughts]);
    } else {
      this.thoughts = [];
      this.thoughtsSubject.next([]);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.thoughts));
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
    this.saveToLocalStorage();
  }

  async updateThought(id: number, text: string) {
    const thought = this.thoughts.find(t => t.id === id);
    if (!thought) return;
    thought.text = text;
    this.thoughtsSubject.next([...this.thoughts]);
    this.saveToLocalStorage();
  }

  async deleteThought(id: number) {
    const index = this.thoughts.findIndex(t => t.id === id);
    if (index === -1) return;
    this.thoughts.splice(index, 1);
    this.thoughtsSubject.next([...this.thoughts]);
    this.saveToLocalStorage();
  }

  async updateReply(id: number, reply: string) {
    const thought = this.thoughts.find(t => t.id === id);
    if (!thought) return;
    thought.reply = reply;
    this.thoughtsSubject.next([...this.thoughts]);
    this.saveToLocalStorage();
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
      this.saveToLocalStorage();
    }
  }
}
