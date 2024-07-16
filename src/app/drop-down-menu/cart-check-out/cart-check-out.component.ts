import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';

declare var Razorpay: any;
@Component({
  selector: 'app-cart-check-out',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-check-out.component.html',
  styleUrls: ['./cart-check-out.component.css']
})
export class CartCheckOutComponent implements OnInit {
  razorpay: any;
  @Input() cartItems: any;
  @Input() address1: string = '';
  @Input() address2: string = '';
  @Output() clearCartEvent = new EventEmitter<void>();

  orderPlaced = false;
  userId: number = 0;
  originalamout: number = 0;
  deliveryAddress: string = '';
  currentSection = 1;
  lastDirection: string = 'left';

  constructor(private activeModal: NgbActiveModal, private cartService: CartService) {
    this.userId = Number(localStorage.getItem('userid'));
  }
  ngOnInit(): void {
    console.log(this.cartItems);
    console.log(this.address1);
    console.log(this.address2);
  }
  onCloseClick(): void {
    this.activeModal.close();
  }
  getTotalAmount(): number {
    this.originalamout = this.cartItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    return this.originalamout;
  }


  onSliderChange(event: any): void {
    if (event.value === 100) {
      this.orderPlaced = true;
    }
  }
  makePayment(): void {
    const amountInPaise = this.originalamout * 100;

    const razorpayOptions = {
      description: 'Food Delivery System',
      currency: 'INR',
      amount: amountInPaise,
      name: 'Food App',
      key: 'rzp_test_AekOZ0gOtU4sda',
      image: '/assets/FoodAppLogo.png',
      prefill: {
        name: 'Pranshu Pancholi',
        email: 'pranshupancholi773@gmail.com',
        phone: '9426604637'
      },
      theme: {
        color: '#6466e4'
      },
      modal: {
        ondismiss: () => {
          console.log('dismissed');
        }
      },
      handler: (response: any) => {
        console.log(response.razorpay_payment_id);
        this.storePaymentDetails(response.razorpay_payment_id, this.originalamout, this.deliveryAddress);

      }
    };

    const razorpay = new Razorpay(razorpayOptions);
    razorpay.on('payment.failed', (response: any) => {
      console.log('Payment failed:', response.error);
    });

    razorpay.open();
  }

  storePaymentDetails(paymentId: string, originalamout: number, deliveryAddress: string): void {
    console.log("delivery addresss" + deliveryAddress);
    this.cartService.storePaymentDetails(this.userId, this.cartItems, paymentId, originalamout, deliveryAddress)
      .subscribe(
        response => {
          Swal.fire({
            title: 'Success!',
            text: 'your order has been placed',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.activeModal.close();
          this.clearCartEvent.emit();
        },
        error => {
          console.error('Failed to store payment details:', error);
          Swal.fire({
            title: 'Error!',
            text: 'There was an error in placing your order.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
  }
  selectAddress(address: string): void {
    this.deliveryAddress = address;
    console.log("deliveryAddress" + this.deliveryAddress);
  }
  calculateTotal(): number {
    return this.cartItems.reduce((total: number, item: { price: number; quantity: number; }) => total + (item.price * item.quantity), 0);
  }



  nextSection(): void {
    this.lastDirection = 'right';
    if (this.currentSection <= 2) {
      this.currentSection++;
    }
  }
  prevSection(): void {
    this.lastDirection = 'left';
    if (this.currentSection >= 1) {
      this.currentSection--;
    }
  }
  getSectionClass(section: number): string {
    if (this.currentSection === section) {
      return 'active';
    } else if (this.currentSection > section) {
      return this.lastDirection === 'right' ? 'inactive-left' : 'inactive-right';
    } else {
      return this.lastDirection === 'left' ? 'inactive-right' : 'inactive-left';
    }
  }
}
