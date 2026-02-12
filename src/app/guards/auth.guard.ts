import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    // Authoritative check: ask the server-side session endpoint (cookie must be present)
    try {
      const res = await fetch('/.netlify/functions/session', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('session check failed');
      const data = await res.json();
      if (data.unlocked) {
        return true;
      }
    } catch (err) {
      console.error('Session check error', err);
    }

    this.router.navigate(['/']);
    return false;
  }
}
