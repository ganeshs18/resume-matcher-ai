import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.role === 'RECRUITER') {
            this.router.navigate(['/main/recruiter']);
          } else if (res.role === 'JOB_SEEKER') {
            this.router.navigate(['/main/job-seeker']);
          }
        },
        error: () => {
          this.loading = false;
          // Handle error (show message, etc.)
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
