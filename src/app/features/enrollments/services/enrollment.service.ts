import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  Enrollment, 
  EnrollmentRequest,
  EnrollmentFilter,
  EnrollmentStatus,
  EnrollmentWithDetails,
  EnrollmentStats
} from '@shared/models/enrollment.model';
import { CourseService } from '../../courses/services/course.service';
import { StudentService } from '../../students/services/student.service';

/**
 * EnrollmentService - Manages all enrollment-related HTTP operations
 * Provides CRUD operations for enrollments with course and student details
 */
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.enrollments}`;
  
  // Cache for enrollments to reduce API calls
  private enrollmentsCache$ = new BehaviorSubject<Enrollment[]>([]);
  public enrollments$ = this.enrollmentsCache$.asObservable();

  constructor(
    private http: HttpClient,
    private courseService: CourseService,
    private studentService: StudentService
  ) {
    this.loadAllEnrollments();
  }

  /**
   * Load all enrollments and update cache
   */
  private loadAllEnrollments(): void {
    this.getAllEnrollments().subscribe({
      next: (enrollments) => this.enrollmentsCache$.next(enrollments),
      error: (error) => console.error('Error loading enrollments:', error)
    });
  }

  /**
   * GET - Retrieve all enrollments
   */
  getAllEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl).pipe(
      map(enrollments => enrollments.map(enrollment => this.transformEnrollment(enrollment))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve a single enrollment by ID
   */
  getEnrollmentById(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`).pipe(
      map(enrollment => this.transformEnrollment(enrollment)),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve enrollment with course and student details
   */
  getEnrollmentWithDetails(id: number): Observable<EnrollmentWithDetails> {
    return this.getEnrollmentById(id).pipe(
      switchMap(enrollment => 
        forkJoin({
          enrollment: of(enrollment),
          course: this.courseService.getCourseById(enrollment.courseId),
          student: this.studentService.getStudentById(enrollment.studentId)
        })
      ),
      map(({ enrollment, course, student }) => ({
        ...enrollment,
        courseName: course.title,
        courseCategory: course.category,
        studentName: student.name,
        studentEmail: student.email
      })),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve all enrollments with details
   */
  getAllEnrollmentsWithDetails(): Observable<EnrollmentWithDetails[]> {
    return this.getAllEnrollments().pipe(
      switchMap(enrollments => {
        if (enrollments.length === 0) {
          return of([]);
        }

        const enrollmentDetails$ = enrollments.map(enrollment =>
          forkJoin({
            enrollment: of(enrollment),
            course: this.courseService.getCourseById(enrollment.courseId),
            student: this.studentService.getStudentById(enrollment.studentId)
          }).pipe(
            map(({ enrollment, course, student }) => ({
              ...enrollment,
              courseName: course.title,
              courseCategory: course.category,
              studentName: student.name,
              studentEmail: student.email
            }))
          )
        );

        return forkJoin(enrollmentDetails$);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Create a new enrollment
   */
  createEnrollment(request: EnrollmentRequest): Observable<Enrollment> {
    const newEnrollment: Omit<Enrollment, 'id'> = {
      courseId: request.courseId,
      studentId: request.studentId,
      enrollmentDate: request.enrollmentDate || new Date().toISOString(),
      status: EnrollmentStatus.ENROLLED,
      progress: 0
    };

    return this.http.post<Enrollment>(this.apiUrl, newEnrollment).pipe(
      tap(created => {
        // Update cache with new enrollment
        const current = this.enrollmentsCache$.value;
        this.enrollmentsCache$.next([...current, this.transformEnrollment(created)]);

        // Refresh course and student caches
        this.courseService.refreshCache();
        this.studentService.refreshCache();
      }),
      map(enrollment => this.transformEnrollment(enrollment)),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Update an existing enrollment
   */
  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${id}`, enrollment).pipe(
      tap(updated => {
        // Update cache
        const current = this.enrollmentsCache$.value;
        const index = current.findIndex(e => e.id === id);
        if (index !== -1) {
          current[index] = this.transformEnrollment(updated);
          this.enrollmentsCache$.next([...current]);
        }
      }),
      map(enrollment => this.transformEnrollment(enrollment)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Partially update an enrollment
   */
  patchEnrollment(id: number, updates: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updated => {
        // Update cache
        const current = this.enrollmentsCache$.value;
        const index = current.findIndex(e => e.id === id);
        if (index !== -1) {
          current[index] = this.transformEnrollment(updated);
          this.enrollmentsCache$.next([...current]);
        }
      }),
      map(enrollment => this.transformEnrollment(enrollment)),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Remove an enrollment
   */
  deleteEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Update cache
        const current = this.enrollmentsCache$.value;
        this.enrollmentsCache$.next(current.filter(e => e.id !== id));

        // Refresh course and student caches
        this.courseService.refreshCache();
        this.studentService.refreshCache();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Filter enrollments based on criteria
   */
  filterEnrollments(filter: EnrollmentFilter): Observable<Enrollment[]> {
    let params = new HttpParams();

    if (filter.courseId) {
      params = params.set('courseId', filter.courseId.toString());
    }
    if (filter.studentId) {
      params = params.set('studentId', filter.studentId.toString());
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }

    return this.http.get<Enrollment[]>(this.apiUrl, { params }).pipe(
      map(enrollments => {
        let filtered = enrollments.map(enrollment => this.transformEnrollment(enrollment));

        // Client-side filtering for date range
        if (filter.dateFrom) {
          const fromDate = new Date(filter.dateFrom);
          filtered = filtered.filter(e => new Date(e.enrollmentDate) >= fromDate);
        }
        if (filter.dateTo) {
          const toDate = new Date(filter.dateTo);
          filtered = filtered.filter(e => new Date(e.enrollmentDate) <= toDate);
        }

        return filtered;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get enrollments by course ID
   */
  getEnrollmentsByCourse(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl, {
      params: new HttpParams().set('courseId', courseId.toString())
    }).pipe(
      map(enrollments => enrollments.map(enrollment => this.transformEnrollment(enrollment))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get enrollments by student ID
   */
  getEnrollmentsByStudent(studentId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl, {
      params: new HttpParams().set('studentId', studentId.toString())
    }).pipe(
      map(enrollments => enrollments.map(enrollment => this.transformEnrollment(enrollment))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get enrollments by status
   */
  getEnrollmentsByStatus(status: EnrollmentStatus): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.apiUrl, {
      params: new HttpParams().set('status', status)
    }).pipe(
      map(enrollments => enrollments.map(enrollment => this.transformEnrollment(enrollment))),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Update enrollment progress
   */
  updateProgress(enrollmentId: number, progress: number): Observable<Enrollment> {
    const updates: Partial<Enrollment> = { 
      progress,
      lastAccessedDate: new Date().toISOString()
    };

    // Auto-update status based on progress
    if (progress === 100) {
      updates.status = EnrollmentStatus.COMPLETED;
      updates.completionDate = new Date().toISOString();
    } else if (progress > 0) {
      updates.status = EnrollmentStatus.IN_PROGRESS;
    }

    return this.patchEnrollment(enrollmentId, updates);
  }

  /**
   * PATCH - Update enrollment status
   */
  updateStatus(enrollmentId: number, status: EnrollmentStatus): Observable<Enrollment> {
    const updates: Partial<Enrollment> = { status };

    if (status === EnrollmentStatus.COMPLETED) {
      updates.completionDate = new Date().toISOString();
      updates.progress = 100;
    }

    return this.patchEnrollment(enrollmentId, updates);
  }

  /**
   * PATCH - Submit course grade
   */
  submitGrade(enrollmentId: number, grade: number): Observable<Enrollment> {
    return this.patchEnrollment(enrollmentId, { 
      grade,
      certificateIssued: grade >= 70 // Auto-issue certificate for passing grade
    });
  }

  /**
   * GET - Calculate enrollment statistics
   */
  getEnrollmentStats(): Observable<EnrollmentStats> {
    return this.getAllEnrollments().pipe(
      map(enrollments => {
        const total = enrollments.length;
        const active = enrollments.filter(e => 
          e.status === EnrollmentStatus.ENROLLED || 
          e.status === EnrollmentStatus.IN_PROGRESS
        ).length;
        const completed = enrollments.filter(e => 
          e.status === EnrollmentStatus.COMPLETED
        ).length;
        const dropped = enrollments.filter(e => 
          e.status === EnrollmentStatus.DROPPED
        ).length;

        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = total > 0 ? totalProgress / total : 0;

        const gradedEnrollments = enrollments.filter(e => e.grade !== undefined);
        const totalGrade = gradedEnrollments.reduce((sum, e) => sum + (e.grade || 0), 0);
        const avgGrade = gradedEnrollments.length > 0 ? totalGrade / gradedEnrollments.length : 0;

        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          totalEnrollments: total,
          activeEnrollments: active,
          completedEnrollments: completed,
          droppedEnrollments: dropped,
          averageProgress: Math.round(avgProgress * 100) / 100,
          averageGrade: Math.round(avgGrade * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get recent enrollments
   */
  getRecentEnrollments(limit: number = 5): Observable<EnrollmentWithDetails[]> {
    return this.getAllEnrollmentsWithDetails().pipe(
      map(enrollments =>
        enrollments
          .sort((a, b) => {
            const dateA = new Date(a.enrollmentDate).getTime();
            const dateB = new Date(b.enrollmentDate).getTime();
            return dateB - dateA;
          })
          .slice(0, limit)
      )
    );
  }

  /**
   * Transform enrollment data (convert date strings to Date objects)
   */
  private transformEnrollment(enrollment: Enrollment): Enrollment {
    return {
      ...enrollment,
      enrollmentDate: typeof enrollment.enrollmentDate === 'string'
        ? new Date(enrollment.enrollmentDate)
        : enrollment.enrollmentDate,
      completionDate: enrollment.completionDate && typeof enrollment.completionDate === 'string'
        ? new Date(enrollment.completionDate)
        : enrollment.completionDate,
      lastAccessedDate: enrollment.lastAccessedDate && typeof enrollment.lastAccessedDate === 'string'
        ? new Date(enrollment.lastAccessedDate)
        : enrollment.lastAccessedDate
    };
  }

  /**
   * Refresh cache manually
   */
  refreshCache(): void {
    this.loadAllEnrollments();
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    console.error('EnrollmentService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
