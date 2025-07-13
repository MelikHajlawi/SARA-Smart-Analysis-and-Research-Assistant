import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Check if session exists in localStorage and is valid
    const session = localStorage.getItem('session');
    if (!session) {
      this.authService.clearSession();
      return this.router.createUrlTree(['/signin']);
    }
    try {
      const data = JSON.parse(session);
      if (Date.now() > data.expiration) {
        this.authService.clearSession();
        return this.router.createUrlTree(['/signin']);
      }
      return true;
    } catch {
      this.authService.clearSession();
      return this.router.createUrlTree(['/signin']);
    }
  }
}