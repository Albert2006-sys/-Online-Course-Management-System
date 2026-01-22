import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { EnrollmentService } from '../../services/enrollment.service';
import { EnrollmentWithDetails, EnrollmentStatus } from '@shared/models/enrollment.model';
import { EnrollmentQuickDialogComponent } from '../enrollment-quick-dialog/enrollment-quick-dialog.component';

/**
 * EnrollmentListComponent - Display all enrollments with course/student details
 * Features: Filtering by course/student/status/date, progress bars, grade display
 */
@Component({
  selector: 'app-enrollment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './enrollment-list.component.html',
  styleUrls: ['./enrollment-list.component.scss']
})
export class EnrollmentListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'studentName',
    'courseTitle',
    'enrollmentDate',
    'status',
    'progress',
    'grade',
    'completionDate',
    'actions'
  ];

  dataSource!: MatTableDataSource<EnrollmentWithDetails>;
  enrollments: EnrollmentWithDetails[] = [];
  isLoading = true;

  // Filter properties
  searchTerm = '';
  selectedStatus = '';
  selectedCourse = '';
  selectedStudent = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Enums and lists
  statuses = Object.values(EnrollmentStatus);
  courses: { id: string; title: string }[] = [];
  students: { id: string; name: string }[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEnrollments();
  }

  /**
   * Load all enrollments with details
   */
  loadEnrollments(): void {
    this.isLoading = true;
    this.enrollmentService.getAllEnrollmentsWithDetails().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        this.dataSource = new MatTableDataSource(enrollments);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Custom filter predicate
        this.dataSource.filterPredicate = this.createFilter();
        
        // Extract unique courses and students for filters
        this.extractFilterOptions();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
        this.showMessage('Error loading enrollments', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Extract unique courses and students for filter dropdowns
   */
  private extractFilterOptions(): void {
    const courseMap = new Map<number, string>();
    const studentMap = new Map<number, string>();

    this.enrollments.forEach(enrollment => {
      if (enrollment.courseName) {
        courseMap.set(enrollment.courseId, enrollment.courseName);
      }
      if (enrollment.studentName) {
        studentMap.set(enrollment.studentId, enrollment.studentName);
      }
    });

    this.courses = Array.from(courseMap.entries()).map(([id, title]) => ({ id: id.toString(), title }));
    this.students = Array.from(studentMap.entries()).map(([id, name]) => ({ id: id.toString(), name }));
  }

  openQuickEnrollment(): void {
    const dialogRef = this.dialog.open(EnrollmentQuickDialogComponent, {
      width: '460px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage('Enrollment created successfully', 'success');
        this.loadEnrollments();
      }
    });
  }

  /**
   * Apply search filter
   */
  applySearch(): void {
    this.applyFilters();
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    const filterValue = JSON.stringify({
      search: this.searchTerm.toLowerCase(),
      status: this.selectedStatus,
      course: this.selectedCourse,
      student: this.selectedStudent,
      startDate: this.startDate,
      endDate: this.endDate
    });
    
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCourse = '';
    this.selectedStudent = '';
    this.startDate = null;
    this.endDate = null;
    this.dataSource.filter = '';
  }

  /**
   * Create custom filter predicate
   */
  private createFilter(): (data: EnrollmentWithDetails, filter: string) => boolean {
    return (data: EnrollmentWithDetails, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      // Search term filter
      const searchMatch = !searchTerms.search || 
        (data.studentName?.toLowerCase().includes(searchTerms.search) || false) ||
        (data.courseName?.toLowerCase().includes(searchTerms.search) || false);

      // Status filter
      const statusMatch = !searchTerms.status || data.status === searchTerms.status;

      // Course filter
      const courseMatch = !searchTerms.course || data.courseId === searchTerms.course;

      // Student filter
      const studentMatch = !searchTerms.student || data.studentId === searchTerms.student;

      // Date range filter
      let dateMatch = true;
      if (searchTerms.startDate || searchTerms.endDate) {
        const enrollDate = new Date(data.enrollmentDate);
        
        if (searchTerms.startDate && enrollDate < new Date(searchTerms.startDate)) {
          dateMatch = false;
        }
        if (searchTerms.endDate && enrollDate > new Date(searchTerms.endDate)) {
          dateMatch = false;
        }
      }

      return searchMatch && statusMatch && courseMatch && studentMatch && dateMatch;
    };
  }

  /**
   * Delete enrollment
   */
  deleteEnrollment(enrollment: EnrollmentWithDetails, event: Event): void {
    event.stopPropagation();

    const message = `Remove enrollment of "${enrollment.studentName}" from "${enrollment.courseName}"?`;
    if (confirm(message)) {
      this.enrollmentService.deleteEnrollment(enrollment.id).subscribe({
        next: () => {
          this.showMessage('Enrollment removed successfully', 'success');
          this.loadEnrollments();
        },
        error: (error) => {
          console.error('Error deleting enrollment:', error);
          this.showMessage('Error removing enrollment', 'error');
        }
      });
    }
  }

  /**
   * Update enrollment progress
   */
  updateProgress(enrollment: EnrollmentWithDetails, event: Event): void {
    event.stopPropagation();

    const newProgress = prompt(`Update progress for "${enrollment.studentName}" (0-100):`, enrollment.progress.toString());
    
    if (newProgress !== null) {
      const progress = Math.max(0, Math.min(100, parseInt(newProgress, 10)));
      
      this.enrollmentService.updateProgress(enrollment.id, progress).subscribe({
        next: () => {
          enrollment.progress = progress;
          this.showMessage('Progress updated successfully', 'success');
        },
        error: (error) => {
          console.error('Error updating progress:', error);
          this.showMessage('Error updating progress', 'error');
        }
      });
    }
  }

  /**
   * Submit grade
   */
  submitGrade(enrollment: EnrollmentWithDetails, event: Event): void {
    event.stopPropagation();

    const currentGrade = enrollment.grade !== undefined ? enrollment.grade.toString() : '';
    const newGrade = prompt(`Submit grade for "${enrollment.studentName}" (0-100):`, currentGrade);
    
    if (newGrade !== null) {
      const grade = Math.max(0, Math.min(100, parseFloat(newGrade)));
      
      this.enrollmentService.submitGrade(enrollment.id, grade).subscribe({
        next: () => {
          enrollment.grade = grade;
          this.showMessage('Grade submitted successfully', 'success');
        },
        error: (error) => {
          console.error('Error submitting grade:', error);
          this.showMessage('Error submitting grade', 'error');
        }
      });
    }
  }

  /**
   * Get status color class
   */
  getStatusColor(status: EnrollmentStatus): string {
    switch (status) {
      case EnrollmentStatus.IN_PROGRESS: return 'status-active';
      case EnrollmentStatus.COMPLETED: return 'status-completed';
      case EnrollmentStatus.DROPPED: return 'status-dropped';
      case EnrollmentStatus.PENDING: return 'status-pending';
      default: return '';
    }
  }

  /**
   * Get progress color class
   */
  getProgressColor(progress: number): string {
    if (progress >= 80) return 'progress-high';
    if (progress >= 50) return 'progress-medium';
    return 'progress-low';
  }

  /**
   * Get grade color class
   */
  getGradeColor(grade: number | undefined): string {
    if (!grade) return '';
    if (grade >= 90) return 'grade-excellent';
    if (grade >= 80) return 'grade-good';
    if (grade >= 70) return 'grade-fair';
    return 'grade-poor';
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
