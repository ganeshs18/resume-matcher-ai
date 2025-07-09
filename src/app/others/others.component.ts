import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-others',
  imports: [CommonModule, MatIconModule,RouterModule],
  templateUrl: './others.component.html',
  styleUrl: './others.component.css'
})
export class OthersComponent {

  pageType!:string;

  constructor(private acitvatedRoute: ActivatedRoute) {
    // Get the last segment of the current route path
    const segments = this.acitvatedRoute.snapshot.url;
    if (segments && segments.length > 0) {
      this.pageType = segments[0].path;
    } else {
      this.pageType = '';
    }
  }

  

}
