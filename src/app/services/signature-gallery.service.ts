import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GalleryPhoto } from '../models/gallery-photo.model';
import { environment } from '../../environments/environment';

export interface SignaturePhotos {
  mashooq: GalleryPhoto[];
  aayesha: GalleryPhoto[];
}

@Injectable({ providedIn: 'root' })
export class SignatureGalleryService {
  private signaturePhotos: SignaturePhotos = { mashooq: [], aayesha: [] };
  private signaturePhotosSubject = new BehaviorSubject<SignaturePhotos>(this.signaturePhotos);
  signaturePhotos$ = this.signaturePhotosSubject.asObservable();

  private SUPABASE_URL = environment.supabase.url;
  private SUPABASE_KEY = environment.supabase.anonKey;
  private STORAGE_BUCKET = 'photo-memories';

  constructor() {
    this.loadAllSignatures();
  }

  async loadAllSignatures(): Promise<void> {
    try {
      const [mashooq, aayesha] = await Promise.all([
        this.loadFolderFromSupabase("gallery/signatures/mashooq-sign"),
        this.loadFolderFromSupabase("gallery/signatures/aayesha-sign")
      ]);
      this.signaturePhotos = { mashooq, aayesha };
      this.signaturePhotosSubject.next({ ...this.signaturePhotos });
    } catch (error) {
      this.signaturePhotos = { mashooq: [], aayesha: [] };
      this.signaturePhotosSubject.next({ ...this.signaturePhotos });
    }
  }

  private async loadFolderFromSupabase(folderPath: string): Promise<GalleryPhoto[]> {
    try {
      const url = `${this.SUPABASE_URL}/storage/v1/object/list/${this.STORAGE_BUCKET}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: folderPath + '/',
          limit: 100,
          offset: 0
        })
      });
      if (!response.ok) {
        return [];
      }
      const files = await response.json();
      const photos: GalleryPhoto[] = files
        .filter((file: any) => file.name && this.isImageFile(file.name))
        .map((file: any, index: number) => {
          const publicUrl = `${this.SUPABASE_URL}/storage/v1/object/public/${this.STORAGE_BUCKET}/${encodeURIComponent(folderPath)}/${encodeURIComponent(file.name)}`;
          return {
            id: `${folderPath}_${index}_${file.name}`,
            title: this.formatFileName(file.name),
            googleDriveImageUrl: publicUrl,
            thumbnail: publicUrl
          };
        });
      return photos;
    } catch (error) {
      return [];
    }
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

  async refresh(): Promise<void> {
    await this.loadAllSignatures();
  }
}
