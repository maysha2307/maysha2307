import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GalleryPhoto } from '../models/gallery-photo.model';
import { environment } from '../../environments/environment';

export interface FolderPhotos {
  precious: GalleryPhoto[];
  assthetic: GalleryPhoto[];
  autistic: GalleryPhoto[];
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private folderPhotos: FolderPhotos = { precious: [], assthetic: [], autistic: [] };
  private folderPhotosSubject = new BehaviorSubject<FolderPhotos>(this.folderPhotos);
  folderPhotos$ = this.folderPhotosSubject.asObservable();

  // Legacy support
  private photos: GalleryPhoto[] = [];
  private photosSubject = new BehaviorSubject<GalleryPhoto[]>([]);
  photos$ = this.photosSubject.asObservable();

  // Supabase configuration from environment
  private SUPABASE_URL = environment.supabase.url;
  private SUPABASE_KEY = environment.supabase.anonKey;
  private STORAGE_BUCKET = 'photo-memories';

  constructor() {
    this.loadAllFolders();
  }

  /**
   * Load photos from all 3 Supabase folders
   */
  async loadAllFolders(): Promise<void> {
    try {
      const [precious, assthetic, autistic] = await Promise.all([
        this.loadFolderFromSupabase('gallery/precious'),
        this.loadFolderFromSupabase('gallery/assthetic'),
        this.loadFolderFromSupabase('gallery/autistic')
      ]);

      this.folderPhotos = { precious, assthetic, autistic };
      this.folderPhotosSubject.next({ ...this.folderPhotos });

      // Also update legacy photos$ for backward compatibility
      this.photos = [...precious, ...assthetic, ...autistic];
      this.photosSubject.next([...this.photos]);

      // Save to localStorage as backup
      localStorage.setItem('gallery_folders', JSON.stringify(this.folderPhotos));
    } catch (error) {
      this.loadFallbackPhotos();
    }
  }

  /**
   * Load photos from a specific Supabase storage folder
   */
  private async loadFolderFromSupabase(folderPath: string): Promise<GalleryPhoto[]> {
    try {
      // List files in the folder using Supabase Storage API
      const url = `${this.SUPABASE_URL}/storage/v1/object/list/${this.STORAGE_BUCKET}`;
      
      const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': this.SUPABASE_KEY,
            'Authorization': `Bearer ${this.SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prefix: folderPath,
            limit: 100,
            offset: 0
          })
        }
      );

      if (!response.ok) {
        return [];
      }

      const files = await response.json();
      
      // Filter for image files and map to GalleryPhoto
      const photos: GalleryPhoto[] = files
        .filter((file: any) => file.name && this.isImageFile(file.name))
        .map((file: any, index: number) => {
          const publicUrl = `${this.SUPABASE_URL}/storage/v1/object/public/${this.STORAGE_BUCKET}/${folderPath}/${file.name}`;
          const folderName = folderPath.split('/').pop() || 'gallery';
          
          return {
            id: `${folderName}_${index}_${file.name}`,
            title: this.formatFileName(file.name),
            description: `Memory from ${folderName}`,
            googleDriveImageUrl: publicUrl,
            thumbnail: publicUrl
          };
        });

      return photos;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get photos for a specific folder
   */
  getFolderPhotos(folderId: string): GalleryPhoto[] {
    switch (folderId) {
      case 'precious': return this.folderPhotos.precious;
      case 'assthetic': return this.folderPhotos.assthetic;
      case 'autistic': return this.folderPhotos.autistic;
      default: return [];
    }
  }

  private loadFallbackPhotos(): void {
    // Fallback if Supabase is unavailable
    const saved = localStorage.getItem('gallery_folders');
    if (saved) {
      try {
        this.folderPhotos = JSON.parse(saved);
        this.folderPhotosSubject.next({ ...this.folderPhotos });
        this.photos = [...this.folderPhotos.precious, ...this.folderPhotos.assthetic, ...this.folderPhotos.autistic];
        this.photosSubject.next([...this.photos]);
        console.log('✅ Gallery folders loaded from localStorage');
        return;
      } catch (error) {
        console.error('Error parsing saved folders:', error);
      }
    }

    // No photos available
    this.folderPhotos = { precious: [], assthetic: [], autistic: [] };
    this.folderPhotosSubject.next({ ...this.folderPhotos });
    this.photos = [];
    this.photosSubject.next([...this.photos]);
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  private formatFileName(filename: string): string {
    return filename
      .substring(0, filename.lastIndexOf('.'))
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Refresh photos from Supabase
   */
  async refresh(): Promise<void> {
    await this.loadAllFolders();
  }
}
