import { ElementRef, ViewChildren, QueryList, AfterViewInit, ViewChild, OnDestroy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TimelineEvent } from '../../models/timeline-event.model';
import { TimelineService } from '../../services/timeline.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('timelineCard') timelineCards!: QueryList<ElementRef>;
  @ViewChild('movingDot') movingDot!: ElementRef;
  @ViewChild('timelineContainer') timelineContainer!: ElementRef;
  activeCardIndex: number = 0;
  private intersectionObserver?: IntersectionObserver;
  private cardsChangesSub: any;
  private ticking = false;

    ngAfterViewInit(): void {
      if (typeof window === 'undefined') return;

      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // 50% of card visible
      };

      const callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).getAttribute('data-index'));
            this.activeCardIndex = idx;
          }
        });
      };

      // create and keep observer so we can reuse/disconnect later
      this.intersectionObserver = new IntersectionObserver(callback, options);

      const observeAll = () => {
        if (!this.timelineCards || !this.intersectionObserver) return;
        // disconnect previous observations
        try { this.intersectionObserver.disconnect(); } catch (e) {}
        this.timelineCards.forEach((card, idx) => {
          try {
            card.nativeElement.setAttribute('data-index', idx);
            this.intersectionObserver!.observe(card.nativeElement);
          } catch (e) {
            // ignore elements that are not ready
          }
        });
        // update moving dot after observing
        setTimeout(() => this.updateMovingDot(), 50);
      };

      // initial observe (cards may already be present)
      setTimeout(observeAll, 0);

      // re-observe when the QueryList changes (e.g., after async load)
      this.cardsChangesSub = this.timelineCards.changes.subscribe(() => {
        setTimeout(observeAll, 0);
      });

      // smooth moving dot: update on scroll/resize
      const onScroll = () => {
        if (!this.ticking) {
          this.ticking = true;
          requestAnimationFrame(() => {
            this.updateMovingDot();
            this.ticking = false;
          });
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      // store listeners for cleanup
      (this as any)._onScroll = onScroll;
    }

    ngOnDestroy(): void {
      try { if (this.intersectionObserver) this.intersectionObserver.disconnect(); } catch (e) {}
      try { if (this.cardsChangesSub) this.cardsChangesSub.unsubscribe(); } catch (e) {}
      try { window.removeEventListener('scroll', (this as any)._onScroll); window.removeEventListener('resize', (this as any)._onScroll); } catch (e) {}
    }
  events$: Observable<TimelineEvent[]>;
  showAddModal = false;
  isSubmitting = false;
  editingId: number | null = null;

  // Form fields
  formTitle = '';
  formDescription = '';
  formDate = '';
  formEmoji = '💕';

  // Updated emoji options: replaced couple emoji with rainbow and added more choices
  emojiOptions = [
    '💕', '💖', '💗', '💝', '💞', '🌈', '🎂', '🎉', '🎊', '💍', '✨', '🌹', '💫', '🎁', '🌟', '📸', '🏖️', '🎵'
  ];

  constructor(private timelineService: TimelineService, private dialog: DialogService) {
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
      await this.dialog.alert('Please fill in title and date');
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
      await this.dialog.alert('Failed to save event. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteEvent(event: TimelineEvent): Promise<void> {
    const titleForDialog = this.truncateTitleForDialog(event.title || '');
    const ok = await this.dialog.confirm(`Delete "${titleForDialog}"?`);
    if (!ok) return;
    try {
      await this.timelineService.deleteEvent(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
      await this.dialog.alert('Failed to delete event. Please try again.');
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

  private updateMovingDot(): void {
    try {
      if (!this.movingDot || !this.timelineContainer || !this.timelineCards) return;
      const cards = this.timelineCards.toArray();
      if (!cards.length) return;
      const viewportCenter = window.innerHeight / 2;
      let minDist = Number.POSITIVE_INFINITY;
      let closestIdx = -1;
      let closestRect: DOMRect | null = null;
      cards.forEach((c, idx) => {
        const rect = c.nativeElement.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
          closestRect = rect;
        }
      });
      if (closestIdx === -1 || !closestRect) return;
      // compute target relative to viewport center (fixed positioning)
      const targetTopViewport = (closestRect as any).top + (closestRect as any).height / 2;
      this.movingDot.nativeElement.style.top = `${targetTopViewport}px`;
      // also update activeCardIndex for legacy styling if used
      this.activeCardIndex = closestIdx;
    } catch (e) {
      // ignore
    }
  }

  private truncateTitleForDialog(title: string): string {
    const words = (title || '').trim().split(/\s+/).filter(Boolean);
    if (words.length <= 3) return title;
    return words.slice(0, 3).join(' ') + ' ...';
  }
}
