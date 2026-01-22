import { Routes } from '@angular/router';

/**
 * Students feature routes
 * Allows admin/instructor to manage student records
 */
export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/student-list/student-list.component')
      .then(m => m.StudentListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/student-form/student-form.component')
      .then(m => m.StudentFormComponent),
    data: { mode: 'create' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/student-detail/student-detail.component')
      .then(m => m.StudentDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/student-form/student-form.component')
      .then(m => m.StudentFormComponent),
    data: { mode: 'edit' }
  }
];
