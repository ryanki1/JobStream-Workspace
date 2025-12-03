import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
