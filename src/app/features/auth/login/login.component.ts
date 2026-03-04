import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <!-- Animated Background Orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Login Card -->
      <div class="login-card">
        <!-- Logo / Brand -->
        <div class="brand">
          <div class="brand-icon">
            <mat-icon>school</mat-icon>
          </div>
          <div class="brand-text">
            <h1>EduManage</h1>
            <p>Online Course Management</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Form -->
        <form #loginForm="ngForm" (ngSubmit)="onLogin()" class="login-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput [(ngModel)]="username" name="username" required
                   placeholder="Enter your username" autocomplete="username">
            <mat-icon matPrefix>person_outline</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'"
                   [(ngModel)]="password" name="password" required
                   placeholder="Enter your password" autocomplete="current-password">
            <mat-icon matPrefix>lock_outline</mat-icon>
            <button mat-icon-button matSuffix type="button"
                    (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-raised-button type="submit" class="login-btn"
                  [disabled]="!loginForm.form.valid || isLoading">
            <mat-spinner *ngIf="isLoading" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!isLoading">arrow_forward</mat-icon>
            <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="demo-section">
          <span class="demo-label">Demo Credentials</span>
          <div class="demo-cards">
            <button class="demo-card" type="button" (click)="fillAdmin()">
              <mat-icon>admin_panel_settings</mat-icon>
              <div>
                <div class="demo-role">Admin</div>
                <div class="demo-creds">admin / admin123</div>
              </div>
            </button>
            <button class="demo-card" type="button" (click)="fillInstructor()">
              <mat-icon>person</mat-icon>
              <div>
                <div class="demo-role">Instructor</div>
                <div class="demo-creds">instructor / inst123</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0a0e1a;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(118, 75, 162, 0.12) 0%, transparent 55%),
        radial-gradient(ellipse at 60% 80%, rgba(79, 172, 254, 0.08) 0%, transparent 50%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    /* Animated Orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
      animation: orb-move 12s ease-in-out infinite;
      pointer-events: none;
    }

    .orb-1 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #667eea, transparent 70%);
      top: -100px; left: -100px;
      animation-duration: 14s;
    }

    .orb-2 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #764ba2, transparent 70%);
      bottom: -80px; right: -80px;
      animation-duration: 18s;
      animation-delay: -5s;
    }

    .orb-3 {
      width: 250px; height: 250px;
      background: radial-gradient(circle, #4facfe, transparent 70%);
      top: 40%; left: 60%;
      animation-duration: 22s;
      animation-delay: -8s;
      opacity: 0.2;
    }

    @keyframes orb-move {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33%  { transform: translate(30px, -25px) scale(1.08); }
      66%  { transform: translate(-20px, 20px) scale(0.95); }
    }

    /* Card */
    .login-card {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04),
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 0 80px rgba(102, 126, 234, 0.1);
      animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      position: relative;
      z-index: 1;

      /* Top gradient line */
      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #667eea, #764ba2, #f5576c, transparent);
        border-radius: 24px 24px 0 0;
      }
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .brand-icon {
      width: 56px; height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      flex-shrink: 0;

      mat-icon {
        font-size: 28px;
        width: 28px; height: 28px;
        color: #fff;
      }
    }

    .brand-text {
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea, #f5576c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.5px;
      }

      p {
        margin: 2px 0 0;
        font-size: 13px;
        color: #94a3b8;
        font-weight: 400;
      }
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      margin-bottom: 28px;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width { width: 100%; }

    /* Styled Login Button */
    .login-btn {
      width: 100%;
      height: 50px;
      border-radius: 12px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      letter-spacing: 0.3px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: #fff !important;
      border: none;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.45) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s ease !important;
      margin-top: 8px;

      &:hover:not([disabled]) {
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.65) !important;
        transform: translateY(-2px);
      }

      &[disabled] {
        opacity: 0.4 !important;
        transform: none !important;
      }

      mat-icon {
        font-size: 20px;
        width: 20px; height: 20px;
        color: #fff;
      }

      mat-spinner {
        --mdc-circular-progress-active-indicator-color: #fff;
      }
    }

    /* Demo Section */
    .demo-section {
      margin-top: 28px;
    }

    .demo-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4b5563;
      margin-bottom: 12px;
      text-align: center;
    }

    .demo-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .demo-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      text-align: left;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.35);
        transform: translateY(-2px);
      }

      mat-icon {
        font-size: 20px;
        width: 20px; height: 20px;
        color: #667eea;
      }

      .demo-role {
        font-size: 12px;
        font-weight: 700;
        color: #f0f4ff;
        line-height: 1.2;
      }

      .demo-creds {
        font-size: 11px;
        color: #64748b;
        font-family: 'JetBrains Mono', monospace;
        margin-top: 2px;
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  hidePassword = true;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  fillAdmin(): void {
    this.username = 'admin';
    this.password = 'admin123';
  }

  fillInstructor(): void {
    this.username = 'instructor';
    this.password = 'inst123';
  }

  onLogin(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.snackBar.open('Welcome back! 👋', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid credentials. Please try again.', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
