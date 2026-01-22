/**
 * Course Model - Represents an online course
 * Used throughout the application for course management
 */
export interface Course {
  id: number;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number; // Duration in hours
  price: number;
  instructor: string;
  thumbnail?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  popularity: number; // Popularity score (0-100)
  enrollmentCount: number;
  isActive: boolean;
  tags?: string[];
  prerequisites?: string[];
  learningOutcomes?: string[];
  maxStudents?: number;
}

/**
 * Course Category Enumeration
 */
export enum CourseCategory {
  WEB_DEVELOPMENT = 'Web Development',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  DATA_SCIENCE = 'Data Science',
  MACHINE_LEARNING = 'Machine Learning',
  CLOUD_COMPUTING = 'Cloud Computing',
  CYBERSECURITY = 'Cybersecurity',
  DEVOPS = 'DevOps',
  UI_UX_DESIGN = 'UI/UX Design',
  DATABASE = 'Database',
  NETWORKING = 'Networking',
  PROGRAMMING = 'Programming',
  SOFTWARE_TESTING = 'Software Testing',
  BLOCKCHAIN = 'Blockchain',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  GAME_DEVELOPMENT = 'Game Development'
}

/**
 * Course Level Enumeration
 */
export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

/**
 * Course Summary - Lightweight version for lists
 */
export interface CourseSummary {
  id: number;
  title: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number;
  enrollmentCount: number;
}

/**
 * Course Filter Criteria
 */
export interface CourseFilter {
  category?: CourseCategory;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  isActive?: boolean;
}
