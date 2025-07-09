import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SecureLocalStorage } from '../util/secure-local-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {


  constructor(private http: HttpClient) {

  }
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(environment.apiUrl + 'auth/login', data).pipe(
      tap((res: any) => {
        if (res && res.data) {
          SecureLocalStorage.setItem('token', res.data.token);
          SecureLocalStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  signup(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(environment.apiUrl + 'auth/signup', data).pipe(
      tap((res: any) => {
        if (res && res.data) {
          SecureLocalStorage.setItem('token', res.data.token);
          SecureLocalStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }


  // If you need a separate method for token login, rename it:
  loginWithToken(token: string) {
    return this.http.post(environment.apiUrl + 'auth/google', { token }).pipe(tap((res: any) => {

      SecureLocalStorage.setItem('token', res.token);
      SecureLocalStorage.setItem('user', JSON.stringify(res.user));
    }))
  }

  isAuthenticated() {
    if (!!SecureLocalStorage.getItem('token') && !!SecureLocalStorage.getItem('user')) {
      return JSON.parse(SecureLocalStorage.getItem('user') || '')
    }
  }
}
