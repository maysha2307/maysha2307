import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlaylistSong, iTunesSearchResult } from '../models/playlist-song.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private readonly STORAGE_KEY = 'our_playlist';
  private songsSubject = new BehaviorSubject<PlaylistSong[]>([]);
  private supabase: SupabaseClient | null = null;
  private useSupabase = false;
  
  songs$ = this.songsSubject.asObservable();

  constructor() {
    try {
      if (environment && environment.supabase && environment.supabase.url && environment.supabase.anonKey) {
        this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
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
      if (!ok) this.loadSongs();
    } else {
      this.loadSongs();
    }
  }

  private async loadFromSupabase(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase!.from('playlist_songs').select('*').order('added_at', { ascending: false });
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        const songs: PlaylistSong[] = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          album: r.album,
          albumArt: r.album_art,
          previewUrl: r.preview_url,
          addedAt: r.added_at,
          note: r.note
        }));
        this.saveSongs(songs);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to load playlist from Supabase, falling back to localStorage', err);
      return false;
    }
  }

  private async persistAll() {
    const songs = this.songsSubject.getValue();
    if (this.useSupabase && this.supabase) {
      try {
        const payload = songs.map(s => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          album: s.album,
          album_art: s.albumArt,
          preview_url: s.previewUrl,
          added_at: s.addedAt,
          note: s.note
        }));
        const { error } = await this.supabase.from('playlist_songs').upsert(payload);
        if (error) throw error;
      } catch (err) {
        console.warn('Persist playlist to Supabase failed', err);
      }
    }
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
      // persist to Supabase in background if available
      try { void this.persistAll(); } catch (e) { /* ignore */ }
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
    // Remove from Supabase if enabled
    if (this.useSupabase && this.supabase) {
      this.supabase
        .from('playlist_songs')
        .delete()
        .eq('id', songId)
        .then(({ error }) => {
          if (error) {
            console.warn('Failed to delete song from Supabase', error);
          }
        });
    }
  }

  reorderSongs(songs: PlaylistSong[]): void {
    this.saveSongs(songs);
  }
}
