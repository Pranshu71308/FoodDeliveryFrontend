import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantOrderComponent } from './restaurant-order.component';

describe('RestaurantOrderComponent', () => {
  let component: RestaurantOrderComponent;
  let fixture: ComponentFixture<RestaurantOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
