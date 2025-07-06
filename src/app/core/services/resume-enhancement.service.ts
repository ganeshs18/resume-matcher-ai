import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ResumeBlockDto } from '../../../doc-editor/doc-editor.component';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ResumeEnhancementService {
  private apiUrl = 'http://localhost:8888/'; // Your Spring Boot endpoint
  eventSource!: EventSource;


  constructor(private zone: NgZone,private http:HttpClient) { }



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
  return  this.http.get<ResumeBlockDto[]>(`${this.apiUrl}resume/${resumeId}`)
     
  }


}

export interface ResumeEvent {

  block: string
  progress: number
  message:string
  type: 'UPLOAD_START' |
  'UPLOAD_SUCCESS' |
  'PARSING_BLOCKS' |
  'BLOCK_ENHANCED' |
  'COMPLETE' |
  'AI_RESPONSE_RECEIVED' |
  'ERROR' |
  'AI_RAW_STREAM'


}


