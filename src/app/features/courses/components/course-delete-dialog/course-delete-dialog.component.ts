import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Course } from '@shared/models/course.model';

/**
 * CourseDeleteDialogComponent - Confirmation dialog for deleting a course
 */
@Component({
  selector: 'app-course-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Confirm Delete
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete the following course?</p>
      <div class="course-info">
        <strong>{{ data.course.title }}</strong>
        <p>Instructor: {{ data.course.instructor }}</p>
        <p>Enrollments: {{ data.course.enrollmentCount }}</p>
      </div>
      <p class="warning-text">
        <mat-icon>info</mat-icon>
        This action cannot be undone. All related data will be permanently deleted.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        <mat-icon>delete</mat-icon>
        Delete Course
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #d32f2f;
    }

    .course-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;

      strong {
        font-size: 16px;
        color: #333;
      }

      p {
        margin: 8px 0 0 0;
        color: #666;
        font-size: 14px;
      }
    }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f57c00;
      font-size: 14px;
      margin-top: 16px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class CourseDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CourseDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { course: Course }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
