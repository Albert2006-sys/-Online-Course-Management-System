import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { EnrollmentService } from '../../services/enrollment.service';
import { CourseService } from '@features/courses/services/course.service';
import { StudentService } from '@features/students/services/student.service';
import { Course } from '@shared/models/course.model';
import { Student } from '@shared/models/student.model';
import { EnrollmentRequest, EnrollmentStatus } from '@shared/models/enrollment.model';

/**
 * EnrollmentFormComponent - Create new enrollment
 * Features: Course/student selection, date picker, duplicate validation
 */
@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './enrollment-form.component.html',
  styleUrls: ['./enrollment-form.component.scss']
})
export class EnrollmentFormComponent implements OnInit {
  enrollmentForm!: FormGroup;
  isLoading = false;
  isLoadingData = true;

  courses: Course[] = [];
  students: Student[] = [];
  selectedCourse: Course | null = null;
  selectedStudent: Student | null = null;

  // Max date for enrollment (current date)
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  /**
   * Initialize the form
   */
  private initializeForm(): void {
    this.enrollmentForm = this.fb.group({
      courseId: ['', Validators.required],
      studentId: ['', Validators.required],
      enrollmentDate: [new Date(), Validators.required]
    });

    // Watch for course/student selection changes
    this.enrollmentForm.get('courseId')?.valueChanges.subscribe(courseId => {
      this.selectedCourse = this.courses.find(c => c.id === courseId) || null;
      this.validateDuplicateEnrollment();
    });

    this.enrollmentForm.get('studentId')?.valueChanges.subscribe(studentId => {
      this.selectedStudent = this.students.find(s => s.id === studentId) || null;
      this.validateDuplicateEnrollment();
    });
  }

  /**
   * Load courses and students
   */
  private loadData(): void {
    this.isLoadingData = true;

    forkJoin({
      courses: this.courseService.getAllCourses(),
      students: this.studentService.getAllStudents()
    }).subscribe({
      next: ({ courses, students }) => {
        this.courses = courses.filter(c => c.isActive);
        this.students = students;
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.showMessage('Error loading courses and students', 'error');
        this.isLoadingData = false;
      }
    });
  }

  /**
   * Validate duplicate enrollment
   */
  private validateDuplicateEnrollment(): void {
    const courseId = this.enrollmentForm.get('courseId')?.value;
    const studentId = this.enrollmentForm.get('studentId')?.value;

    if (courseId && studentId) {
      this.enrollmentService.getAllEnrollments().subscribe({
        next: (enrollments) => {
          const duplicate = enrollments.find(e => 
            e.courseId === courseId && 
            e.studentId === studentId &&
            (e.status === EnrollmentStatus.IN_PROGRESS || e.status === EnrollmentStatus.PENDING)
          );

          if (duplicate) {
            this.enrollmentForm.setErrors({ duplicate: true });
            this.showMessage('This student is already enrolled in this course', 'error');
          } else {
            this.enrollmentForm.setErrors(null);
          }
        }
      });
    }
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    const formData = this.enrollmentForm.value;
    const enrollmentData: EnrollmentRequest = {
      courseId: formData.courseId,
      studentId: formData.studentId,
      enrollmentDate: formData.enrollmentDate.toISOString().split('T')[0]
    };

    this.isLoading = true;

    this.enrollmentService.createEnrollment(enrollmentData).subscribe({
      next: (created) => {
        // Update student's enrolled courses
        if (this.selectedStudent) {
          const updatedStudent = {
            ...this.selectedStudent,
            enrolledCourses: [...this.selectedStudent.enrolledCourses, formData.courseId]
          };
          
          this.studentService.updateStudent(this.selectedStudent.id, updatedStudent).subscribe();
        }

        this.showMessage('Enrollment created successfully', 'success');
        this.router.navigate(['/enrollments']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating enrollment:', error);
        this.showMessage('Error creating enrollment', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/enrollments']);
  }

  /**
   * Get course display name
   */
  getCourseDisplay(course: Course): string {
    return `${course.title} (${course.category} - ${course.level})`;
  }

  /**
   * Get student display name
   */
  getStudentDisplay(student: Student): string {
    return `${student.name} (${student.email})`;
  }

  /**
   * Get enrollment summary
   */
  getEnrollmentSummary(): string {
    if (!this.selectedCourse || !this.selectedStudent) {
      return 'Select a course and student to see enrollment details';
    }

    return `Enrolling ${this.selectedStudent.name} in "${this.selectedCourse.title}"`;
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.enrollmentForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    
    return '';
  }

  /**
   * Check if form control is invalid and touched
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.enrollmentForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
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
