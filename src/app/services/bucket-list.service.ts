import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BucketItem } from '../models/bucket-item.model';

@Injectable({
  providedIn: 'root'
})
export class BucketListService {
  private bucketItemsSubject = new BehaviorSubject<BucketItem[]>([]);
  bucketItems$ = this.bucketItemsSubject.asObservable();

  private readonly STORAGE_KEY = 'bucket_list_items';

  constructor() {
    this.loadItems();
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
