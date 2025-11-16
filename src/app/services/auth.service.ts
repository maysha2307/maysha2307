import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly hardcodedUser: User = {
    username: 'mysha',
    password: 'yourpassword' // Change this to your chosen password
  };

  isAuthenticated = false;

  login(username: string, password: string): boolean {
    if (
      username === this.hardcodedUser.username &&
      password === this.hardcodedUser.password
    ) {
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
  }
}
