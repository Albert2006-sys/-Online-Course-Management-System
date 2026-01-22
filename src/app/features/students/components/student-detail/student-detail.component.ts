import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';

import { StudentService } from '../../services/student.service';
import { EnrollmentService } from '@features/enrollments/services/enrollment.service';
import { Student, StudentStatus } from '@shared/models/student.model';
import { EnrollmentWithDetails, EnrollmentStatus } from '@shared/models/enrollment.model';

/**
 * StudentDetailComponent - Display detailed student information
 * Shows profile, enrollment history, and performance metrics
 */
@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule
  ],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss']
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  enrollments: EnrollmentWithDetails[] = [];
  isLoading = true;
  
  // Enrollment columns
  enrollmentColumns: string[] = ['course', 'enrollmentDate', 'status', 'progress', 'grade', 'actions'];
  
  // Statistics
  stats = {
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedCourses: 0,
    averageProgress: 0,
    averageGrade: 0
  };

  StudentStatus = StudentStatus;
  EnrollmentStatus = EnrollmentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudentDetails(id);
    }
  }

  /**
   * Load student details and enrollments
   */
  private loadStudentDetails(id: string): void {
    this.isLoading = true;

    this.studentService.getStudentById(Number(id)).subscribe({
      next: (student) => {
        this.student = student;
        this.loadEnrollments(id);
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.showMessage('Error loading student details', 'error');
        this.isLoading = false;
        this.router.navigate(['/students']);
      }
    });
  }

  /**
   * Load student enrollments
   */
  private loadEnrollments(studentId: string): void {
    this.enrollmentService.getAllEnrollmentsWithDetails().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments.filter(e => e.studentId === Number(studentId));
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.showMessage('Error loading enrollment history', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Calculate student statistics
   */
  private calculateStats(): void {
    this.stats.totalEnrollments = this.enrollments.length;
    this.stats.activeEnrollments = this.enrollments.filter(e => 
      e.status === EnrollmentStatus.IN_PROGRESS
    ).length;
    this.stats.completedCourses = this.enrollments.filter(e => 
      e.status === EnrollmentStatus.COMPLETED
    ).length;

    if (this.enrollments.length > 0) {
      const totalProgress = this.enrollments.reduce((sum, e) => sum + e.progress, 0);
      this.stats.averageProgress = totalProgress / this.enrollments.length;

      const gradesOnly = this.enrollments.filter(e => e.grade !== undefined);
      if (gradesOnly.length > 0) {
        const totalGrade = gradesOnly.reduce((sum, e) => sum + (e.grade || 0), 0);
        this.stats.averageGrade = totalGrade / gradesOnly.length;
      }
    }
  }

  /**
   * Edit student
   */
  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  /**
   * Delete student
   */
  deleteStudent(): void {
    if (!this.student) return;

    const confirmMessage = `Are you sure you want to delete student "${this.student.name}"?`;
    if (confirm(confirmMessage)) {
      this.studentService.deleteStudent(this.student.id).subscribe({
        next: () => {
          this.showMessage('Student deleted successfully', 'success');
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.showMessage('Error deleting student', 'error');
        }
      });
    }
  }

  /**
   * Update student status
   */
  updateStatus(newStatus: StudentStatus): void {
    if (!this.student) return;

    this.studentService.updateStudentStatus(this.student.id, newStatus).subscribe({
      next: () => {
        if (this.student) {
          this.student.status = newStatus;
        }
        this.showMessage('Student status updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showMessage('Error updating status', 'error');
      }
    });
  }

  /**
   * Unenroll from course
   */
  unenrollFromCourse(enrollment: EnrollmentWithDetails): void {
    const confirmMessage = `Remove enrollment from "${enrollment.courseName}"?`;
    if (confirm(confirmMessage)) {
      this.enrollmentService.deleteEnrollment(enrollment.id).subscribe({
        next: () => {
          this.showMessage('Enrollment removed successfully', 'success');
          if (this.student) {
            this.loadEnrollments(this.student.id.toString());
          }
        },
        error: (error) => {
          console.error('Error removing enrollment:', error);
          this.showMessage('Error removing enrollment', 'error');
        }
      });
    }
  }

  /**
   * Get status color class
   */
  getStatusColor(status: StudentStatus | EnrollmentStatus): string {
    switch (status) {
      case StudentStatus.ACTIVE:
      case EnrollmentStatus.IN_PROGRESS:
        return 'status-active';
      case StudentStatus.INACTIVE:
        return 'status-inactive';
      case StudentStatus.SUSPENDED:
        return 'status-suspended';
      case StudentStatus.GRADUATED:
      case EnrollmentStatus.COMPLETED:
        return 'status-graduated';
      case EnrollmentStatus.DROPPED:
        return 'status-dropped';
      case EnrollmentStatus.PENDING:
        return 'status-pending';
      default:
        return '';
    }
  }

  /**
   * Get progress color
   */
  getProgressColor(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  /**
   * Get grade color
   */
  getGradeColor(grade: number | undefined): string {
    if (!grade) return '';
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 70) return 'grade-fair';
    return 'grade-poor';
  }

  /**
   * Format address
   */
  formatAddress(): string {
    if (!this.student?.address) return 'N/A';
    const addr = this.student.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
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
