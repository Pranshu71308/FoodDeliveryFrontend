import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cart-check-out',
  standalone: true,
imports: [ CommonModule],

  templateUrl: './cart-check-out.component.html',
  styleUrls: ['./cart-check-out.component.css']
})
export class CartCheckOutComponent implements OnInit{
  @Input() cartItems: any;
  orderPlaced = false;

  constructor(private activeModal:NgbActiveModal) { }
  ngOnInit(): void {
    console.log(this.cartItems);
  
  }
  onCloseClick(): void {
    this.activeModal.close();
  }
  getTotalAmount(): number {
    return this.cartItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
  }
  onSliderChange(event: any): void {
    if (event.value === 100) {
      this.orderPlaced = true;
    }
  }
}
