import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../../enrollments/services/enrollment.service';
import { Course } from '@shared/models/course.model';
import { Enrollment } from '@shared/models/enrollment.model';

/**
 * CourseDetailComponent - Displays detailed information about a course
 * Features: Course info, enrollments, statistics, edit/delete actions
 */
@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  enrollments: Enrollment[] = [];
  isLoading = true;
  courseId!: number;

  // Statistics
  stats = {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    averageGrade: 0,
    completionRate: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      this.loadCourseDetails();
    });
  }

  /**
   * Load course details and related data
   */
  loadCourseDetails(): void {
    this.isLoading = true;

    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loadEnrollments();
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.showMessage('Course not found', 'error');
        this.router.navigate(['/courses']);
        this.isLoading = false;
      }
    });
  }

  /**
   * Load enrollments for this course
   */
  loadEnrollments(): void {
    this.enrollmentService.getEnrollmentsByCourse(this.courseId).subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Calculate course statistics
   */
  calculateStats(): void {
    this.stats.totalEnrollments = this.enrollments.length;
    this.stats.activeEnrollments = this.enrollments.filter(
      e => e.status === 'Enrolled' || e.status === 'In Progress'
    ).length;
    this.stats.completedEnrollments = this.enrollments.filter(
      e => e.status === 'Completed'
    ).length;

    if (this.enrollments.length > 0) {
      const totalProgress = this.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
      this.stats.averageProgress = totalProgress / this.enrollments.length;

      const gradedEnrollments = this.enrollments.filter(e => e.grade !== undefined);
      if (gradedEnrollments.length > 0) {
        const totalGrade = gradedEnrollments.reduce((sum, e) => sum + (e.grade || 0), 0);
        this.stats.averageGrade = totalGrade / gradedEnrollments.length;
      }

      this.stats.completionRate = (this.stats.completedEnrollments / this.stats.totalEnrollments) * 100;
    }
  }

  /**
   * Navigate to edit page
   */
  editCourse(): void {
    this.router.navigate(['/courses', this.courseId, 'edit']);
  }

  /**
   * Delete course
   */
  deleteCourse(): void {
    if (confirm(`Are you sure you want to delete "${this.course?.title}"?`)) {
      this.courseService.deleteCourse(this.courseId).subscribe({
        next: () => {
          this.showMessage('Course deleted successfully', 'success');
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          this.showMessage('Error deleting course', 'error');
        }
      });
    }
  }

  /**
   * Toggle course active status
   */
  toggleStatus(): void {
    if (!this.course) return;

    const newStatus = !this.course.isActive;
    this.courseService.patchCourse(this.courseId, { isActive: newStatus }).subscribe({
      next: () => {
        if (this.course) {
          this.course.isActive = newStatus;
        }
        this.showMessage(
          `Course ${newStatus ? 'activated' : 'deactivated'} successfully`,
          'success'
        );
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showMessage('Error updating status', 'error');
      }
    });
  }

  /**
   * Go back to course list
   */
  goBack(): void {
    this.router.navigate(['/courses']);
  }

  /**
   * Get enrollment status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Enrolled': return 'status-enrolled';
      case 'Dropped': return 'status-dropped';
      default: return '';
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
