import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignatureService {
  private readonly STORAGE_KEY = 'signatures';

  constructor() {}

  /**
   * Delete signature for a user (localStorage)
   */
  async deleteSignature(user: string): Promise<void> {
    const signatures = this.getSignatures();
    delete signatures[user];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(signatures));
  }

  /**
   * Save signature URL for a user (localStorage)
   */
  async saveSignatureUrl(user: string, url: string): Promise<void> {
    const signatures = this.getSignatures();
    signatures[user] = url;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(signatures));
  }

  /**
   * Fetch signature URL for a user (localStorage)
   */
  async getSignatureUrl(user: string): Promise<string | null> {
    const signatures = this.getSignatures();
    return signatures[user] || null;
  }

  private getSignatures(): Record<string, string> {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * Uploads an image file to Cloudinary using unsigned upload preset.
   * Returns an Observable with upload progress and the image URL on success.
   */
  uploadSignature(file: File): Observable<{ url?: string; progress?: number; error?: any }> {
    return new Observable(observer => {
      const cloudName = 'dcjaazixq';
      const uploadPreset = 'unsigned_preset';
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          observer.next({ progress: Math.round((event.loaded / event.total) * 100) });
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          observer.next({ url: response.secure_url });
          observer.complete();
        } else {
          observer.next({ error: xhr.statusText });
          observer.complete();
        }
      };
      xhr.onerror = () => {
        observer.next({ error: 'Upload failed' });
        observer.complete();
      };
      xhr.send(formData);
    });
  }
}
