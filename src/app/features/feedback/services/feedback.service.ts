import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Feedback, FeedbackCategory, FeedbackPriority, FeedbackStatus } from '@shared/models/common.model';

/**
 * FeedbackService - Manages feedback and contact form submissions
 * Provides operations for creating and managing user feedback
 */
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.feedback}`;

  constructor(private http: HttpClient) {}

  /**
   * GET - Retrieve all feedback
   */
  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl).pipe(
      map(feedbacks => feedbacks.map(feedback => this.transformFeedback(feedback))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Retrieve a single feedback by ID
   */
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`).pipe(
      map(feedback => this.transformFeedback(feedback)),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Submit new feedback
   */
  submitFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Observable<Feedback> {
    const newFeedback = {
      ...feedback,
      createdAt: new Date().toISOString(),
      status: FeedbackStatus.NEW
    };

    return this.http.post<Feedback>(this.apiUrl, newFeedback).pipe(
      map(fb => this.transformFeedback(fb)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Update feedback status
   */
  updateFeedbackStatus(id: number, status: FeedbackStatus): Observable<Feedback> {
    const updates: Partial<Feedback> = { status };
    
    if (status === FeedbackStatus.RESOLVED || status === FeedbackStatus.CLOSED) {
      updates.resolvedAt = new Date().toISOString();
    }

    return this.http.patch<Feedback>(`${this.apiUrl}/${id}`, updates).pipe(
      map(fb => this.transformFeedback(fb)),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Add response to feedback
   */
  respondToFeedback(id: number, response: string): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.apiUrl}/${id}`, {
      response,
      status: FeedbackStatus.RESOLVED,
      resolvedAt: new Date().toISOString()
    }).pipe(
      map(fb => this.transformFeedback(fb)),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Remove feedback
   */
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get feedback by status
   */
  getFeedbackByStatus(status: FeedbackStatus): Observable<Feedback[]> {
    return this.getAllFeedback().pipe(
      map(feedbacks => feedbacks.filter(fb => fb.status === status))
    );
  }

  /**
   * GET - Get feedback by category
   */
  getFeedbackByCategory(category: FeedbackCategory): Observable<Feedback[]> {
    return this.getAllFeedback().pipe(
      map(feedbacks => feedbacks.filter(fb => fb.category === category))
    );
  }

  /**
   * GET - Get high priority feedback
   */
  getHighPriorityFeedback(): Observable<Feedback[]> {
    return this.getAllFeedback().pipe(
      map(feedbacks => 
        feedbacks.filter(fb => 
          fb.priority === FeedbackPriority.HIGH || 
          fb.priority === FeedbackPriority.URGENT
        ).sort((a, b) => {
          const priorityOrder = { 
            [FeedbackPriority.URGENT]: 4, 
            [FeedbackPriority.HIGH]: 3,
            [FeedbackPriority.MEDIUM]: 2,
            [FeedbackPriority.LOW]: 1
          };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
      )
    );
  }

  /**
   * Transform feedback data (convert date strings to Date objects)
   */
  private transformFeedback(feedback: Feedback): Feedback {
    return {
      ...feedback,
      createdAt: typeof feedback.createdAt === 'string'
        ? new Date(feedback.createdAt)
        : feedback.createdAt,
      resolvedAt: feedback.resolvedAt && typeof feedback.resolvedAt === 'string'
        ? new Date(feedback.resolvedAt)
        : feedback.resolvedAt
    };
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    console.error('FeedbackService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
