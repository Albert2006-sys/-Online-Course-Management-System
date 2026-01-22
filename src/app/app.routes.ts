import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Main application routes with lazy loading for feature modules
 * All routes except login are protected by authGuard
 * Admin/Instructor routes are additionally protected by roleGuard
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Course Management'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    title: 'Dashboard - Course Management'
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES),
    title: 'Courses - Course Management'
  },
  {
    path: 'students',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'instructor'] },
    loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES),
    title: 'Students - Course Management'
  },
  {
    path: 'enrollments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'instructor'] },
    loadChildren: () => import('./features/enrollments/enrollments.routes').then(m => m.ENROLLMENTS_ROUTES),
    title: 'Enrollments - Course Management'
  },
  {
    path: 'feedback',
    canActivate: [authGuard],
    loadChildren: () => import('./features/feedback/feedback.routes').then(m => m.FEEDBACK_ROUTES),
    title: 'Feedback - Course Management'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Unauthorized - Course Management'
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - Course Management'
  }
];
