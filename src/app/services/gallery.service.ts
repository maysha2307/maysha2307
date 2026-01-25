import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GalleryPhoto } from '../models/gallery-photo.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private photos: GalleryPhoto[] = [];
  private photosSubject = new BehaviorSubject<GalleryPhoto[]>([]);
  photos$ = this.photosSubject.asObservable();

  // Supabase configuration
  private SUPABASE_URL = 'https://dtkrnfmhdlwsgfkxooqi.supabase.co';
  private SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0a3JuZm1oZGx3c2dma3hvb3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjQ2NzUsImV4cCI6MjA1MjQzMDY3NX0.S3qUy5Pz8kGU9ZmHyLU8VcF2qJH2lPvNWvHUzJ8TyZI';
  private STORAGE_BUCKET = 'photo-memories';
  private STORAGE_FOLDER = 'gallery';

  constructor() {
    this.loadPhotos();
  }

  private loadPhotos(): void {
    // Load from hardcoded filenames (user uploaded these to Supabase)
    this.loadFromHardcodedPhotos();
  }

  private loadFromHardcodedPhotos(): void {
    try {
      // These are the exact files uploaded to your Supabase gallery folder
      const photoFilenames = [
        'IMG_20260115_230740_176.jpg',
        'IMG_20260115_230747_125.jpg',
        'SAVE_20260115_225250.jpg',
        'xerxes.jpgxxiv-20260119-0001.jpg',
        'xerxes.xxiv-20251214-0001.jpg'
      ];

      this.photos = photoFilenames
        .filter((name: string) => this.isImageFile(name))
        .map((filename: string, index: number) => {
          const publicUrl = `${this.SUPABASE_URL}/storage/v1/object/public/${this.STORAGE_BUCKET}/${this.STORAGE_FOLDER}/${filename}`;

          return {
            id: `photo_${index}`,
            title: this.formatFileName(filename),
            description: 'Memory from our journey',
            googleDriveImageUrl: publicUrl,
            thumbnail: publicUrl
          };
        });

      console.log('✅ Photos loaded from Supabase:', this.photos);
      this.saveToLocalStorage();
      this.photosSubject.next([...this.photos]);
    } catch (error) {
      console.error('❌ Error loading photos:', error);
      this.loadFallbackPhotos();
    }
  }

  private loadFallbackPhotos(): void {
    // Fallback if Supabase is unavailable
    const saved = localStorage.getItem('gallery_photos');
    if (saved) {
      try {
        this.photos = JSON.parse(saved);
        this.photosSubject.next([...this.photos]);
        console.log('✅ Gallery photos loaded from localStorage');
        return;
      } catch (error) {
        console.error('Error parsing saved photos:', error);
      }
    }

    // No photos available
    this.photos = [];
    this.photosSubject.next([...this.photos]);
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  private formatFileName(filename: string): string {
    // Convert filename to title: "photo_001.jpg" → "Photo 001"
    return filename
      .substring(0, filename.lastIndexOf('.'))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('gallery_photos', JSON.stringify(this.photos));
  }

  /**
   * Remove a photo from local view
   * (Note: Photo stays in Supabase Storage)
   */
  removePhoto(photoId: string): void {
    const index = this.photos.findIndex(p => p.id === photoId);
    if (index !== -1) {
      this.photos.splice(index, 1);
      this.saveToLocalStorage();
      this.photosSubject.next([...this.photos]);
      console.log('✅ Photo removed from gallery');
    }
  }

  /**
   * Update photo metadata (title, description)
   */
  updatePhoto(photoId: string, updates: Partial<Omit<GalleryPhoto, 'id'>>): void {
    const photo = this.photos.find(p => p.id === photoId);
    if (photo) {
      Object.assign(photo, updates);
      this.saveToLocalStorage();
      this.photosSubject.next([...this.photos]);
      console.log('✅ Photo updated:', photo);
    }
  }

  /**
   * Reset to default photos
   */
  resetToDefaults(): void {
    this.photos = this.getDefaultPhotos();
    this.saveToLocalStorage();
    this.photosSubject.next([...this.photos]);
  }

  private getDefaultPhotos(): GalleryPhoto[] {
    // Fallback empty array - photos load from Supabase
    return [];
  }
}
