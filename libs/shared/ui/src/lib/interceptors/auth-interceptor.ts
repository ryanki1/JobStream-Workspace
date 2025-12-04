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

    const token = localStorage.getItem('token');
    let authyRequest = request.clone();

    if (token) {
      authyRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

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