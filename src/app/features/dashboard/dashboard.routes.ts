import { Routes } from '@angular/router';

/**
 * Dashboard feature routes
 * Main analytics and overview dashboard
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard.component')
      .then(m => m.DashboardComponent)
  }
];
