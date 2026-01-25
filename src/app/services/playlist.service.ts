import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaylistSong, iTunesSearchResult } from '../models/playlist-song.model';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private readonly STORAGE_KEY = 'our_playlist';
  private songsSubject = new BehaviorSubject<PlaylistSong[]>([]);
  
  songs$ = this.songsSubject.asObservable();

  constructor() {
    this.loadSongs();
  }

  private loadSongs(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.songsSubject.next(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading playlist:', e);
    }
  }

  private saveSongs(songs: PlaylistSong[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(songs));
      this.songsSubject.next(songs);
    } catch (e) {
      console.error('Error saving playlist:', e);
    }
  }

  // Search songs using iTunes API
  async searchSongs(query: string): Promise<iTunesSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    
    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodedQuery}&media=music&limit=10`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      return data.results || [];
    } catch (e) {
      console.error('iTunes search error:', e);
      return [];
    }
  }

  addSong(result: iTunesSearchResult, note?: string): void {
    const songs = this.songsSubject.getValue();
    
    // Check if already exists
    if (songs.some(s => s.id === result.trackId.toString())) {
      return;
    }

    const newSong: PlaylistSong = {
      id: result.trackId.toString(),
      title: result.trackName,
      artist: result.artistName,
      album: result.collectionName,
      albumArt: result.artworkUrl100.replace('100x100', '300x300'), // Get higher res
      previewUrl: result.previewUrl,
      addedAt: new Date().toISOString(),
      note: note
    };

    this.saveSongs([newSong, ...songs]);
  }

  updateNote(songId: string, note: string): void {
    const songs = this.songsSubject.getValue();
    const updated = songs.map(s => 
      s.id === songId ? { ...s, note } : s
    );
    this.saveSongs(updated);
  }

  removeSong(songId: string): void {
    const songs = this.songsSubject.getValue();
    this.saveSongs(songs.filter(s => s.id !== songId));
  }

  reorderSongs(songs: PlaylistSong[]): void {
    this.saveSongs(songs);
  }
}
