import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BucketItem, BUCKET_CATEGORIES } from '../../models/bucket-item.model';
import { BucketListService } from '../../services/bucket-list.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-memory-recap',
  templateUrl: './memory-recap.component.html',
  styleUrls: ['./memory-recap.component.scss']
})
export class MemoryRecapComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  bucketItems: BucketItem[] = [];
  categories = BUCKET_CATEGORIES;
  
  // UI State
  showAddForm = false;
  showCompleteModal = false;
  selectedItem: BucketItem | null = null;
  activeFilter: string = 'all';
  
  // Form fields
  newTitle = '';
  newDescription = '';
  newCategory: BucketItem['category'] = 'date-idea';
  newEmoji = '💫';
  completeNote = '';

  // Emoji options
  emojiOptions = ['💫', '✨', '🌟', '💕', '🎯', '🌈', '🦋', '🌸', '🎀', '💝', '🥂', '🎉'];

  constructor(private bucketService: BucketListService, private dialog: DialogService) {}

  ngOnInit(): void {
    this.bucketService.bucketItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.bucketItems = items;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredItems(): BucketItem[] {
    let items = this.bucketItems;
    if (this.activeFilter !== 'all') {
      if (this.activeFilter === 'completed') {
        items = items.filter(i => i.isCompleted);
      } else if (this.activeFilter === 'pending') {
        items = items.filter(i => !i.isCompleted);
      } else {
        items = items.filter(i => i.category === this.activeFilter);
      }
    }
    // Sort: pending first, then by date
    return items.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  get completedCount(): number {
    return this.bucketItems.filter(i => i.isCompleted).length;
  }

  get totalCount(): number {
    return this.bucketItems.length;
  }

  get progressPercent(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.completedCount / this.totalCount) * 100);
  }

  getCategoryEmoji(category: string): string {
    return this.categories.find(c => c.id === category)?.emoji || '💫';
  }

  getCategoryName(category: string): string {
    return this.categories.find(c => c.id === category)?.name || category;
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.resetForm();
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newCategory = 'date-idea';
    this.newEmoji = '💫';
  }

  addItem(): void {
    if (!this.newTitle.trim()) return;

    this.bucketService.addItem({
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      category: this.newCategory,
      emoji: this.newEmoji
    });

    this.closeAddForm();
  }

  openCompleteModal(item: BucketItem): void {
    this.selectedItem = item;
    this.completeNote = '';
    this.showCompleteModal = true;
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
    this.selectedItem = null;
    this.completeNote = '';
  }

  confirmComplete(): void {
    if (this.selectedItem) {
      this.bucketService.completeItem(this.selectedItem.id, this.completeNote.trim() || undefined);
      this.closeCompleteModal();
    }
  }

  toggleComplete(item: BucketItem): void {
    if (item.isCompleted) {
      this.bucketService.uncompleteItem(item.id);
    } else {
      this.openCompleteModal(item);
    }
  }

  async deleteItem(item: BucketItem): Promise<void> {
    const ok = await this.dialog.confirm('Remove this dream from your bucket list?');
    if (!ok) return;
    this.bucketService.deleteItem(item.id);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }

  trackByItemId(index: number, item: BucketItem): string {
    return item.id;
  }
}
