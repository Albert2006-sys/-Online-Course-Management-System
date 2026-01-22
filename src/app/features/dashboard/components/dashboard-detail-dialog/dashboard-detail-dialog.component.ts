import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface DashboardDetailData {
  title: string;
  type: 'courses' | 'students' | 'enrollments' | 'revenue';
  items: any[];
}

@Component({
  selector: 'app-dashboard-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">{{ getIcon() }}</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <div class="table-container">
        <!-- Courses Table -->
        <table *ngIf="data.type === 'courses'" mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Course </th>
            <td mat-cell *matCellDef="let course"> 
              <div class="course-name">{{ course.title }}</div>
              <small class="text-muted">{{ course.category }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="instructor">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Instructor </th>
            <td mat-cell *matCellDef="let course"> {{ course.instructorName || 'Unknown' }} </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Price </th>
            <td mat-cell *matCellDef="let course"> {{ course.price | currency }} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
            <td mat-cell *matCellDef="let course">
              <mat-chip-set>
                <mat-chip [color]="course.isPublished ? 'accent' : 'warn'" highlighted>
                  {{ course.isPublished ? 'Published' : 'Draft' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['title', 'instructor', 'price', 'status']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['title', 'instructor', 'price', 'status'];"></tr>
        </table>

        <!-- Students Table -->
        <table *ngIf="data.type === 'students'" mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
            <td mat-cell *matCellDef="let student"> 
              <div class="student-name">{{ student.firstName }} {{ student.lastName }}</div>
              <small class="text-muted">{{ student.email }}</small>
            </td>
          </ng-container>

          <ng-container matColumnDef="joined">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Joined </th>
            <td mat-cell *matCellDef="let student"> {{ student.createdAt | date }} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['name', 'joined']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['name', 'joined'];"></tr>
        </table>

        <!-- Enrollments Table -->
        <table *ngIf="data.type === 'enrollments'" mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="student">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Student </th>
            <td mat-cell *matCellDef="let enrollment"> {{ enrollment.studentName }} </td>
          </ng-container>

          <ng-container matColumnDef="course">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Course </th>
            <td mat-cell *matCellDef="let enrollment"> {{ enrollment.courseName || enrollment.courseTitle }} </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
            <td mat-cell *matCellDef="let enrollment"> {{ enrollment.enrollmentDate | date }} </td>
          </ng-container>

          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Progress </th>
            <td mat-cell *matCellDef="let enrollment"> 
              {{ enrollment.progress }}%
            </td>
          </ng-container>

           <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
            <td mat-cell *matCellDef="let enrollment"> 
               <mat-chip-set>
                 <mat-chip [color]="getStatusColor(enrollment.status)" highlighted>
                  {{ enrollment.status }}
                </mat-chip>
               </mat-chip-set>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="['student', 'course', 'date', 'progress', 'status']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['student', 'course', 'date', 'progress', 'status'];"></tr>
        </table>
        
         <!-- Revenue Table (Dummy structure for now as it aggregates) -->
        <table *ngIf="data.type === 'revenue'" mat-table [dataSource]="dataSource" matSort>
           <ng-container matColumnDef="course">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Course </th>
            <td mat-cell *matCellDef="let item"> {{ item.title }} </td>
          </ng-container>
           <ng-container matColumnDef="revenue">
            <th mat-header-cell *matHeaderCellDef mat-sort-header> Revenue </th>
            <td mat-cell *matCellDef="let item"> {{ item.revenue | currency }} </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="['course', 'revenue']"></tr>
          <tr mat-row *matRowDef="let row; columns: ['course', 'revenue'];"></tr>
        </table>

      </div>
      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .table-container {
      max-height: 400px;
      overflow: auto;
      min-width: 500px;
    }
    .title-icon {
      vertical-align: middle;
      margin-right: 8px;
    }
    .text-muted {
      color: #777;
      font-size: 0.85em;
    }
    .course-name, .student-name {
      font-weight: 500;
    }
    table {
      width: 100%;
    }
  `]
})
export class DashboardDetailDialogComponent {
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DashboardDetailData,
    private dialogRef: MatDialogRef<DashboardDetailDialogComponent>
  ) {
    this.dataSource = new MatTableDataSource(data.items);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'courses': return 'school';
      case 'students': return 'people';
      case 'enrollments': return 'assignment';
      case 'revenue': return 'attach_money';
      default: return 'info';
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'accent';
      case 'active': case 'in_progress': return 'primary';
      case 'dropped': return 'warn';
      default: return 'primary'; // Default/Basic
    }
  }
}
