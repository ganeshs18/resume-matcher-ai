import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ResumeBlockDto } from '../../../doc-editor/doc-editor.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SecureLocalStorage } from '../util/secure-local-storage';

@Injectable({ providedIn: 'root' })
export class ResumeEnhancementService {
 // Your Spring Boot endpoint
  eventSource!: EventSource;

  aiResponseObj: any;


  constructor(private zone: NgZone, private http: HttpClient) { }



  getEventSource(url: string, options: EventSourceInit,): EventSource {
    return new EventSource(url, options);
  }


  connectToServerSentEvents<T = any>(
    url: string,
    eventNames: string[] = [],
    options?: any
  ): Observable<{ event: string; data: ResumeEvent }> {
    return new Observable((subscriber: Subscriber<{ event: string; data: ResumeEvent }>) => {
      this.eventSource = this.getEventSource(url, options || { withCredentials: false });

      // Handle custom named events like BLOCK_ENHANCED
      eventNames.forEach((eventName: string) => {
        this.eventSource.addEventListener(eventName, (event) => {
          this.zone.run(() => {
            try {
              const parsed = JSON.parse(event.data) as ResumeEvent;

              subscriber.next({ event: eventName, data: parsed });
            } catch (e) {
              subscriber.error(`Failed to parse event data: ${e}`);
            }
          });
        });
      });

      this.eventSource.onerror = (error: any) => {
        this.zone.run(() => subscriber.error(error));
        this.eventSource.close(); // Optional: close on error
      };
    });
  }

  /**
   * Method for closing the connection
   */
  close(): void {
    if (!this.eventSource) {
      return;
    }

    this.eventSource.close();
    this.eventSource = undefined as any;
  }


  loadResumeBlocks(resumeId: number) {
    return this.http.get<ResumeBlockDto[]>(`${environment.apiUrl}resume/${resumeId}`)

  }

  getExistingResumes() {
    let user: any = JSON.parse(SecureLocalStorage.getItem('user') as any)
    return this.http.get<ResumeBlockDto[]>(`${environment.apiUrl}resume/resumes/${user.id}`)

  }

  uploadRawFile(file: File, userId: any) {
    const formData: FormData = new FormData()
    formData.append('file', file);
    formData.append('userId', userId);

    return this.http.post<ResumeBlockDto[]>(`${environment.apiUrl}upload`, formData)
  }

  saveEnhancedBlockTexts(payload: ResumeBlockDto[]) {
    return this.http.post(`${environment.apiUrl}resume/blocks/enhance`, payload)
  }


}

export interface ResumeEvent {

  block: string
  progress: number
  message: string
  type: 'UPLOAD_START' |
  'UPLOAD_SUCCESS' |
  'PARSING_BLOCKS' |
  'BLOCK_ENHANCED' |
  'COMPLETE' |
  'AI_RESPONSE_RECEIVED' |
  'ERROR' |
  'AI_RAW_STREAM'


}


