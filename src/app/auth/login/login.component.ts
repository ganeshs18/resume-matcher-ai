import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;



@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, CommonModule,RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
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

    ngOnInit(): void {

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

    login() {
        if (this.loginForm.valid) {
            this.loading = true;
            this.authService.login(this.loginForm.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    // If backend returns user info in res.data.user
                    const user = res?.data?.user;
                    this.router.navigate(['/main/job-seeker']);
                },
                error: (err) => {
                    this.loading = false;
                    if (err.status === 401) {
                        this.loginForm.setErrors({ invalid: true });
                    }
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }



    initGoogleAuth() {
        google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: this.handleCredentialResponse.bind(this),
            ux_mode: "popup",
        });

        google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
        );
        // this.triggerGoogleLogin()
    }

    handleCredentialResponse(response: any) {
        const token = response.credential;

        // Send the token to your Spring Boot backend
        this.authService.loginWithToken(token).subscribe((res: any) => {
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
