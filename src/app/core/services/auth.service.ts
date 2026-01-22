import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User interface for authentication
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  token: string;
}

/**
 * AuthService - Manages user authentication state
 * Handles login, logout, token management, and role-based access
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public redirectUrl: string = '/dashboard';

  constructor() {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  /**
   * Login user (mock implementation)
   * In production, this would call a backend API
   */
  login(username: string, password: string): Observable<User> {
    return new Observable(observer => {
      // Mock authentication - replace with actual API call
      setTimeout(() => {
        const mockUser: User = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          role: username === 'admin' ? 'admin' : 'instructor',
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(7)
        };

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        this.currentUserSubject.next(mockUser);

        observer.next(mockUser);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    // Remove user from localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }
}
