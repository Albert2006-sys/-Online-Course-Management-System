import { Routes } from '@angular/router';

/**
 * Courses feature routes with child routing for course details
 * Supports CRUD operations on courses
 */
export const COURSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/course-list/course-list.component')
      .then(m => m.CourseListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/course-form/course-form.component')
      .then(m => m.CourseFormComponent),
    data: { mode: 'create' }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/course-detail/course-detail.component')
      .then(m => m.CourseDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./components/course-form/course-form.component')
      .then(m => m.CourseFormComponent),
    data: { mode: 'edit' }
  }
];
