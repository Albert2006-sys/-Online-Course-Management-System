import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard - Protects routes requiring specific user roles
 * Checks if current user has required role (admin or instructor)
 * Redirects to unauthorized page if user lacks required role
 * Uses functional guard approach (Angular 17)
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];
  const userRole = authService.getUserRole();

  if (!userRole || !requiredRoles.includes(userRole)) {
    // User doesn't have required role, redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
