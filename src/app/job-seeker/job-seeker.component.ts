import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResumeEnhancementService } from '../core/services/resume-enhancement.service';
import { Observable, Subscriber } from 'rxjs';

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
  private apiUrl = 'http://localhost:8888/resume/enhance';
  uploadedResumes: UploadedResume[] = [
    {
      name: 'John_Doe_Resume.pdf',
      jobTitle: 'Software Engineer',
      company: 'TechCorp',
      file: new File([], 'John_Doe_Resume.pdf', { type: 'application/pdf' }),
      atsScore: 85,
      jobUrl: [''],
      jobDescription: ['']
    },
    {
      name: 'Jane_Smith_CV.docx',
      jobTitle: 'Frontend Developer',
      company: 'WebWorks',
      file: new File([], 'Jane_Smith_CV.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      atsScore: 78,
      jobUrl: [''],
      jobDescription: ['']
    },
    {
      name: 'Alex_Brown_Profile.doc',
      jobTitle: 'Project Manager',
      company: 'BuildIt',
      file: new File([], 'Alex_Brown_Profile.doc', { type: 'application/msword' }),
      atsScore: 90,
      jobUrl: [''],
      jobDescription: ['']
    }
  ];

  displayedColumns: string[] = ['name', 'jobTitle', 'company', 'atsScore', 'actions'];

  enhancedBlocks: { blockIndex: number; content: string }[] = [];
  enhancementProgress: number = 0;
  enhancementStatus: string = '';
  eventSource?: EventSource;
  eventSourceSubscription: any;
  eventSourceService: any;

  constructor(private dialog: MatDialog, private resumeEnhancement: ResumeEnhancementService, private fb: FormBuilder) {
    this.jobForm = this.fb.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      jobUrl: [''],
      jobDescription: [''],
      file: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.fileError = '';
    Array.from(input.files).forEach(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only PDF, DOC, or DOCX files are allowed.';
        return;
      }
      this.uploadedResumes.push({
        name: file.name,
        jobTitle: this.jobForm.value.jobTitle,
        company: this.jobForm.value.company,
        file: file,
        jobUrl: [''],
        jobDescription: ['']
      });
    });
    input.value = '';
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.jobForm.invalid) return;

    const uploadedResume: UploadedResume = this.jobForm.value;
    this.startEnhancement(uploadedResume)
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

  startEnhancement(resume: UploadedResume) {
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
      userId: '1',
      rawJd,
      s3Key: 'resume/6963d3fe-4736-48ab-b503-d60cb567f9e3.docx'
    });
    // If you want to send the file name as well (not the file itself):

    // Listen to SSE with all params in the URL
    const eventUrl = `${this.apiUrl}?${params.toString()}`
    const options = { withCredentials: true };
    const eventNames = ResumeEventTypes;
    let aiRawText = '';

    this.eventSourceSubscription = this.resumeEnhancement.connectToServerSentEvents(eventUrl, eventNames, options,)
      .subscribe({
        next: (event) => {

          if (event.data.type == 'AI_RAW_STREAM') {
         aiRawText=   aiRawText.concat(event.data.message);
          }
          if (event.data.type == 'COMPLETE') {
            console.log('Raw text : ', aiRawText);
            let parsedObj = JSON.parse(aiRawText.replace('```json','').replace('```Streaming complete.',''));
             console.log('parsed Obj : ', parsedObj);
          }
        },
        error: (error: any) => {
          console.log('Error : ', error);
        }
      }
      );
  }


}
