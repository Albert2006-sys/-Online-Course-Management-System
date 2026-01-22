import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { CourseService } from '../../services/course.service';
import { Course, CourseCategory, CourseLevel } from '@shared/models/course.model';

/**
 * CourseFormComponent - Create or edit a course using Reactive Forms
 * Features: Validation, dynamic fields, tags, prerequisites
 */
@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit {
  courseForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  courseId: number | null = null;

  // Enums for dropdowns
  categories = Object.values(CourseCategory);
  levels = Object.values(CourseLevel);

  // Chips
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];
  prerequisites: string[] = [];
  learningOutcomes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.courseId = +params['id'];
        this.isEditMode = true;
        this.loadCourse();
      }
    });
  }

  /**
   * Initialize the reactive form
   */
  initializeForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(999999)]],
      instructor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      thumbnail: ['', Validators.pattern(/^https?:\/\/.+/)],
      isActive: [true],
      maxStudents: ['', [Validators.min(1), Validators.max(10000)]]
    });
  }

  /**
   * Load existing course for editing
   */
  loadCourse(): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.populateForm(course);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.showMessage('Error loading course', 'error');
        this.router.navigate(['/courses']);
      }
    });
  }

  /**
   * Populate form with existing course data
   */
  populateForm(course: Course): void {
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      instructor: course.instructor,
      thumbnail: course.thumbnail || '',
      isActive: course.isActive,
      maxStudents: course.maxStudents || ''
    });

    this.tags = course.tags || [];
    this.prerequisites = course.prerequisites || [];
    this.learningOutcomes = course.learningOutcomes || [];
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.showMessage('Please fill all required fields correctly', 'error');
      return;
    }

    const formValue = this.courseForm.value;
    const courseData = {
      ...formValue,
      tags: this.tags,
      prerequisites: this.prerequisites,
      learningOutcomes: this.learningOutcomes,
      duration: +formValue.duration,
      price: +formValue.price,
      maxStudents: formValue.maxStudents ? +formValue.maxStudents : undefined
    };

    this.isLoading = true;

    if (this.isEditMode && this.courseId) {
      this.updateCourse(courseData);
    } else {
      this.createCourse(courseData);
    }
  }

  /**
   * Create new course
   */
  createCourse(courseData: any): void {
    this.courseService.createCourse(courseData).subscribe({
      next: (course) => {
        this.showMessage('Course created successfully!', 'success');
        this.router.navigate(['/courses', course.id]);
      },
      error: (error) => {
        console.error('Error creating course:', error);
        this.showMessage('Error creating course', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Update existing course
   */
  updateCourse(courseData: any): void {
    this.courseService.updateCourse(this.courseId!, courseData).subscribe({
      next: (course) => {
        this.showMessage('Course updated successfully!', 'success');
        this.router.navigate(['/courses', course.id]);
      },
      error: (error) => {
        console.error('Error updating course:', error);
        this.showMessage('Error updating course', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Add tag
   */
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  /**
   * Add prerequisite
   */
  addPrerequisite(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.prerequisites.includes(value)) {
      this.prerequisites.push(value);
    }
    event.chipInput!.clear();
  }

  /**
   * Remove prerequisite
   */
  removePrerequisite(prereq: string): void {
    const index = this.prerequisites.indexOf(prereq);
    if (index >= 0) {
      this.prerequisites.splice(index, 1);
    }
  }

  /**
   * Add learning outcome
   */
  addLearningOutcome(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.learningOutcomes.includes(value)) {
      this.learningOutcomes.push(value);
    }
    event.chipInput!.clear();
  }

  /**
   * Remove learning outcome
   */
  removeLearningOutcome(outcome: string): void {
    const index = this.learningOutcomes.indexOf(outcome);
    if (index >= 0) {
      this.learningOutcomes.splice(index, 1);
    }
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    if (this.isEditMode && this.courseId) {
      this.router.navigate(['/courses', this.courseId]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    if (field.errors['pattern']) return `Invalid format`;

    return '';
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
