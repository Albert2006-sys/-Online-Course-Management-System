import { Routes } from '@angular/router';

/**
 * Enrollments feature routes
 * Manages student course enrollments
 */
export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/enrollment-list/enrollment-list.component')
      .then(m => m.EnrollmentListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/enrollment-form/enrollment-form.component')
      .then(m => m.EnrollmentFormComponent)
  }
];
