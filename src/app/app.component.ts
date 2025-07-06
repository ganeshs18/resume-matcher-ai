import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatIconModule,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'resume-matcher';
  userName: string = '';
  loading$;
  loadingMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
    // Listen for loading message changes if you want to support custom messages
    (this.loadingService as any).loadingSubject.subscribe((val: any) => {
      if (typeof val === 'object' && val !== null && val.message) {
        this.loadingMessage = val.message;
      } else {
        this.loadingMessage = '';
      }
    });
  }


  ngOnInit(): void {
    const nonAuthRoutes = ['/', '/login', '/register'];
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects.split('?')[0];
        const user = this.authService.isAuthenticated();
        if (!user && !nonAuthRoutes.includes(currentRoute)) {
          localStorage.clear();
          this.router.navigate(['']);
        } else {
          this.userName = user?.name;
          console.log(user)
        }
      }
    });
  }

  onLogout() {
    if (confirm('Are you sure you want to logout?')) {
      // Clear user session/token logic here
      localStorage.removeItem('token');
      this.userName = '';
      // Optionally, redirect to login page
      window.location.href = '/login';
    }
  }


}
