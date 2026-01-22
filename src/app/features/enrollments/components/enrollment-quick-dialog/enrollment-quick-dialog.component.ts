import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { EnrollmentService } from '../../services/enrollment.service';
import { CourseService } from '@features/courses/services/course.service';
import { StudentService } from '@features/students/services/student.service';
import { Course } from '@shared/models/course.model';
import { Student } from '@shared/models/student.model';
import { EnrollmentRequest } from '@shared/models/enrollment.model';

interface QuickEnrollmentDialogData {
  defaultCourseId?: number;
  defaultStudentId?: number;
}

@Component({
  selector: 'app-enrollment-quick-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person_add</mat-icon>
      New Enrollment
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="quick-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Student</mat-label>
          <mat-select formControlName="studentId" placeholder="Choose a learner">
            <mat-option *ngFor="let student of students" [value]="student.id">
              {{ student.name }} — {{ student.email }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('studentId')?.hasError('required')">
            Student is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Course</mat-label>
          <mat-select formControlName="courseId" placeholder="Select a course">
            <mat-option *ngFor="let course of courses" [value]="course.id">
              {{ course.title }} ({{ course.category }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('courseId')?.hasError('required')">
            Course is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Enrollment Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="enrollmentDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid || isSubmitting">
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        <span *ngIf="!isSubmitting">Create Enrollment</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 420px;
      max-width: calc(100vw - 32px);
    }
    .quick-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }
    .full-width { width: 100%; }
  `]
})
export class EnrollmentQuickDialogComponent implements OnInit {
  form!: FormGroup;
  students: Student[] = [];
  courses: Course[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private studentService: StudentService,
    private dialogRef: MatDialogRef<EnrollmentQuickDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: QuickEnrollmentDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      studentId: [this.data?.defaultStudentId || '', Validators.required],
      courseId: [this.data?.defaultCourseId || '', Validators.required],
      enrollmentDate: [new Date(), Validators.required]
    });

    this.loadLists();
  }

  private loadLists(): void {
    forkJoin({
      students: this.studentService.getAllStudents(),
      courses: this.courseService.getAllCourses()
    }).subscribe(({ students, courses }) => {
      this.students = students;
      this.courses = courses.filter(c => c.isActive);
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const payload: EnrollmentRequest = {
      studentId: this.form.value.studentId,
      courseId: this.form.value.courseId,
      enrollmentDate: this.form.value.enrollmentDate.toISOString().split('T')[0]
    };

    this.enrollmentService.createEnrollment(payload).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.dialogRef.close(result);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
