// ...existing code...
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignatureService {
  /**
   * Delete signature row from Supabase for a user
   */
  async deleteSignature(user: string): Promise<any> {
    const supabase = environment.supabase;
    // Delete all rows for this user
    const res = await fetch(`${supabase.url}/rest/v1/signatures?user=eq.${user}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabase.anonKey,
        'Authorization': `Bearer ${supabase.anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    let result = null;
    try {
      // Supabase DELETE may return empty body
      const text = await res.text();
      result = text ? JSON.parse(text) : null;
    } catch (e) {
      result = null;
    }
    if (!res.ok) {
      console.error('Supabase delete error:', result);
    } else {
      console.log('Supabase delete success:', result);
    }
    return result;
  }
  constructor() {}

  /**
   * Save signature URL to Supabase for a user
   */
  async saveSignatureUrl(user: string, url: string): Promise<any> {
    const supabase = environment.supabase;
    // First, check if a row exists for this user
    const getRes = await fetch(`${supabase.url}/rest/v1/signatures?user=eq.${user}`, {
      headers: {
        'apikey': supabase.anonKey,
        'Authorization': `Bearer ${supabase.anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const existing = await getRes.json();
    if (existing.length > 0) {
      // Update existing row
      const id = existing[0].id;
      const patchRes = await fetch(`${supabase.url}/rest/v1/signatures?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabase.anonKey,
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ url })
      });
      const result = await patchRes.json();
      if (!patchRes.ok) {
        console.error('Supabase update error:', result);
      } else {
        console.log('Supabase update success:', result);
      }
      return result;
    } else {
      // Insert new row
      const postRes = await fetch(`${supabase.url}/rest/v1/signatures`, {
        method: 'POST',
        headers: {
          'apikey': supabase.anonKey,
          'Authorization': `Bearer ${supabase.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ user, url })
      });
      const result = await postRes.json();
      if (!postRes.ok) {
        console.error('Supabase save error:', result);
      } else {
        console.log('Supabase save success:', result);
      }
      return result;
    }
  }

  /**
   * Fetch signature URL from Supabase for a user
   */
  async getSignatureUrl(user: string): Promise<string | null> {
    const supabase = environment.supabase;
    const res = await fetch(`${supabase.url}/rest/v1/signatures?user=eq.${user}&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': supabase.anonKey,
        'Authorization': `Bearer ${supabase.anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return data.length > 0 ? data[0].url : null;
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
      // Optional: folder
      // formData.append('folder', 'samples/ecommerce');

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
