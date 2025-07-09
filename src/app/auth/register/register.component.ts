import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule, ReactiveFormsModule, CommonModule,RouterModule]
})
export class RegisterComponent implements AfterViewInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder,private auth:AuthService,private router:Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    const checkGoogle = () => {
      if (typeof google !== 'undefined') {
        this.initGoogleAuth();
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }

  register() {
    if (this.registerForm.valid) {
      this.auth.signup(this.registerForm.value).subscribe({
        next: (res) => {
          // If backend returns user info in res.data.user
          const user = res?.data?.user;
          this.router.navigate(['/main/job-seeker']);
        },
        error: (err) => {
          // Optionally handle error (show message, etc.)
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }


  initGoogleAuth() {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      context: 'signup',
      callback: this.handleCredentialResponse.bind(this),
      ux_mode: "popup",
    });

     google.accounts.id.initialize({
      client_id: environment.googleClientId,
      // context: 'use',
      callback: this.handleCredentialResponse.bind(this),
      ux_mode: "popup",
    });

    google.accounts.id.renderButton(
      document.getElementById('googleSignUpDiv'),
      { theme: 'outline', size: 'medium' }
    );
    this.triggerGoogleLogin()
  }

  handleCredentialResponse(response: any) {
    const token = response.credential;

    // Send the token to your Spring Boot backend
    this.auth.loginWithToken(token).subscribe((res: any) => {
      this.router.navigate(['main/job-seeker']);
    });
  }

  triggerGoogleLogin() {
    google.accounts.id.prompt(); // Show the One Tap prompt
    // OR trigger popup:
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
      }
    });
  }


}
