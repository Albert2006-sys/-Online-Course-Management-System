import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Error Interceptor - Global HTTP error handling
 * Catches errors and displays user-friendly messages
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request: ' + (error.error?.message || 'Invalid request');
            break;
          case 401:
            errorMessage = 'Unauthorized: Please log in';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Forbidden: You do not have permission';
            router.navigate(['/unauthorized']);
            break;
          case 404:
            errorMessage = 'Not Found: Resource not found';
            break;
          case 500:
            errorMessage = 'Server Error: Please try again later';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }

      // Display error message using MatSnackBar
      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
