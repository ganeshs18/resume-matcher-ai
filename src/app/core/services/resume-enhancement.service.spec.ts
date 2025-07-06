import { TestBed } from '@angular/core/testing';

import { ResumeEnhancementService } from './resume-enhancement.service';

describe('ResumeEnhancementService', () => {
  let service: ResumeEnhancementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumeEnhancementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
