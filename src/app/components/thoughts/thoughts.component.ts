import { Component, Input } from '@angular/core';
import { ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Observable } from 'rxjs';
import { Thought } from '../../models/thought.model';
import { ThoughtsService } from '../../services/thoughts.service';

@Component({
  selector: 'app-thoughts',
  templateUrl: './thoughts.component.html',
  styleUrls: ['./thoughts.component.scss']
})
export class ThoughtsComponent {

  toggleHeart(note: any, event: Event) {
    event.stopPropagation();
    note.liked = !note.liked;
  }

    activeNoteId: number | null = null;

    onNoteTouchStart(event: Event, noteId: number) {
      // Only activate if not clicking on an emoji/icon-btn or heart button
      const target = event.target as HTMLElement;
      if (target.closest('.icon-btn') || target.closest('.note-heart-btn')) return;
      this.activeNoteId = noteId;
    }

    onNoteTouchEnd(event: Event) {
      this.activeNoteId = null;
    }
  cancelEdit() {
    this.editingId = null;
  }

  deleteReply(note: Thought) {
    if (note.id != null) {
      this.thoughtsService.updateReply(note.id, '');
      this.replyEditingId = null;
    }
  }

  cancelReplyEdit(note: Thought) {
    this.replyEditingId = null;
  }
  @Input() thoughts: Thought[] | null = [];
  thoughts$: Observable<Thought[]>;

  draftText: { [id: number]: string } = {};
  draftReply: { [id: number]: string } = {};
  editingId: number | null = null;
  replyingId: number | null = null;
  replyEditingId: number | null = null;
  isAddingThought = false;

  constructor(private thoughtsService: ThoughtsService) {
    this.thoughts$ = this.thoughtsService.thoughts$;
  }

  trackById(index: number, item: Thought): number | undefined {
    return item.id;
  }

  isEditing(id: number | undefined): boolean {
    return this.editingId === id;
  }

  isReplyOpen(id: number | undefined): boolean {
    return this.replyingId === id;
  }

  creating(): boolean {
    return this.isAddingThought;
  }

  startEdit(note: Thought) {
    this.editingId = note.id!;
    if (this.draftText[note.id!] === undefined) {
      this.draftText[note.id!] = note.text;
    }
  }

  onNoteInput(note: Thought, event: Event) {
    const input = event.target as HTMLElement;
    this.draftText[note.id!] = input.innerText;
  }

  saveEdit(note: Thought) {
    if (note.id != null) {
      this.thoughtsService.updateThought(note.id, this.draftText[note.id!]);
      this.editingId = null;
    }
  }

  deleteNote(note: Thought) {
    if (note.id != null) {
      this.thoughtsService.deleteThought(note.id);
    }
  }

  async addNote() {
    if (this.isAddingThought) return; // Prevent duplicate submissions
    this.isAddingThought = true;
    try {
      await this.thoughtsService.addThought('New note...');
    } catch (error) {
      console.error('Failed to add thought:', error);
      alert('Failed to add thought. Please try again.');
    } finally {
      this.isAddingThought = false;
    }
  }

  toggleReply(note: Thought) {
    this.replyingId = this.replyingId === note.id ? null : note.id!;
    this.draftReply[note.id!] = note.reply || '';
  }

  onReplyInput(note: Thought, event: Event) {
    const input = event.target as HTMLElement;
    this.draftReply[note.id!] = input.innerText;
  }

  startReplyEdit(note: Thought) {
    this.replyEditingId = note.id!;
    this.draftReply[note.id!] = note.reply || '';
  }

  saveReply(note: Thought) {
    if (note.id != null) {
      this.thoughtsService.updateReply(note.id, this.draftReply[note.id!]);
      this.replyEditingId = null;
    }
  }

  // Drag & drop logic removed for performance
}
