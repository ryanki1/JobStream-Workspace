import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const isApiRequest = request.url.includes('localhost:5000/api') ||
                    request.url.includes('localhost:5001/api') ||
                    request.url.includes('localhost:7001/api');
    const token = localStorage.getItem('token');
    const authorization = token ? `Bearer ${token}` : '';
    const authyRequest = request.clone({
      withCredentials: isApiRequest,
      setHeaders: {
        Authorization: authorization
      }
    });

    return next.handle(authyRequest).pipe(

      catchError((error: HttpErrorResponse) => {
        
        if (error.status === 401) {
          console.log('401 Unauthorized Response - Clearing Token.');
          localStorage.removeItem('token');
          this.router.navigate(['/login']); 
        }
        return throwError(() => error);
      })
    );
  }
}