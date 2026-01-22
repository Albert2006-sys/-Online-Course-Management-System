import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';
import { environment } from '@env/environment';
import { 
  Course, 
  CourseFilter, 
  CourseCategory, 
  CourseLevel 
} from '@shared/models/course.model';

/**
 * CourseService - Manages all course-related HTTP operations
 * Provides CRUD operations for courses with caching and filtering
 */
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.courses}`;
  
  // Cache for courses to reduce API calls
  private coursesCache$ = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesCache$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllCourses();
  }

  /**
   * Load all courses and update cache
   */
  private loadAllCourses(): void {
    this.getAllCourses().subscribe({
      next: (courses) => this.coursesCache$.next(courses),
      error: (error) => console.error('Error loading courses:', error)
    });
  }

  /**
   * GET - Retrieve all courses
   */
  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      map(courses => courses.map(course => this.transformCourse(course))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve a single course by ID
   */
  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      map(course => this.transformCourse(course)),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Create a new course
   */
  createCourse(course: Omit<Course, 'id'>): Observable<Course> {
    const newCourse = {
      ...course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enrollmentCount: 0,
      popularity: 0
    };

    return this.http.post<Course>(this.apiUrl, newCourse).pipe(
      tap(created => {
        // Update cache with new course
        const current = this.coursesCache$.value;
        this.coursesCache$.next([...current, this.transformCourse(created)]);
      }),
      map(course => this.transformCourse(course)),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Update an existing course
   */
  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    const updatedCourse = {
      ...course,
      updatedAt: new Date().toISOString()
    };

    return this.http.put<Course>(`${this.apiUrl}/${id}`, updatedCourse).pipe(
      tap(updated => {
        // Update cache
        const current = this.coursesCache$.value;
        const index = current.findIndex(c => c.id === id);
        if (index !== -1) {
          current[index] = this.transformCourse(updated);
          this.coursesCache$.next([...current]);
        }
      }),
      map(course => this.transformCourse(course)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Partially update a course
   */
  patchCourse(id: number, updates: Partial<Course>): Observable<Course> {
    return this.http.patch<Course>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updated => {
        // Update cache
        const current = this.coursesCache$.value;
        const index = current.findIndex(c => c.id === id);
        if (index !== -1) {
          current[index] = this.transformCourse(updated);
          this.coursesCache$.next([...current]);
        }
      }),
      map(course => this.transformCourse(course)),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Remove a course
   */
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Update cache
        const current = this.coursesCache$.value;
        this.coursesCache$.next(current.filter(c => c.id !== id));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Filter courses based on criteria
   */
  filterCourses(filter: CourseFilter): Observable<Course[]> {
    let params = new HttpParams();

    if (filter.category) {
      params = params.set('category', filter.category);
    }
    if (filter.level) {
      params = params.set('level', filter.level);
    }
    if (filter.isActive !== undefined) {
      params = params.set('isActive', filter.isActive.toString());
    }

    return this.http.get<Course[]>(this.apiUrl, { params }).pipe(
      map(courses => {
        let filtered = courses.map(course => this.transformCourse(course));

        // Client-side filtering for price range and search
        if (filter.minPrice !== undefined) {
          filtered = filtered.filter(c => c.price >= filter.minPrice!);
        }
        if (filter.maxPrice !== undefined) {
          filtered = filtered.filter(c => c.price <= filter.maxPrice!);
        }
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term) ||
            c.instructor.toLowerCase().includes(term)
          );
        }

        return filtered;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Search courses by keyword
   */
  searchCourses(keyword: string): Observable<Course[]> {
    return this.getAllCourses().pipe(
      map(courses => {
        const term = keyword.toLowerCase();
        return courses.filter(course =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.category.toLowerCase().includes(term) ||
          course.instructor.toLowerCase().includes(term)
        );
      })
    );
  }

  /**
   * GET - Get courses by category
   */
  getCoursesByCategory(category: CourseCategory): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, {
      params: new HttpParams().set('category', category)
    }).pipe(
      map(courses => courses.map(course => this.transformCourse(course))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get courses by level
   */
  getCoursesByLevel(level: CourseLevel): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, {
      params: new HttpParams().set('level', level)
    }).pipe(
      map(courses => courses.map(course => this.transformCourse(course))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get popular courses (sorted by popularity)
   */
  getPopularCourses(limit: number = 5): Observable<Course[]> {
    return this.getAllCourses().pipe(
      map(courses => 
        courses
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, limit)
      )
    );
  }

  /**
   * GET - Get recently added courses
   */
  getRecentCourses(limit: number = 5): Observable<Course[]> {
    return this.getAllCourses().pipe(
      map(courses =>
        courses
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
   * GET - Get courses by instructor
   */
  getCoursesByInstructor(instructor: string): Observable<Course[]> {
    return this.getAllCourses().pipe(
      map(courses => 
        courses.filter(c => 
          c.instructor.toLowerCase() === instructor.toLowerCase()
        )
      )
    );
  }

  /**
   * Transform course data (convert date strings to Date objects)
   */
  private transformCourse(course: Course): Course {
    return {
      ...course,
      createdAt: typeof course.createdAt === 'string' 
        ? new Date(course.createdAt) 
        : course.createdAt,
      updatedAt: course.updatedAt && typeof course.updatedAt === 'string'
        ? new Date(course.updatedAt)
        : course.updatedAt
    };
  }

  /**
   * Refresh cache manually
   */
  refreshCache(): void {
    this.loadAllCourses();
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    console.error('CourseService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
