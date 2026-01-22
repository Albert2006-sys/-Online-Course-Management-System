import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root App Component
 * Main entry point for the application
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
  title = 'Online Course Management Dashboard';
}
