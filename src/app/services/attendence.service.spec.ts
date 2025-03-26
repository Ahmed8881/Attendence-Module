import { TestBed } from '@angular/core/testing';

import { AttendenceService } from './attendence.service';

describe('AttendenceService', () => {
  let service: AttendenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
