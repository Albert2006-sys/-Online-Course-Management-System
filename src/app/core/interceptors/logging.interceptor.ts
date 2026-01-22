import { HttpInterceptorFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs/operators';

/**
 * Logging Interceptor - Logs HTTP requests and responses
 * Useful for debugging and monitoring API calls
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  console.log(`🚀 HTTP Request: ${req.method} ${req.url}`);
  
  if (req.body) {
    console.log('📤 Request Body:', req.body);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type !== 0) { // Only log actual responses, not progress events
          const elapsed = Date.now() - startTime;
          console.log(`✅ HTTP Response: ${req.method} ${req.url} (${elapsed}ms)`);
        }
      },
      error: (error) => {
        const elapsed = Date.now() - startTime;
        console.error(`❌ HTTP Error: ${req.method} ${req.url} (${elapsed}ms)`, error);
      }
    }),
    finalize(() => {
      const elapsed = Date.now() - startTime;
      console.log(`⏱️ Request completed in ${elapsed}ms`);
    })
  );
};
