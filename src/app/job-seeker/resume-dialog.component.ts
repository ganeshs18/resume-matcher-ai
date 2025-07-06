import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeUrlPipe } from './safe-url.pipe';
import { NgFor, NgIf } from '@angular/common';
import { MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resume-dialog',
  standalone: true,
  imports: [NgFor, NgIf, SafeUrlPipe, MatDialogContent, MatDialogActions, MatIconModule],
  template: `
    <h2 mat-dialog-title class="bg-primary text-white p-3 rounded-top h4 mb-0">
      {{ data.jobTitle }} <span *ngIf="data.company" class="fw-normal">&#64; {{ data.company }}</span>
    </h2>
    <mat-dialog-content class="p-4">
      <div class="row mb-3 align-items-center">
        <div class="col-md-4 text-center mb-3 mb-md-0">
          <div class="bg-info bg-opacity-25 rounded-4 py-4 px-2 shadow-sm">
            <div class="text-primary fw-semibold mb-2">ATS Score</div>
            <div class="display-4 fw-bold text-success">{{ data.atsScore }}%</div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="mb-2"><strong class="text-primary">Original Resume:</strong> {{ data.originalFileName }}</div>
          <div class="mb-2"><strong class="text-primary">Improved Resume:</strong> <span class="text-success">Available</span></div>
          <div class="mb-2">
           
            <a mat-raised-button color="accent" class="me-2" [href]="data.fileUrl" download target="_blank">
              <mat-icon class="me-1">download</mat-icon>Download
            </a>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <strong class="text-primary">Job Description:</strong>
        <div class="bg-light rounded-3 p-3 mt-2 border text-secondary" style="white-space: pre-line;">{{ data.jobDescription }}</div>
      </div>
      <div class="mb-3">
        <strong class="text-primary">Improvements:</strong>
        <ul class="ms-4">
          <li *ngFor="let improvement of data.improvements">{{ improvement }}</li>
        </ul>
      </div>
      <div>
        <strong class="text-primary">Preview:</strong>
        <div class="border rounded-3 mt-2 overflow-hidden bg-white">
          <iframe *ngIf="data.fileUrl" [src]="data.fileUrl | safeUrl" width="100%" height="400px" class="border-0 w-100"></iframe>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="p-3 bg-light rounded-bottom">
      <button class="btn btn-secondary" (click)="dialogRef.close()" >
        <mat-icon class="me-1">close</mat-icon>Close
      </button>
    </mat-dialog-actions>
  `,
  styles: []
})
export class ResumeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResumeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onView() {
    window.open(this.data.fileUrl, '_blank');
  }
}
