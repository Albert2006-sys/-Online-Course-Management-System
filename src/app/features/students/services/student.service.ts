import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  Student, 
  StudentFilter, 
  StudentStatus,
  StudentRegistration,
  StudentSummary
} from '@shared/models/student.model';

/**
 * StudentService - Manages all student-related HTTP operations
 * Provides CRUD operations for students with caching and filtering
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.students}`;
  
  // Cache for students to reduce API calls
  private studentsCache$ = new BehaviorSubject<Student[]>([]);
  public students$ = this.studentsCache$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllStudents();
  }

  /**
   * Load all students and update cache
   */
  private loadAllStudents(): void {
    this.getAllStudents().subscribe({
      next: (students) => this.studentsCache$.next(students),
      error: (error) => console.error('Error loading students:', error)
    });
  }

  /**
   * GET - Retrieve all students
   */
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl).pipe(
      map(students => students.map(student => this.transformStudent(student))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve a single student by ID
   */
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`).pipe(
      map(student => this.transformStudent(student)),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Create a new student (registration)
   */
  createStudent(registration: StudentRegistration): Observable<Student> {
    const newStudent: Omit<Student, 'id'> = {
      ...registration,
      enrolledCourses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: StudentStatus.ACTIVE,
      totalCoursesCompleted: 0,
      averageGrade: 0
    };

    return this.http.post<Student>(this.apiUrl, newStudent).pipe(
      tap(created => {
        // Update cache with new student
        const current = this.studentsCache$.value;
        this.studentsCache$.next([...current, this.transformStudent(created)]);
      }),
      map(student => this.transformStudent(student)),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Update an existing student
   */
  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
    const updatedStudent = {
      ...student,
      updatedAt: new Date().toISOString()
    };

    return this.http.put<Student>(`${this.apiUrl}/${id}`, updatedStudent).pipe(
      tap(updated => {
        // Update cache
        const current = this.studentsCache$.value;
        const index = current.findIndex(s => s.id === id);
        if (index !== -1) {
          current[index] = this.transformStudent(updated);
          this.studentsCache$.next([...current]);
        }
      }),
      map(student => this.transformStudent(student)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Partially update a student
   */
  patchStudent(id: number, updates: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updated => {
        // Update cache
        const current = this.studentsCache$.value;
        const index = current.findIndex(s => s.id === id);
        if (index !== -1) {
          current[index] = this.transformStudent(updated);
          this.studentsCache$.next([...current]);
        }
      }),
      map(student => this.transformStudent(student)),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Remove a student
   */
  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Update cache
        const current = this.studentsCache$.value;
        this.studentsCache$.next(current.filter(s => s.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Filter students based on criteria
   */
  filterStudents(filter: StudentFilter): Observable<Student[]> {
    let params = new HttpParams();

    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.enrolledInCourse) {
      params = params.set('enrolledCourses_like', filter.enrolledInCourse.toString());
    }

    return this.http.get<Student[]>(this.apiUrl, { params }).pipe(
      map(students => {
        let filtered = students.map(student => this.transformStudent(student));

        // Client-side filtering for search term
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            (s.phone && s.phone.toLowerCase().includes(term))
          );
        }

        return filtered;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Search students by keyword
   */
  searchStudents(keyword: string): Observable<Student[]> {
    return this.getAllStudents().pipe(
      map(students => {
        const term = keyword.toLowerCase();
        return students.filter(student =>
          student.name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          (student.phone && student.phone.toLowerCase().includes(term))
        );
      })
    );
  }

  /**
   * GET - Get students by status
   */
  getStudentsByStatus(status: StudentStatus): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl, {
      params: new HttpParams().set('status', status)
    }).pipe(
      map(students => students.map(student => this.transformStudent(student))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get students enrolled in a specific course
   */
  getStudentsEnrolledInCourse(courseId: number): Observable<Student[]> {
    return this.getAllStudents().pipe(
      map(students =>
        students.filter(s => s.enrolledCourses.includes(courseId))
      )
    );
  }

  /**
   * PUT - Enroll student in a course
   */
  enrollInCourse(studentId: number, courseId: number): Observable<Student> {
    return this.getStudentById(studentId).pipe(
      map(student => {
        if (!student.enrolledCourses.includes(courseId)) {
          student.enrolledCourses.push(courseId);
        }
        return student;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Unenroll student from a course
   */
  unenrollFromCourse(studentId: number, courseId: number): Observable<Student> {
    return this.getStudentById(studentId).pipe(
      map(student => {
        student.enrolledCourses = student.enrolledCourses.filter(id => id !== courseId);
        return student;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Update student status
   */
  updateStudentStatus(studentId: number, status: StudentStatus): Observable<Student> {
    return this.patchStudent(studentId, { status });
  }

  /**
   * GET - Get student summary (lightweight version)
   */
  getStudentSummary(id: number): Observable<StudentSummary> {
    return this.getStudentById(id).pipe(
      map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        enrolledCourses: student.enrolledCourses,
        status: student.status
      }))
    );
  }

  /**
   * GET - Get recently registered students
   */
  getRecentStudents(limit: number = 5): Observable<Student[]> {
    return this.getAllStudents().pipe(
      map(students =>
        students
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, limit)
      )
    );
  }

  /**
   * GET - Get top performing students
   */
  getTopStudents(limit: number = 5): Observable<Student[]> {
    return this.getAllStudents().pipe(
      map(students =>
        students
          .filter(s => s.averageGrade !== undefined)
          .sort((a, b) => (b.averageGrade || 0) - (a.averageGrade || 0))
          .slice(0, limit)
      )
    );
  }

  /**
   * Transform student data (convert date strings to Date objects)
   */
  private transformStudent(student: Student): Student {
    return {
      ...student,
      createdAt: typeof student.createdAt === 'string'
        ? new Date(student.createdAt)
        : student.createdAt,
      updatedAt: student.updatedAt && typeof student.updatedAt === 'string'
        ? new Date(student.updatedAt)
        : student.updatedAt,
      dateOfBirth: student.dateOfBirth && typeof student.dateOfBirth === 'string'
        ? new Date(student.dateOfBirth)
        : student.dateOfBirth
    };
  }

  /**
   * Refresh cache manually
   */
  refreshCache(): void {
    this.loadAllStudents();
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    console.error('StudentService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
