import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card class="error-card">
        <mat-card-content>
          <mat-icon class="error-icon">block</mat-icon>
          <h1>403 - Unauthorized</h1>
          <p>You don't have permission to access this resource.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .error-card {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }

    .error-icon {
      font-size: 100px;
      width: 100px;
      height: 100px;
      color: #f44336;
    }

    h1 {
      margin: 20px 0;
      color: #333;
    }

    p {
      margin-bottom: 30px;
      color: #666;
    }

    button {
      gap: 8px;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
