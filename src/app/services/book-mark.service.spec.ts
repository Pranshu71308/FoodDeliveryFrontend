import { TestBed } from '@angular/core/testing';

import { BookMarkService } from './book-mark.service';

describe('BookMarkServiceService', () => {
  let service: BookMarkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookMarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
