import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'resume-matcher';
  userName: string = 'John Doe'; // Replace with actual user logic

  constructor(private authService: AuthService) {}

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
