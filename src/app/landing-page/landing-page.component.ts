import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-landing-page',
  imports: [RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {


  constructor(private router:Router,private auth:AuthService){

  }


  ngOnInit(): void {
   if(this.auth.isAuthenticated()) this.router.navigate(['main/job-seeker'])
  }

}
