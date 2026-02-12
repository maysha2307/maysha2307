import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BucketItem } from '../models/bucket-item.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { supabase } from './supabase-client';

@Injectable({
  providedIn: 'root'
})
export class BucketListService {
  private bucketItemsSubject = new BehaviorSubject<BucketItem[]>([]);
  bucketItems$ = this.bucketItemsSubject.asObservable();

  private readonly STORAGE_KEY = 'bucket_list_items';
  private supabase: SupabaseClient | null = null;
  private useSupabase = false;

  constructor() {
    try {
      if (environment && environment.supabase && environment.supabase.url && environment.supabase.anonKey) {
        this.supabase = supabase; // use shared singleton client
        this.useSupabase = true;
      }
    } catch (e) {
      this.supabase = null;
      this.useSupabase = false;
    }
    this.init();
  }

  private async init() {
    if (this.useSupabase && this.supabase) {
      const ok = await this.loadFromSupabase();
      if (!ok) this.loadItems();
    } else {
      this.loadItems();
    }
  }

  private async loadFromSupabase(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase!.from('bucket_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        const items: BucketItem[] = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          isCompleted: r.is_completed,
          completedDate: r.completed_date,
          completedNote: r.completed_note,
          createdAt: r.created_at,
          emoji: r.emoji
        }));
        this.saveItems(items);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to load bucket items from Supabase, falling back to localStorage', err);
      return false;
    }
  }

  private async persistAll() {
    const items = this.bucketItemsSubject.getValue();
    if (this.useSupabase && this.supabase) {
      try {
        const payload = items.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          is_completed: i.isCompleted,
          completed_date: i.completedDate,
          completed_note: i.completedNote,
          created_at: i.createdAt,
          emoji: i.emoji
        }));
        const { error } = await this.supabase.from('bucket_items').upsert(payload);
        if (error) throw error;
      } catch (err) {
        console.warn('Persist bucket items to Supabase failed', err);
      }
    }
  }

  private loadItems(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as BucketItem[];
        this.bucketItemsSubject.next(items);
      }
    } catch (error) {
      console.error('Error loading bucket list:', error);
      this.bucketItemsSubject.next([]);
    }
  }

  private saveItems(items: BucketItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      this.bucketItemsSubject.next(items);
      // persist to Supabase in background if available
      try { void this.persistAll(); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error saving bucket list:', error);
    }
  }

  addItem(item: Omit<BucketItem, 'id' | 'createdAt' | 'isCompleted'>): void {
    const newItem: BucketItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    const items = [...this.bucketItemsSubject.value, newItem];
    this.saveItems(items);
  }

  updateItem(id: string, updates: Partial<BucketItem>): void {
    const items = this.bucketItemsSubject.value.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.saveItems(items);
  }

  completeItem(id: string, note?: string): void {
    this.updateItem(id, {
      isCompleted: true,
      completedDate: new Date().toISOString(),
      completedNote: note
    });
  }

  uncompleteItem(id: string): void {
    this.updateItem(id, {
      isCompleted: false,
      completedDate: undefined,
      completedNote: undefined
    });
  }

  deleteItem(id: string): void {
    const items = this.bucketItemsSubject.value.filter(item => item.id !== id);
    this.saveItems(items);
  }

  private generateId(): string {
    return 'bucket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
