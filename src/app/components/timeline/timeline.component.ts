import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TimelineEvent } from '../../models/timeline-event.model';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  events$: Observable<TimelineEvent[]>;
  showAddModal = false;
  isSubmitting = false;
  editingId: number | null = null;

  // Form fields
  formTitle = '';
  formDescription = '';
  formDate = '';
  formEmoji = '💕';

  emojiOptions = ['💕', '💖', '💗', '💝', '💞', '💑', '🎂', '🎉', '🎊', '💍', '✨', '🌹', '💫', '🎁'];

  constructor(private timelineService: TimelineService) {
    this.events$ = this.timelineService.events$;
  }

  ngOnInit(): void {
    // Events are auto-loaded
  }

  openAddModal(): void {
    this.resetForm();
    this.editingId = null;
    this.showAddModal = true;
  }

  openEditModal(event: TimelineEvent): void {
    this.formTitle = event.title;
    this.formDescription = event.description;
    this.formDate = event.date;
    this.formEmoji = event.emoji;
    this.editingId = event.id;
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
    this.editingId = null;
  }

  resetForm(): void {
    this.formTitle = '';
    this.formDescription = '';
    this.formDate = '';
    this.formEmoji = '💕';
  }

  async submitEvent(): Promise<void> {
    if (!this.formTitle || !this.formDate) {
      alert('Please fill in title and date');
      return;
    }

    this.isSubmitting = true;
    try {
      if (this.editingId) {
        await this.timelineService.updateEvent(this.editingId, {
          title: this.formTitle,
          description: this.formDescription,
          date: this.formDate,
          emoji: this.formEmoji
        });
      } else {
        await this.timelineService.addEvent({
          title: this.formTitle,
          description: this.formDescription,
          date: this.formDate,
          emoji: this.formEmoji
        });
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteEvent(event: TimelineEvent): Promise<void> {
    if (confirm(`Delete "${event.title}"?`)) {
      try {
        await this.timelineService.deleteEvent(event.id);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  }

  trackById(index: number, item: TimelineEvent): number {
    return item.id;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  isLeft(event: TimelineEvent): boolean {
    // Alternate left/right based on index (every other event)
    const events = (this.events$ as any).source.value;
    const index = events.findIndex((e: TimelineEvent) => e.id === event.id);
    return index % 2 === 0;
  }
}
