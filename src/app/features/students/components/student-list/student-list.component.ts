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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StudentService } from '../../services/student.service';
import { Student, StudentStatus } from '@shared/models/student.model';

/**
 * StudentListComponent - Displays all students in a Material table
 * Features: Search, filter, sort, pagination, CRUD operations
 */
@Component({
  selector: 'app-student-list',
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
    MatSnackBarModule
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'email',
    'phone',
    'enrolledCourses',
    'status',
    'totalCoursesCompleted',
    'averageGrade',
    'createdAt',
    'actions'
  ];

  dataSource!: MatTableDataSource<Student>;
  students: Student[] = [];
  isLoading = true;

  // Filter properties
  searchTerm = '';
  selectedStatus = '';

  // Enums for dropdowns
  statuses = Object.values(StudentStatus);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Load all students from the service
   */
  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.dataSource = new MatTableDataSource(students);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Custom filter predicate
        this.dataSource.filterPredicate = this.createFilter();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.showMessage('Error loading students', 'error');
        this.isLoading = false;
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
      status: this.selectedStatus
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
    this.dataSource.filter = '';
  }

  /**
   * Create custom filter predicate
   */
  private createFilter(): (data: Student, filter: string) => boolean {
    return (data: Student, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      // Search term filter
      const searchMatch = !searchTerms.search || 
        data.name.toLowerCase().includes(searchTerms.search) ||
        data.email.toLowerCase().includes(searchTerms.search) ||
        (data.phone && data.phone.toLowerCase().includes(searchTerms.search));

      // Status filter
      const statusMatch = !searchTerms.status || 
        data.status === searchTerms.status;

      return !!(searchMatch && statusMatch);
    };
  }

  /**
   * Delete student
   */
  deleteStudent(student: Student, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete student "${student.name}"?`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.showMessage(`Student "${student.name}" deleted successfully`, 'success');
          this.loadStudents();
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
  updateStatus(student: Student, newStatus: StudentStatus, event: Event): void {
    event.stopPropagation();

    this.studentService.updateStudentStatus(student.id, newStatus).subscribe({
      next: () => {
        student.status = newStatus;
        this.showMessage('Student status updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showMessage('Error updating status', 'error');
      }
    });
  }

  /**
   * Get status color
   */
  getStatusColor(status: StudentStatus): string {
    switch (status) {
      case StudentStatus.ACTIVE: return 'status-active';
      case StudentStatus.INACTIVE: return 'status-inactive';
      case StudentStatus.SUSPENDED: return 'status-suspended';
      case StudentStatus.GRADUATED: return 'status-graduated';
      default: return '';
    }
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
