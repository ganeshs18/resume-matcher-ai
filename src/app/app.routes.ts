import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { JobSeekerComponent } from './job-seeker/job-seeker.component';
import { RecruiterComponent } from './recruiter/recruiter.component';
import { authGuard } from './core/auth.guard';
import { DocEditorComponent } from '../doc-editor/doc-editor.component';

import { OthersComponent } from './others/others.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'about', component: OthersComponent },
    { path: 'privacy-policy', component: OthersComponent },
    { path: 'contact', component: OthersComponent },
    {
        path: 'main',
        canActivate: [authGuard],
        children: [
            { path: 'job-seeker', component: JobSeekerComponent },
            { path: 'recruiter', component: RecruiterComponent },
            { path: 'resume', component: DocEditorComponent },

        ],
    },

];
