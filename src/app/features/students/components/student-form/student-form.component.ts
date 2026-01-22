import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { StudentService } from '../../services/student.service';
import { Student, StudentStatus, EducationLevel, StudentRegistration } from '@shared/models/student.model';

/**
 * StudentFormComponent - Create/Edit student with Reactive Forms
 * Includes validation, nested address form, interests chips
 */
@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
  studentForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  studentId: string | null = null;

  // Enums for dropdowns
  statuses = Object.values(StudentStatus);
  educationLevels = Object.values(EducationLevel);

  // Interests management
  interests: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  // Max date for date picker (current date)
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.isEditMode = true;
      this.loadStudent(this.studentId);
    }
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      dateOfBirth: ['', Validators.required],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
        country: ['', Validators.required]
      }),
      educationLevel: ['', Validators.required],
      status: [StudentStatus.ACTIVE, Validators.required],
      profileImage: ['']
    });
  }

  /**
   * Load student data for editing
   */
  private loadStudent(id: string): void {
    this.isLoading = true;
    this.studentService.getStudentById(Number(id)).subscribe({
      next: (student) => {
        this.populateForm(student);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.showMessage('Error loading student data', 'error');
        this.isLoading = false;
        this.router.navigate(['/students']);
      }
    });
  }

  /**
   * Populate form with student data
   */
  private populateForm(student: Student): void {
    this.studentForm.patchValue({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : new Date(),
      address: {
        street: student.address?.street || '',
        city: student.address?.city || '',
        state: student.address?.state || '',
        zipCode: student.address?.zipCode || '',
        country: student.address?.country || ''
      },
      educationLevel: student.educationLevel,
      status: student.status,
      profileImage: student.profileImage || ''
    });

    this.interests = student.interests || [];
  }

  /**
   * Add interest chip
   */
  addInterest(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.interests.includes(value)) {
      this.interests.push(value);
    }

    event.chipInput!.clear();
  }

  /**
   * Remove interest chip
   */
  removeInterest(interest: string): void {
    const index = this.interests.indexOf(interest);
    if (index >= 0) {
      this.interests.splice(index, 1);
    }
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.showMessage('Please fix the form errors', 'error');
      return;
    }

    const formData = this.studentForm.value;
    const studentData: StudentRegistration = {
      ...formData,
      interests: this.interests,
      dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0]
    };

    this.isLoading = true;

    if (this.isEditMode && this.studentId) {
      this.updateStudent(this.studentId, studentData);
    } else {
      this.createStudent(studentData);
    }
  }

  /**
   * Create new student
   */
  private createStudent(studentData: StudentRegistration): void {
    const newStudent: Student = {
      id: Date.now(),
      ...studentData,
      status: StudentStatus.ACTIVE,
      enrolledCourses: [],
      totalCoursesCompleted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.studentService.createStudent(newStudent).subscribe({
      next: (created) => {
        this.showMessage('Student created successfully', 'success');
        this.router.navigate(['/students', created.id]);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating student:', error);
        this.showMessage('Error creating student', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Update existing student
   */
  private updateStudent(id: string, studentData: StudentRegistration): void {
    this.studentService.getStudentById(Number(id)).subscribe({
      next: (existingStudent) => {
        const updatedStudent: Student = {
          ...existingStudent,
          ...studentData,
          updatedAt: new Date().toISOString()
        };

        this.studentService.updateStudent(Number(id), updatedStudent).subscribe({
          next: () => {
            this.showMessage('Student updated successfully', 'success');
            this.router.navigate(['/students', id]);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating student:', error);
            this.showMessage('Error updating student', 'error');
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching student:', error);
        this.showMessage('Error updating student', 'error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    if (this.isEditMode && this.studentId) {
      this.router.navigate(['/students', this.studentId]);
    } else {
      this.router.navigate(['/students']);
    }
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.studentForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'phone') {
        return 'Please enter a valid phone number';
      }
      if (controlName === 'zipCode') {
        return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
      }
    }
    
    return '';
  }

  /**
   * Get nested form control error message
   */
  getNestedErrorMessage(groupName: string, controlName: string): string {
    const control = this.studentForm.get(`${groupName}.${controlName}`);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid format';
    }
    
    return '';
  }

  /**
   * Check if form control is invalid and touched
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.studentForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Check if nested form control is invalid and touched
   */
  isNestedFieldInvalid(groupName: string, controlName: string): boolean {
    const control = this.studentForm.get(`${groupName}.${controlName}`);
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
