/**
 * Feedback Model - User feedback and contact form
 */
export interface Feedback {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdAt: Date | string;
  resolvedAt?: Date | string;
  response?: string;
  userId?: number;
}

/**
 * Feedback Category Enumeration
 */
export enum FeedbackCategory {
  GENERAL = 'General',
  TECHNICAL_ISSUE = 'Technical Issue',
  COURSE_CONTENT = 'Course Content',
  FEATURE_REQUEST = 'Feature Request',
  BILLING = 'Billing',
  OTHER = 'Other'
}

/**
 * Feedback Priority Enumeration
 */
export enum FeedbackPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

/**
 * Feedback Status Enumeration
 */
export enum FeedbackStatus {
  NEW = 'New',
  IN_REVIEW = 'In Review',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalRevenue: number;
  averageRating: number;
  newStudentsThisMonth: number;
  popularCourses: CourseSummary[];
  recentEnrollments: EnrollmentSummary[];
  categoryDistribution: CategoryStats[];
  enrollmentTrends: EnrollmentTrend[];
  // Raw data for drill-down details
  courses?: any[];
  students?: any[];
  allEnrollments?: any[];
}

/**
 * Category Statistics
 */
export interface CategoryStats {
  category: string;
  courseCount: number;
  enrollmentCount: number;
  revenue: number;
}

/**
 * Enrollment Trend Data
 */
export interface EnrollmentTrend {
  month: string;
  enrollments: number;
  completions: number;
  revenue: number;
}

/**
 * Course Summary for Dashboard
 */
export interface CourseSummary {
  id: number;
  title: string;
  category: string;
  enrollmentCount: number;
  rating?: number;
}

/**
 * Enrollment Summary for Dashboard
 */
export interface EnrollmentSummary {
  id: number;
  studentName: string;
  courseName: string;
  enrollmentDate: Date | string;
  status: string;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date | string;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
