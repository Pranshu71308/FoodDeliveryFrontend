import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DineOutComponent } from './dine-out.component';

describe('DineOutComponent', () => {
  let component: DineOutComponent;
  let fixture: ComponentFixture<DineOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DineOutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DineOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
