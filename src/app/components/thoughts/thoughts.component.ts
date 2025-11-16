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
    return false;
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

  addNote() {
    this.thoughtsService.addThought('New note...');
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
