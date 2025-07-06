
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private loadingSubject = new BehaviorSubject<any>(false);
    loading$ = this.loadingSubject.asObservable();
    private requestCount = 0;

    show(msg: string = '') {
        this.requestCount++;
        this.loadingSubject.next(msg ? { message: msg } : true);
    }

    hide() {
        this.requestCount = Math.max(0, this.requestCount - 1);
        if (this.requestCount === 0) {
            this.loadingSubject.next(false);
        }
    }

    reset() {
        this.requestCount = 0;
        this.loadingSubject.next(false);
    }

    hideAll() {
        this.requestCount = 0;
        this.loadingSubject.next(false);
    }
}
