/**
 * Student Model - Represents a student in the system
 */
export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  address?: Address;
  enrolledCourses: number[]; // Array of course IDs
  createdAt: Date | string;
  updatedAt?: Date | string;
  status: StudentStatus;
  profileImage?: string;
  bio?: string;
  educationLevel?: EducationLevel;
  interests?: string[];
  totalCoursesCompleted?: number;
  averageGrade?: number;
}

/**
 * Address Interface
 */
export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
}

/**
 * Student Status Enumeration
 */
export enum StudentStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  GRADUATED = 'Graduated'
}

/**
 * Education Level Enumeration
 */
export enum EducationLevel {
  HIGH_SCHOOL = 'High School',
  ASSOCIATE = 'Associate Degree',
  BACHELOR = 'Bachelor\'s Degree',
  MASTER = 'Master\'s Degree',
  DOCTORATE = 'Doctorate',
  OTHER = 'Other'
}

/**
 * Student Summary - Lightweight version for lists
 */
export interface StudentSummary {
  id: number;
  name: string;
  email: string;
  enrolledCourses: number[];
  status: StudentStatus;
}

/**
 * Student Filter Criteria
 */
export interface StudentFilter {
  status?: StudentStatus;
  searchTerm?: string;
  enrolledInCourse?: number;
}

/**
 * Student Registration Request
 */
export interface StudentRegistration {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  address?: Address;
  educationLevel?: EducationLevel;
  interests?: string[];
}
