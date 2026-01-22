import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Uses functional guard approach (Angular 17)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Store the attempted URL for redirecting after login
    authService.redirectUrl = state.url;
    
    // Redirect to login page
    router.navigate(['/login']);
    return false;
  }

  return true;
};
