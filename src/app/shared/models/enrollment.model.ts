/**
 * Enrollment Model - Represents a student's enrollment in a course
 */
export interface Enrollment {
  id: number;
  courseId: number;
  studentId: number;
  enrollmentDate: Date | string;
  completionDate?: Date | string;
  status: EnrollmentStatus;
  progress: number; // Progress percentage (0-100)
  grade?: number; // Final grade (0-100)
  certificateIssued?: boolean;
  lastAccessedDate?: Date | string;
  totalHoursSpent?: number;
  completedModules?: number;
  totalModules?: number;
  feedback?: string;
  rating?: number; // Course rating by student (1-5)
}

/**
 * Enrollment Status Enumeration
 */
export enum EnrollmentStatus {
  ENROLLED = 'Enrolled',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped',
  SUSPENDED = 'Suspended',
  PENDING = 'Pending'
}

/**
 * Enrollment with Details - Includes course and student information
 */
export interface EnrollmentWithDetails extends Enrollment {
  courseName?: string;
  courseCategory?: string;
  studentName?: string;
  studentEmail?: string;
}

/**
 * Enrollment Request - For creating new enrollments
 */
export interface EnrollmentRequest {
  courseId: number;
  studentId: number;
  enrollmentDate?: Date | string;
}

/**
 * Enrollment Filter Criteria
 */
export interface EnrollmentFilter {
  courseId?: number;
  studentId?: number;
  status?: EnrollmentStatus;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

/**
 * Enrollment Statistics
 */
export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  averageProgress: number;
  averageGrade: number;
  completionRate: number;
}
