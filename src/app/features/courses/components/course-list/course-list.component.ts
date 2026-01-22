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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HighlightDirective } from '@shared/directives/highlight.directive';

import { CourseService } from '../../services/course.service';
import { Course, CourseCategory, CourseLevel } from '@shared/models/course.model';
import { CourseDeleteDialogComponent } from '../course-delete-dialog/course-delete-dialog.component';

/**
 * CourseListComponent - Displays all courses in a Material table
 * Features: Search, filter, sort, pagination, CRUD operations
 */
@Component({
  selector: 'app-course-list',
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
    MatDialogModule,
    MatSnackBarModule,
    HighlightDirective
  ],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'category',
    'level',
    'duration',
    'price',
    'enrollmentCount',
    'popularity',
    'isActive',
    'actions'
  ];

  dataSource!: MatTableDataSource<Course>;
  courses: Course[] = [];
  isLoading = true;

  // Filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  selectedStatus = '';

  // Enums for dropdowns
  categories = Object.values(CourseCategory);
  levels = Object.values(CourseLevel);
  statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private courseService: CourseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  /**
   * Load all courses from the service
   */
  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.dataSource = new MatTableDataSource(courses);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Custom filter predicate
        this.dataSource.filterPredicate = this.createFilter();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.showMessage('Error loading courses', 'error');
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
      category: this.selectedCategory,
      level: this.selectedLevel,
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
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.selectedStatus = '';
    this.dataSource.filter = '';
  }

  /**
   * Create custom filter predicate
   */
  private createFilter(): (data: Course, filter: string) => boolean {
    return (data: Course, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      // Search term filter
      const searchMatch = !searchTerms.search || 
        data.title.toLowerCase().includes(searchTerms.search) ||
        data.description.toLowerCase().includes(searchTerms.search) ||
        data.instructor.toLowerCase().includes(searchTerms.search) ||
        data.category.toLowerCase().includes(searchTerms.search);

      // Category filter
      const categoryMatch = !searchTerms.category || 
        data.category === searchTerms.category;

      // Level filter
      const levelMatch = !searchTerms.level || 
        data.level === searchTerms.level;

      // Status filter
      const statusMatch = !searchTerms.status || 
        data.isActive.toString() === searchTerms.status;

      return searchMatch && categoryMatch && levelMatch && statusMatch;
    };
  }

  /**
   * Delete course with confirmation dialog
   */
  deleteCourse(course: Course, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CourseDeleteDialogComponent, {
      width: '400px',
      data: { course }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.deleteCourse(course.id).subscribe({
          next: () => {
            this.showMessage(`Course "${course.title}" deleted successfully`, 'success');
            this.loadCourses();
          },
          error: (error) => {
            console.error('Error deleting course:', error);
            this.showMessage('Error deleting course', 'error');
          }
        });
      }
    });
  }

  /**
   * Toggle course active status
   */
  toggleStatus(course: Course, event: Event): void {
    event.stopPropagation();

    const newStatus = !course.isActive;
    this.courseService.patchCourse(course.id, { isActive: newStatus }).subscribe({
      next: () => {
        course.isActive = newStatus;
        this.showMessage(
          `Course ${newStatus ? 'activated' : 'deactivated'} successfully`,
          'success'
        );
      },
      error: (error) => {
        console.error('Error updating course status:', error);
        this.showMessage('Error updating course status', 'error');
      }
    });
  }

  /**
   * Get popularity color
   */
  getPopularityColor(popularity: number): string {
    if (popularity >= 90) return 'popularity-high';
    if (popularity >= 70) return 'popularity-medium';
    return 'popularity-low';
  }

  /**
   * Get level color
   */
  getLevelColor(level: CourseLevel): string {
    switch (level) {
      case CourseLevel.BEGINNER: return 'level-beginner';
      case CourseLevel.INTERMEDIATE: return 'level-intermediate';
      case CourseLevel.ADVANCED: return 'level-advanced';
      case CourseLevel.EXPERT: return 'level-expert';
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
