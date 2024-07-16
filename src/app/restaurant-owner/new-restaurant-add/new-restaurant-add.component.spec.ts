import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRestaurantAddComponent } from './new-restaurant-add.component';

describe('NewRestaurantAddComponent', () => {
  let component: NewRestaurantAddComponent;
  let fixture: ComponentFixture<NewRestaurantAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRestaurantAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewRestaurantAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
