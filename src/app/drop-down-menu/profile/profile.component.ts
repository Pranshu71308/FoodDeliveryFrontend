import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { BookMarkService } from '../../services/book-mark.service';
import { MenuComponent } from "../../menu/menu.component";
import { NavbarComponent } from '../../dashboard/navbar/navbar.component';
import { PaymentService } from '../../services/payment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0 }))
      ])
    ])
  ],
  imports: [CommonModule, MenuComponent, NavbarComponent]
})
export class ProfileComponent {
  userDetails: any;
  selectedButton: string = 'profile';
  pastOrders: any[] = [];
  isDropdownOpen = false;
  username: string;
  userId: number | null = null;
  showMoreDetails: boolean = false;
  currentExpandedOrderId: number | null = null;
  bookmarks: any[] = [];
  bookingDetails: any[] = [];
  restaurantId: number = 0;
  isRatingDone = false;
  ratedOrders: number[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private cartService: CartService, private authService: AuthService, private bookmarkService: BookMarkService, private modalService: NgbModal, private cdr: ChangeDetectorRef, private paymentService: PaymentService) {
    this.username = authService.getUsername() || '';
  }
  ngOnInit(): void {
    this.userDetails = history.state.userDetails;
    this.userId = Number(localStorage.getItem('userid'));
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDetails(orderId: number): void {
    if (this.currentExpandedOrderId === orderId) {
      this.currentExpandedOrderId = null;
    } else {
      this.currentExpandedOrderId = orderId;
    }
  }

  toggleDropdownCart() {
    this.router.navigate(['/drop-down-menu/cart']);

    this.cartService.getCartDetails(this.userId!).subscribe({
      next: (cartDetails: any) => {
        console.log('Fetched cart details:', cartDetails);
      },
      error: (error: any) => {
        console.error('Error fetching cart details:', error);
      }
    });
  }
  selectButton(button: string) {
    this.selectedButton = button;
    if (button === 'bookmarks') {
      this.fetchBookmarks();
    } else if (button === 'pastOrders') {
      this.fetchPastOrders();
    }
    else if (button === 'Your Booking') {
      this.fetchPastBookings();
    }

  }
  OpenRatings(restaurantId: number, orderId: number) {
    const starsHTML = `
     <div class="rate">
    <input type="radio" id="star5" name="rate" value="5" />
    <label for="star5" title="text">5 stars</label>
    <input type="radio" id="star4" name="rate" value="4" />
    <label for="star4" title="text">4 stars</label>
    <input type="radio" id="star3" name="rate" value="3" />
    <label for="star3" title="text">3 stars</label>
    <input type="radio" id="star2" name="rate" value="2" />
    <label for="star2" title="text">2 stars</label>
    <input type="radio" id="star1" name="rate" value="1" />
    <label for="star1" title="text">1 star</label>
  </div>
  <style>  
  .rate {
      justify-content: center;
    width: 100%;
    display: flex;
        flex-direction: row-reverse;
    float: left;
    height: 46px;
    padding: 0 10px;
}
.rate:not(:checked) > input {
    position:absolute;
    top:-9999px;
}
.rate:not(:checked) > label {
    float:right;
    width:1em;
    overflow:hidden;
    white-space:nowrap;
    cursor:pointer;
    font-size:30px;
    color:#ccc;
}
.rate:not(:checked) > label:before {
    content: '★ ';
}
.rate > input:checked ~ label {
    color: #ffc700;    
}
.rate:not(:checked) > label:hover,
.rate:not(:checked) > label:hover ~ label {
    color: #deb217;  
}
.rate > input:checked + label:hover,
.rate > input:checked + label:hover ~ label,
.rate > input:checked ~ label:hover,
.rate > input:checked ~ label:hover ~ label,
.rate > label:hover ~ input:checked ~ label {
    color: #c59b08;
}
    </style>`;

    Swal.fire({
      title: 'Rate this item',
      html: starsHTML,
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const rating = document.querySelector<HTMLInputElement>('input[name="rate"]:checked');
        if (!rating) {
          Swal.showValidationMessage('Please select a rating');
        }
        return rating ? rating.value : null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value !== null) {
        const selectedRating = result.value;
        this.isRatingDone=true;
        this.cartService.storeRatingDetails(restaurantId, selectedRating).subscribe({
          next: (response) => {
            this.ratedOrders.push(orderId);
            Swal.fire({
              title: 'Success!',
              text: `You rated ${selectedRating} stars.`,
              icon: 'success',
              confirmButtonText: 'OK',
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: 'Something went wrong, please try again later.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  fetchPastBookings(): void {
    if (this.userId) {
      this.paymentService.getBookingDetails(this.userId!).subscribe({

        next: (bookingDetails: any[]) => {
          this.bookingDetails = bookingDetails.map(booking => ({
            ...booking,
            bookingTime: this.convertTo12HourFormat(booking.bookingTime)
          }));
        },
        error: (error: any) => {
          console.error('Error fetching cart details:', error);
        }
      });
    }
  }
  convertTo12HourFormat(time: string): string {
    let [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  fetchPastOrders() {
    if (this.userId) {
      this.cartService.getUserOrders(this.userId).subscribe({
        next: (orders) => {
          this.pastOrders = orders;
          console.log(this.pastOrders);

        },
        error: (error) => {
          console.error('Error fetching past orders:', error);
        }
      });
    }
  }
  fetchBookmarks() {
    if (this.userId) {
      console.log(this.userId);
      this.bookmarkService.getBookmarks(this.userId).subscribe({
        next: (bookmarks) => {
          this.bookmarks = bookmarks;
        },
        error: (error) => {
          console.error('Error fetching bookmarks:', error);
        }
      });
    }
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
  showOrderSummary(order: any, userDetails: any): void {
    const modalRef = this.modalService.open(OrderSummaryComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.userDetails = userDetails;
  }
}
