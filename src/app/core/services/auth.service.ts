import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(data: { email: string; password: string }): Observable<{ role: string }> {
    // Replace this with a real HTTP request
    // Mock: if email contains 'recruiter', role is RECRUITER, else JOB_SEEKER
    const role = data.email.includes('recruiter') ? 'RECRUITER' : 'JOB_SEEKER';
    return of({ role }).pipe(delay(1000));
  }
}
