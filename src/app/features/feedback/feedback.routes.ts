import { Routes } from '@angular/router';

/**
 * Feedback feature routes
 * Template-driven contact/feedback form
 */
export const FEEDBACK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/feedback.component')
      .then(m => m.FeedbackComponent)
  }
];
