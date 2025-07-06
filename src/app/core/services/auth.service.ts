import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { getLocalStorage, setLocalStorage } from '../util/local-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {


  constructor(private http: HttpClient) {

  }
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(environment.apiUrl + 'auth/login', data).pipe(
      tap((res: any) => {
        if (res && res.data) {
          setLocalStorage('token', res.data.token);
          setLocalStorage('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  signup(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(environment.apiUrl + 'auth/signup', data).pipe(
      tap((res: any) => {
        if (res && res.data) {
          setLocalStorage('token', res.data.token);
          setLocalStorage('user', JSON.stringify(res.data.user));
        }
      })
    );
  }


  // If you need a separate method for token login, rename it:
  loginWithToken(token: string) {
    return this.http.post(environment.apiUrl + 'auth/google', { token }).pipe(tap((res: any) => {

      setLocalStorage('token', res.token);
      setLocalStorage('user', JSON.stringify(res.user));
    }))
  }

  isAuthenticated() {
    if (!!getLocalStorage('token') && !!getLocalStorage('user')) {
      return JSON.parse(getLocalStorage('user') as any)
    }
  }
}
