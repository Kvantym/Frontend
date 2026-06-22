import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';

interface User {
  id: string;
  userName: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUserFromStorage();
  }

  public getAuthHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn('No token found in localStorage');
      }
    }
    return { headers };
  }
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decoding error:', error);
      return null;
    }
  }

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        if (this.isBrowser) {
          localStorage.setItem('authToken', res.token);
        }
        const decoded: any = this.decodeJwt(res.token);
        if (decoded) {
          this.currentUserSubject.next({
            id: decoded.sub,
            userName: decoded.username,
            email: decoded.email,
          });
        }
      })
    );
  }

  register(data: { username: string; password: string; email: string }) {
    return this.http.post(`${this.apiUrl}/register`, data, {
      responseType: 'text',
    });
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  getCurrentUser() {
    return this.http
      .get<User>(`${this.apiUrl}/current-user`)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  getCurrentUserLocal(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('authToken') : null;
  }

  updateUserName(newUserName: string): Observable<any> {
    const formData = new FormData();
    formData.append('newUserName', newUserName);
    return this.http.put(`${this.apiUrl}/update-user-name`, formData, {
      responseType: 'text',
    });
  }
  updateUserEmail(newUserEmail: string): Observable<any> {
    const formData = new FormData();
    formData.append('newUserEmail', newUserEmail);
    return this.http.put(`${this.apiUrl}/update-user-email`, formData, {
      responseType: 'text',
    });
  }

  updateUserPassword(newUserPassword: string): Observable<any> {
    const formData = new FormData();
    formData.append('newUserPassword', newUserPassword);
    return this.http.put(`${this.apiUrl}/update-user-password`, formData, {
      responseType: 'text',
    });
  }

  private loadUserFromStorage() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded: any = this.decodeJwt(token);
      if (decoded) {
        this.currentUserSubject.next({
          id: decoded.sub,
          userName: decoded.username,
          email: decoded.email,
        });
      } else {
        this.logout();
      }
    }
  }
  getCurrentUserEmail(): string | null {
    const user = this.currentUserSubject.value;
    return user?.email || user?.userName || null; // повертаємо імейл
  }

  getUserByEmail(email: string) {
    return this.http.get<User>(`${this.apiUrl}/get-user-by-email${email}`);
  }

  getUserById(userId: string | undefined): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get-user-by-id/${userId}`); // Додано / перед ID
  }

}
