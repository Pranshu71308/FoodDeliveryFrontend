import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from '../../services/cart.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  @Input() order: any;
  @Input() userDetails:any;
  userId: number = 0;

modal: any;
constructor(private activeModal: NgbActiveModal, private cartService: CartService) {
  this.userId = Number(localStorage.getItem('userid'));
}

DownloadInvoice() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Food Order: Summary and Receipt', 10, 10);

  doc.setFontSize(12);
  doc.text(`Order ID: ${this.order.orderId}`, 10, 20);
  doc.text(`Order Time: ${this.order.date} at ${this.order.time}`, 10, 30);
  doc.text(`Customer Name:${this.userDetails.userName}`, 10, 40);
  doc.text(`Delivery Address: ${this.order.address}`, 10, 50);
  doc.text(`Restaurant Name: ${this.order.restaurantName}`, 10, 70);
  doc.text(`Restaurant Address: Showroom 12, Ground Floor, Ratnakar Nine Square, Satellite,\nAhmedabad`, 10, 80);
  doc.text(`Delivery partner's Name: Jadeja Rajendrasinh Chhatrasinh`, 10, 100);

  doc.text(`Item`, 10, 110);
  doc.text(`Quantity`, 80, 110);
  doc.text(`Unit Price`, 130, 110);
  doc.text(`Total Price`, 180, 110);

  let y = 120;
  this.order.items.forEach((item: any) => {
    doc.text(item.itemName, 10, y);
    doc.text(item.quantity.toString(), 80, y);
    doc.text(`₹${item.price}`, 130, y);
    doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 180, y);
    y += 10;
  });

  y += 10;
  doc.text(`Taxes: ₹${this.order.taxes}`, 10, y);
  y += 10;
  doc.text(`Round off: ₹${this.order.roundOff}`, 10, y);
  y += 10;
  doc.text(`Delivery charge subtotal: ₹${this.order.deliveryChargeSubtotal}`, 10, y);
  y += 10;
  doc.text(`Restaurant Packaging Charges: ₹${this.order.packagingCharges}`, 10, y);
  y += 10;
  doc.text(`Platform fee: ₹${this.order.platformFee}`, 10, y);
  y += 10;
  doc.text(`Other delivery charge discount: ₹${this.order.otherDiscount}`, 10, y);
  y += 10;
  doc.text(`Coupon - (SLASH50): ₹${this.order.couponDiscount}`, 10, y);

  y += 20;
  doc.text(`Total: ₹${this.order.totalPrice}`, 10, y);

  y += 10;
  doc.text(`Terms & Conditions: https://www.zomato.com/policies/terms-of-service/`, 10, y);

  doc.save('invoice.pdf');
}

onCloseClick(): void {
  this.activeModal.close();
}
}
