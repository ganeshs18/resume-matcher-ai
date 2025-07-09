import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from './services/loading.service';
import { finalize, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SecureLocalStorage } from './util/secure-local-storage';

// List of endpoints that do NOT require auth header
const NON_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/signup',
  '/auth/google',
  '/public',
  '/health',
  '/docs',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const router = inject(Router);
  loadingService.show();
  const token = SecureLocalStorage.getItem('token');
  let requestToSend = req;
  // Check if the request URL matches any non-auth endpoint
  const isNonAuth = NON_AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
  if (token && !isNonAuth) {
    requestToSend = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(requestToSend).pipe(
    finalize(() => loadingService.hide()),
    catchError((err) => {
      if ((err.status === 401 || err.status === 403) && !isNonAuth) {
        router.navigate(['/auth/login']);
      }
      throw err;
    })
  );
};
