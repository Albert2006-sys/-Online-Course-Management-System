import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FeedbackService } from '../services/feedback.service';
import { Feedback, FeedbackCategory, FeedbackPriority, FeedbackStatus } from '@shared/models/common.model';

/**
 * FeedbackComponent - Template-driven form for user feedback/contact
 * Features: Validation, category/priority selection, submission
 */
@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent {
  // Form model
  feedbackModel = {
    name: '',
    email: '',
    category: '',
    priority: '',
    message: ''
  };

  isSubmitting = false;

  // Enums for dropdowns
  categories = Object.values(FeedbackCategory);
  priorities = Object.values(FeedbackPriority);

  constructor(
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  /**
   * Submit feedback form
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.showMessage('Please fill all required fields correctly', 'error');
      return;
    }

    this.isSubmitting = true;

    const feedback: Feedback = {
      id: Date.now(),
      name: this.feedbackModel.name,
      email: this.feedbackModel.email,
      subject: this.feedbackModel.category,
      category: this.feedbackModel.category as FeedbackCategory,
      priority: this.feedbackModel.priority as FeedbackPriority,
      message: this.feedbackModel.message,
      status: FeedbackStatus.NEW,
      createdAt: new Date().toISOString()
    };

    this.feedbackService.submitFeedback(feedback).subscribe({
      next: () => {
        this.showMessage('Thank you! Your feedback has been submitted successfully.', 'success');
        this.resetForm(form);
        this.isSubmitting = false;
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.showMessage('Error submitting feedback. Please try again.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm(form: NgForm): void {
    form.resetForm();
    this.feedbackModel = {
      name: '',
      email: '',
      category: '',
      priority: '',
      message: ''
    };
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    switch (category) {
      case FeedbackCategory.GENERAL: return 'info';
      case FeedbackCategory.TECHNICAL_ISSUE: return 'bug_report';
      case FeedbackCategory.BILLING: return 'payment';
      case FeedbackCategory.COURSE_CONTENT: return 'library_books';
      case FeedbackCategory.FEATURE_REQUEST: return 'lightbulb';
      case FeedbackCategory.OTHER: return 'more_horiz';
      default: return 'feedback';
    }
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case FeedbackPriority.LOW: return 'primary';
      case FeedbackPriority.MEDIUM: return 'accent';
      case FeedbackPriority.HIGH: return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Show snackbar message
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`${type}-snackbar`]
    });
  }
}
