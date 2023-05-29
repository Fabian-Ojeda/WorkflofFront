import { TestBed } from '@angular/core/testing';

import { ShowAlertService } from './show-alert.service';

describe('ShowAlertService', () => {
  let service: ShowAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
