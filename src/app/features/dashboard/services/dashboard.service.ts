import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  DashboardStats, 
  CategoryStats, 
  EnrollmentTrend 
} from '@shared/models/common.model';
import { CourseService } from '../../courses/services/course.service';
import { StudentService } from '../../students/services/student.service';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';

/**
 * DashboardService - Provides analytics and statistics for the dashboard
 * Aggregates data from multiple services for comprehensive insights
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private courseService: CourseService,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService
  ) {}

  /**
   * GET - Comprehensive dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      courses: this.courseService.getAllCourses(),
      students: this.studentService.getAllStudents(),
      enrollments: this.enrollmentService.getAllEnrollments(),
      enrollmentStats: this.enrollmentService.getEnrollmentStats(),
      popularCourses: this.courseService.getPopularCourses(5),
      recentEnrollments: this.enrollmentService.getRecentEnrollments(5)
    }).pipe(
      map(({ courses, students, enrollments, enrollmentStats, popularCourses, recentEnrollments }) => {
        // Calculate total revenue
        const totalRevenue = enrollments.reduce((sum, enrollment) => {
          const course = courses.find(c => c.id === enrollment.courseId);
          return sum + (course ? course.price : 0);
        }, 0);

        // Calculate average rating
        const ratedEnrollments = enrollments.filter(e => e.rating !== undefined);
        const avgRating = ratedEnrollments.length > 0
          ? ratedEnrollments.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEnrollments.length
          : 0;

        // Calculate new students this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newStudentsThisMonth = students.filter(s => 
          new Date(s.createdAt) >= firstDayOfMonth
        ).length;

        // Category distribution
        const categoryDistribution = this.calculateCategoryDistribution(courses, enrollments);

        // Enrollment trends (last 6 months)
        const enrollmentTrends = this.calculateEnrollmentTrends(enrollments, courses);

        return {
          totalCourses: courses.length,
          totalStudents: students.length,
          totalEnrollments: enrollmentStats.totalEnrollments,
          activeEnrollments: enrollmentStats.activeEnrollments,
          completedEnrollments: enrollmentStats.completedEnrollments,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageRating: Math.round(avgRating * 100) / 100,
          newStudentsThisMonth,
          popularCourses: popularCourses.map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            enrollmentCount: c.enrollmentCount,
            rating: undefined
          })),
          recentEnrollments: recentEnrollments.map(e => ({
            id: e.id,
            studentName: e.studentName || 'Unknown',
            courseName: e.courseName || 'Unknown',
            enrollmentDate: e.enrollmentDate,
            status: e.status
          })),
          categoryDistribution,
          enrollmentTrends,
          courses, // Full list for details
          students, // Full list for details
          allEnrollments: enrollments // Full list for details
        };
      }),
      catchError(error => {
        console.error('Dashboard Stats Error:', error);
        return of(this.getEmptyDashboardStats());
      })
    );
  }

  /**
   * Calculate category distribution statistics
   */
  private calculateCategoryDistribution(courses: any[], enrollments: any[]): CategoryStats[] {
    const categoryMap = new Map<string, CategoryStats>();

    courses.forEach(course => {
      const category = course.category;
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          courseCount: 0,
          enrollmentCount: 0,
          revenue: 0
        });
      }

      const stats = categoryMap.get(category)!;
      stats.courseCount++;

      // Count enrollments for this course
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
      stats.enrollmentCount += courseEnrollments.length;
      stats.revenue += courseEnrollments.length * course.price;
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .map(stat => ({
        ...stat,
        revenue: Math.round(stat.revenue * 100) / 100
      }));
  }

  /**
   * Calculate enrollment trends for the last 6 months
   */
  private calculateEnrollmentTrends(enrollments: any[], courses: any[]): EnrollmentTrend[] {
    const trends: EnrollmentTrend[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      const monthEnrollments = enrollments.filter(e => {
        const enrollDate = new Date(e.enrollmentDate);
        return enrollDate >= monthDate && enrollDate < nextMonthDate;
      });

      const completions = monthEnrollments.filter(e => e.status === 'Completed').length;

      const revenue = monthEnrollments.reduce((sum, enrollment) => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return sum + (course ? course.price : 0);
      }, 0);

      trends.push({
        month: monthName,
        enrollments: monthEnrollments.length,
        completions,
        revenue: Math.round(revenue * 100) / 100
      });
    }

    return trends;
  }

  /**
   * Get course performance metrics
   */
  getCoursePerformance(courseId: number): Observable<any> {
    return forkJoin({
      course: this.courseService.getCourseById(courseId),
      enrollments: this.enrollmentService.getEnrollmentsByCourse(courseId)
    }).pipe(
      map(({ course, enrollments }) => {
        const totalEnrollments = enrollments.length;
        const completed = enrollments.filter(e => e.status === 'Completed').length;
        const inProgress = enrollments.filter(e => e.status === 'In Progress').length;
        const dropped = enrollments.filter(e => e.status === 'Dropped').length;

        const avgProgress = totalEnrollments > 0
          ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments
          : 0;

        const gradedEnrollments = enrollments.filter(e => e.grade !== undefined);
        const avgGrade = gradedEnrollments.length > 0
          ? gradedEnrollments.reduce((sum, e) => sum + (e.grade || 0), 0) / gradedEnrollments.length
          : 0;

        const ratedEnrollments = enrollments.filter(e => e.rating !== undefined);
        const avgRating = ratedEnrollments.length > 0
          ? ratedEnrollments.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEnrollments.length
          : 0;

        return {
          course,
          totalEnrollments,
          completed,
          inProgress,
          dropped,
          completionRate: totalEnrollments > 0 ? (completed / totalEnrollments) * 100 : 0,
          averageProgress: Math.round(avgProgress * 100) / 100,
          averageGrade: Math.round(avgGrade * 100) / 100,
          averageRating: Math.round(avgRating * 100) / 100,
          revenue: totalEnrollments * course.price
        };
      })
    );
  }

  /**
   * Get student performance metrics
   */
  getStudentPerformance(studentId: number): Observable<any> {
    return forkJoin({
      student: this.studentService.getStudentById(studentId),
      enrollments: this.enrollmentService.getEnrollmentsByStudent(studentId)
    }).pipe(
      map(({ student, enrollments }) => {
        const totalCourses = enrollments.length;
        const completed = enrollments.filter(e => e.status === 'Completed').length;
        const inProgress = enrollments.filter(e => e.status === 'In Progress').length;

        const avgProgress = totalCourses > 0
          ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses
          : 0;

        const gradedCourses = enrollments.filter(e => e.grade !== undefined);
        const avgGrade = gradedCourses.length > 0
          ? gradedCourses.reduce((sum, e) => sum + (e.grade || 0), 0) / gradedCourses.length
          : 0;

        const totalHours = enrollments.reduce((sum, e) => sum + (e.totalHoursSpent || 0), 0);

        return {
          student,
          totalCourses,
          completed,
          inProgress,
          completionRate: totalCourses > 0 ? (completed / totalCourses) * 100 : 0,
          averageProgress: Math.round(avgProgress * 100) / 100,
          averageGrade: Math.round(avgGrade * 100) / 100,
          totalHoursSpent: totalHours,
          certificatesEarned: enrollments.filter(e => e.certificateIssued).length
        };
      })
    );
  }

  /**
   * Get empty dashboard stats (fallback)
   */
  private getEmptyDashboardStats(): DashboardStats {
    return {
      totalCourses: 0,
      totalStudents: 0,
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      totalRevenue: 0,
      averageRating: 0,
      newStudentsThisMonth: 0,
      popularCourses: [],
      recentEnrollments: [],
      categoryDistribution: [],
      enrollmentTrends: []
    };
  }
}
