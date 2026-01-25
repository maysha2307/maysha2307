import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PlaylistSong, iTunesSearchResult } from '../../models/playlist-song.model';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  songs: PlaylistSong[] = [];
  searchQuery = '';
  searchResults: iTunesSearchResult[] = [];
  isSearching = false;
  showSearch = false;
  
  // Currently playing preview
  currentlyPlaying: string | null = null;
  audio: HTMLAudioElement | null = null;
  
  // Note editing
  editingNoteId: string | null = null;
  noteText = '';

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    this.playlistService.songs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(songs => {
        this.songs = songs;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPreview();
  }

  openSearch(): void {
    this.showSearch = true;
    this.searchQuery = '';
    this.searchResults = [];
  }

  closeSearch(): void {
    this.showSearch = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  async onSearch(): Promise<void> {
    if (this.searchQuery.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.searchResults = await this.playlistService.searchSongs(this.searchQuery);
    this.isSearching = false;
  }

  addSong(result: iTunesSearchResult): void {
    this.playlistService.addSong(result);
    // Visual feedback - briefly show added
  }

  isSongAdded(trackId: number): boolean {
    return this.songs.some(s => s.id === trackId.toString());
  }

  removeSong(songId: string): void {
    this.playlistService.removeSong(songId);
  }

  // Preview playback
  togglePreview(song: PlaylistSong): void {
    if (!song.previewUrl) return;

    if (this.currentlyPlaying === song.id) {
      this.stopPreview();
    } else {
      this.stopPreview();
      this.audio = new Audio(song.previewUrl);
      this.audio.volume = 0.5;
      this.audio.play();
      this.currentlyPlaying = song.id;
      
      this.audio.onended = () => {
        this.currentlyPlaying = null;
      };
    }
  }

  stopPreview(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.currentlyPlaying = null;
  }

  // Note editing
  startEditNote(song: PlaylistSong): void {
    this.editingNoteId = song.id;
    this.noteText = song.note || '';
  }

  saveNote(songId: string): void {
    this.playlistService.updateNote(songId, this.noteText);
    this.editingNoteId = null;
    this.noteText = '';
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.noteText = '';
  }
}
