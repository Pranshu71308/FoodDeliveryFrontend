import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-restaurant-order',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './restaurant-order.component.html',
  styleUrl: './restaurant-order.component.css'
})
export class RestaurantOrderComponent {
  @Input() order: any;
  @Input() userDetails: any;
  @Input() pastOrders: any;
  userId: number = 0;
  modal: any;
  constructor(private activeModal: NgbActiveModal, private cartService: CartService) {
    this.userId = Number(localStorage.getItem('userid'));
    console.log("In orders");
    console.log(this.order);
  }
  onCloseClick(): void {
    this.activeModal.close();
  }
  formatDate(date: string): string {
    if (!date) return 'N/A';
    const options = { day: '2-digit', month: 'short' } as const;
    return new Date(date).toLocaleDateString('en-US', options);
  }
  convertTo12HourFormat(timeString: string | undefined): string {
    if (!timeString) {
      return '';
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
