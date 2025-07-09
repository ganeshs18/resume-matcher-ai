import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResumeEnhancementService } from '../core/services/resume-enhancement.service';
import { Observable, Subscriber } from 'rxjs';
import { SecureLocalStorage } from '../core/util/secure-local-storage';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoadingService } from '../core/services/loading.service';

const ResumeEventTypes = [
  'UPLOAD_START',
  'UPLOAD_SUCCESS',
  'PARSING_BLOCKS',
  'BLOCK_ENHANCED',
  'COMPLETE',
  'AI_RESPONSE_RECEIVED',
  'ERROR',
  'AI_RAW_STREAM'
];

interface UploadedResume {
  name: string;
  jobTitle: string;
  company: string;
  file: File;
  atsScore?: number; // Optional ATS score
  existingResume: string
  jobUrl: [''],
  jobDescription: [''],

}

@Component({
  selector: 'app-job-seeker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './job-seeker.component.html',
  styleUrl: './job-seeker.component.css'
})
export class JobSeekerComponent {
  jobForm: FormGroup;
  fileError: string = '';
  submitted: boolean = false;
  existingResumes: any[] = [];

  uploadedResumes: UploadedResume[] = [];

  displayedColumns: string[] = ['name', 'jobTitle', 'company', 'atsScore', 'actions'];

  enhancedBlocks: { blockIndex: number; content: string }[] = [];
  enhancementProgress: number = 0;
  enhancementStatus: string = '';
  eventSource?: EventSource;
  eventSourceSubscription: any;
  eventSourceService: any;

  constructor(private dialog: MatDialog,
     private resumeEnhancement: ResumeEnhancementService,
      private fb: FormBuilder,
       private router: Router,
      private loader:LoadingService) {
    this.jobForm = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
      company: ['', [Validators.required, Validators.maxLength(100)]],
      jobUrl: [''],
      jobDescription: ['', [Validators.required, Validators.maxLength(3000)]],
      file: [''],
      existingResume: ['']
    },
      { validators: this.resumeChoiceValidator });

    // Listen for changes to file and existingResume
    this.jobForm.get('file')?.valueChanges.subscribe(val => {
      if (val) {
        this.jobForm.get('existingResume')?.setValue('');
      }
    });
    this.jobForm.get('existingResume')?.valueChanges.subscribe(val => {
      if (val) {
        this.jobForm.get('file')?.setValue('');
      }
    });

    this.resumeEnhancement.getExistingResumes().subscribe(res => {
      this.existingResumes = res
    })
  }

  /**
   * Custom validator: Either file or existingResume must be selected, but not both, and at least one is required
   */
  resumeChoiceValidator(form: FormGroup) {
    const file = form.get('file')?.value;
    const existingResume = form.get('existingResume')?.value;
    if ((!file && !existingResume) || (file && existingResume)) {
      return { resumeChoice: true };
    }
    return null;


  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.fileError = '';
    // Only allow one file for this logic (if you want multiple, adjust accordingly)
    const file = input.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only PDF, DOC, or DOCX files are allowed.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        this.fileError = 'File size must be less than 5MB.';
        return;
      }
      this.jobForm.get('file')?.setValue(file);
      // Clear existingResume if file is selected
      this.jobForm.get('existingResume')?.setValue('');
    }
    input.value = '';
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.jobForm.invalid) return;
    const uploadedResume: UploadedResume = this.jobForm.value;
    const user = JSON.parse(SecureLocalStorage.getItem('user') as any)
    this.startEnhancement(uploadedResume, user);
  }

  openResumeDialog(resume: UploadedResume) {
    import('./resume-dialog.component').then(({ ResumeDialogComponent }) => {
      this.dialog.open(ResumeDialogComponent, {
        data: {
          atsScore: 85,
          improvements: [
            'Add more keywords from job description',
            'Improve formatting for ATS readability',
            'Include measurable achievements'
          ],
          fileUrl: 'https://example.com/improved/' + resume.name // Replace with backend URL
        },
        width: '95vw',
        panelClass: 'full-width-dialog',
        maxHeight: '90vh'
      });
    });
  }

  startEnhancement(resume: UploadedResume, user: any) {
    const jobTitle = resume.jobTitle;
    const company = resume.company;
    const userId = 1; // Replace with actual logged-in user ID
    const rawJd = this.jobForm.value.jobDescription;

    this.enhancedBlocks = [];
    this.enhancementProgress = 0;
    this.enhancementStatus = '';

    const params = new URLSearchParams({
      jobTitle,
      company,
      userId: JSON.parse(SecureLocalStorage.getItem('user') as any)?.id,
      rawJd,
      token: SecureLocalStorage.getItem('token') as any,
      s3Key: resume.existingResume
    });
    if (resume.file) {
      this.loader.show('Uploading');
      this.resumeEnhancement.uploadRawFile(resume.file, user.id).subscribe((res: any) => {
        const params = new URLSearchParams({
          jobTitle,
          company,
          userId: JSON.parse(SecureLocalStorage.getItem('user') as any)?.id,
          token: SecureLocalStorage.getItem('token') as any,
          rawJd,
          s3Key: res.data,
        });
        this.startEventListerner(params);
      })
      return
    }

    this.startEventListerner(params);
  }

  startEventListerner(params: any) {
    // If you want to send the file name as well (not the file itself):

    // Listen to SSE with all params in the URL
    const eventUrl = `${environment.apiUrl}resume/enhance?${params.toString()}`
    const options = {};
    const eventNames = ResumeEventTypes;
    let aiRawText = '';

    this.eventSourceSubscription = this.resumeEnhancement.connectToServerSentEvents(eventUrl, eventNames, options,)
      .subscribe({
        next: (event) => {
          // Show loading message based on event type
          switch (event.data.type) {
            case 'UPLOAD_START':
              this.loader.show('Uploading your resume...');
              break;
            case 'UPLOAD_SUCCESS':
              this.loader.show('Upload successful. Parsing your resume...');
        
               this.loader.show('AI is Analyzing your resume...');
              break;
            case 'PARSING_BLOCKS':
              this.loader.show('Parsing resume blocks...');
              break;
            case 'BLOCK_ENHANCED':
              this.loader.show('Enhancing resume content...');
              break;
            case 'AI_RAW_STREAM':
              this.loader.show('AI is generating your enhanced resume...');
              aiRawText = aiRawText.concat(event.data.message);
              break;
            case 'AI_RESPONSE_RECEIVED':
              this.loader.show('AI response received. Finalizing...');
              break;
            case 'COMPLETE':
              this.loader.show('Enhancement complete! Redirecting...');
              this.loader.hideAll();
              let parsedObj = JSON.parse(aiRawText.replace('```json', '').replace('```Streaming complete.', ''));
              this.resumeEnhancement.aiResponseObj = parsedObj;
              this.router.navigate(['main/resume'], { queryParams: { resumeId: event.data.message } })
              break;
            case 'ERROR':
              this.loader.show('An error occurred during enhancement.');
              break;
            default:
              this.loader.show('Processing...');
          }
        },
        error: (error: any) => {
          this.loader.show('An error occurred.');
        }
      }
      );
  }




}
