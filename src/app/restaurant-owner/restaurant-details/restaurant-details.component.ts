import { ChangeDetectorRef, Component } from '@angular/core';
import { OrderSummaryComponent } from '../../drop-down-menu/order-summary/order-summary.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { BookMarkService } from '../../services/book-mark.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../dashboard/navbar/navbar.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { OwnerService, OrderDetails, ExpandedTransactions, RestaurantData } from '../../services/owner.service';
import { RestaurantOrderComponent } from '../restaurant-order/restaurant-order.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { MenuItem } from '../../services/owner.service';
import { faL } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css',
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
})
export class RestaurantDetailsComponent {
  userDetails: any;
  restaurantId: number | null = null;
  restaurantDetails: any;
  updatedRestaurantDetails: any;
  selectedButton: string = 'profile';
  pastOrders: OrderDetails[] = [];
  isDropdownOpen = false;
  username: string;
  userId: number | null = null;
  showMoreDetails: boolean = false;
  currentExpandedOrderId: number | null = null;
  bookmarks: any[] = [];
  bookingDetails: any[] = [];
  editMode: boolean = false;
  editModerestaurant: boolean = false;
  originalUserDetails: any;
  originalRestaurantDetails: any;
  currentExpandedTransaction: ExpandedTransactions = {};
  transactionNumber: string | null = null;
  today: string = new Date().toISOString().split('T')[0];
  closingStartDateError: boolean = false;
  closingEndDateError: boolean = false;
  formSubmitted = false;
  opentimeError = false;
  closetimeError = false;
  sameStartDateAndEndDateError=false;
  menuItems: MenuItem[] = [];
  EditMenuModel=false;
  cardImageBase64: string = '';
  isImageSaved=false;
  editIndex: number | null = null;
  restaurantImages:string[]=[];
  bookings: any[] = [];

  constructor(private ownerService: OwnerService, private route: ActivatedRoute, private router: Router, private cartService: CartService, private authService: AuthService, private bookmarkService: BookMarkService, private modalService: NgbModal, private cdr: ChangeDetectorRef, private paymentService: PaymentService, private snackBar: MatSnackBar) {
    this.username = authService.getUsername() || '';
  }
  ngOnInit(): void {
    this.userDetails = history.state.userDetails;
    this.restaurantDetails = history.state.restaurant;
    this.restaurantId = this.restaurantDetails.restaurantID;
    this.ownerService.getRestaurantById(this.restaurantId!).subscribe({
      next: (RestaurantData) => {
        console.log("In RESVHJ");
        this.restaurantDetails = { ...RestaurantData };
        console.log("THIS.RESTAURANT DETAILS")
        console.log(this.restaurantDetails);
        this.updatedRestaurantDetails = { ...this.restaurantDetails };
     
      },
      error: (error) => {
        console.error('Error fetching user details:', error);

      }
    })
    this.userId = Number(localStorage.getItem('userid'));
    this.fetchOrders();
    this.authService.getUserDetails(this.userId!).subscribe({
      next: (userDetails) => {
        this.originalUserDetails = { ...userDetails };
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
  }
  checkRestaurantStatus(): string {
    if (!this.updatedRestaurantDetails.closedStartDate || !this.updatedRestaurantDetails.closedEndDate) {
      return 'Open';
    }

    const currentDate = new Date();
    const closedStartDate = new Date(this.updatedRestaurantDetails.closedStartDate);
    const closedEndDate = new Date(this.updatedRestaurantDetails.closedEndDate);

    if (currentDate >= closedStartDate && currentDate <= closedEndDate) {
      return 'Closed';
    } else {
      return 'Open';
    }
  }


  validateClosingStartDate(selectedDate: string) {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      this.closingStartDateError = true;
    } else {
      this.closingStartDateError = false;
    }
    this.checkSameStartAndEndDate();

  }
  validateClosingEndDate(selectedDate: string) {
    if (selectedDate < this.restaurantDetails.closingStartDate) {
      this.closingEndDateError = true;
    } else {
      this.closingEndDateError = false;
    }
    this.checkSameStartAndEndDate();

  }
  checkSameStartAndEndDate() {
    if (this.updatedRestaurantDetails.closedStartDate === this.updatedRestaurantDetails.closedEndDate) {
      this.sameStartDateAndEndDateError = true;
    } else {
      this.sameStartDateAndEndDateError = false;
    }
  }
  getBookings(): void {
    console.log(this.restaurantDetails.restaurantID);
    this.ownerService.getBookings(this.restaurantDetails.restaurantID).subscribe(
      (response) => {
        this.bookings = response;
        console.log(this.bookings);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
      }
    );
  }
  fetchOrders(): void {
    if (this.restaurantDetails && this.restaurantDetails.restaurantID) {
      this.ownerService.fetchRestaurantOrder(this.restaurantDetails.restaurantID).subscribe({
        next: (orderDetails: OrderDetails[]) => {
          this.pastOrders = orderDetails;
        },
        error: (error) => {
          console.error('Error fetching past orders:', error);
        }
      });
    }
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
  toggleEditMenuMode(index: number):void{
    if (this.editIndex === index) {
      this.editIndex = null; 
      const request = {
        RestaurantId: this.restaurantId, 
        MenuItems:[this.menuItems[index]]
      };

      this.ownerService.updateRestaurantMenu(request).subscribe(
        response => {
          Swal.fire({
            title: 'Success!',
            text: 'menu Details has been chhanges successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.editIndex = null; 
        },
        error => {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error in updating your detail. Please try again after sometime.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      this.editIndex = index;
    }
  
  } 

  toggleDropdownProfile(): void {
    this.authService.getUserDetails(this.userId!).subscribe({
      next: (userDetails) => {
        console.log(userDetails);
        this.router.navigate(['/drop-down-menu/profile'], { state: { userDetails } });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
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

  onFileSelected(event: any, item: any): void {
    this.CreateBase64String(event);
  }
  CreateBase64String(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgBase64Path = e.target.result;
          this.cardImageBase64 = imgBase64Path;         
          this.isImageSaved = true;
          console.log(this.cardImageBase64);
        };
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
  selectButton(button: string) {
    this.selectedButton = button;
    if (button === 'bookmarks') {
    } else if (button === 'pastOrders') {
      this.fetchOrders();
    }
    else if (button === 'Your Booking') {
      this.getBookings();
    }
    else if( button === 'Menu'){
      this.fetchMenuDetails();
    }

  }

  fetchMenuDetails():void{
    this.ownerService.getMenuItemsByRestaurantId(this.restaurantId)
      .subscribe(
        (menuItems: MenuItem[]) => {
          this.menuItems = menuItems;
          console.log(this.menuItems);
        },
        (error) => {
          console.error('Error fetching menu:', error);
        }
      );
  
  }
  initializeExpandedTransactions(): void {
    this.pastOrders.forEach(order => {
      this.currentExpandedTransaction[order.transactionNumber] = false;
    });
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
  showOrderSummary(order: any, userDetails: any, pastOrders: any): void {
    console.log(order);
    const modalRef = this.modalService.open(RestaurantOrderComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.order = order;
    modalRef.componentInstance.userDetails = userDetails;
    modalRef.componentInstance.pastOrders = pastOrders;
  }
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }
  toggleEditMode1(): void {
    this.editModerestaurant = !this.editModerestaurant;
  }
  isDataChanged(): boolean {
    if (!this.userDetails || !this.originalUserDetails) {
      return false;
    }

    const userDetailsChanged =
      this.userDetails.userName !== this.originalUserDetails.userName ||
      this.userDetails.email !== this.originalUserDetails.email ||
      this.userDetails.phoneNumber !== this.originalUserDetails.phoneNumber;
    return userDetailsChanged;
  }
  toggleItemsVisibility(order: any): void {
    this.currentExpandedTransaction[order.orderId] = !this.currentExpandedTransaction[order.orderId];
    this.cdr.detectChanges();
  }
  saveChanges(): void {
    if (this.isDataChanged()) {
      const userDetailsToUpdate = {
        userId: this.userId,
        userName: this.userDetails.userName,
        email: this.userDetails.email,
        phoneNumber: this.userDetails.phoneNumber,
        password: 'Pranshu@123'
      };

      this.authService.updateUserDetails(userDetailsToUpdate).subscribe(
        response => {
          console.log('User details updated successfully', response);
          this.editMode = false;
          this.originalUserDetails = { ...this.userDetails };
          Swal.fire({
            title: 'Success!',
            text: 'your data has been saved',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        error => {
          Swal.fire({
            title: 'Error!',
            text: 'There was an error, please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          if (error.status === 400 && error.error && error.error.errors) {
            for (const key in error.error.errors) {
              if (error.error.errors.hasOwnProperty(key)) {
                console.error(`Validation error: ${key} - ${error.error.errors[key]}`);
              }
            }
          } else {
            console.error('Unexpected error:', error);
          }
        }
      );
    }
  }

  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
  saveRestaurantChanges(): void {
    this.formSubmitted = true;
    this.editModerestaurant = false;
    this.updatedRestaurantDetails.closeStartDate = this.convertToPostgresDateTime(this.updatedRestaurantDetails.closedStartDate, '00:00:00');
    this.updatedRestaurantDetails.closeEndDate = this.convertToPostgresDateTime(this.updatedRestaurantDetails.closedEndDate, '23:59:59');

    console.log('Converted closeStartDate:', this.updatedRestaurantDetails.closeStartDate);
    console.log('Converted closeEndDate:', this.updatedRestaurantDetails.closeEndDate);
    if (this.updatedRestaurantDetails.closingEndDate < this.updatedRestaurantDetails.closingStartDate) {
      this.snackBar.open('To date cannot be before From date', 'Close', {
        duration: 3000,
      });

      return;
    }

    if (this.compareTime(this.updatedRestaurantDetails.closingTime, this.updatedRestaurantDetails.openingTime) <= 0) {
      this.snackBar.open('Closing time should be after opening time', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (this.updatedRestaurantDetails.openingTime === '00:00') {
      this.opentimeError = true;
      return;
    }

    if (this.updatedRestaurantDetails.closingTime === '00:00') {
      this.closetimeError = true;
      return;
    }
    this.updatedRestaurantDetails.openingTime = this.convertToHHMMSS(this.updatedRestaurantDetails.openingTime);
    this.updatedRestaurantDetails.closingTime = this.convertToHHMMSS(this.updatedRestaurantDetails.closingTime);

    if (this.isValidRestaurantDetails(this.updatedRestaurantDetails)) {
      this.ownerService.updateRestaurantDetails(this.updatedRestaurantDetails).subscribe(
        response => {
          console.log('Restaurant details updated successfully', response);
          this.restaurantDetails = { ...this.updatedRestaurantDetails };
          Swal.fire({
            title: 'Success!',
            text: 'your data has been saved',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        error => {
          console.error('Error updating restaurant details', error);
          Swal.fire({
            title: 'Error!',
            text: 'There was an error in updating restaurant details, Please try again after sometime.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      console.error('Invalid restaurant details');
      this.snackBar.open('Invalid restaurant details', 'Close', {
        duration: 3000,
      });
    }
  }
  convertToPostgresDateTime(dateString: string | undefined, timeString: string): string | null {
    if (!dateString) {
      console.log('Invalid dateString:', dateString);
      return null;
    }

    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.log('Invalid parts:', parts);
      return null;
    }

    const postgresFormat = `${parts[2]}-${parts[1]}-${parts[0]} ${timeString}`;
    console.log('Converted PostgreSQL format:', postgresFormat);
    return postgresFormat;
  }


  convertToHHMMSS(time: string): string {
    if (time && time.length === 5) {
      return time + ':00';
    }
    return time;
  }
  isValidRestaurantDetails(details: Partial<RestaurantData>): boolean {
    return !!details.restaurantID;
  }

  compareTime(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    if (hours1 < hours2) {
      return -1;
    } else if (hours1 > hours2) {
      return 1;
    } else {
      if (minutes1 < minutes2) {
        return -1;
      } else if (minutes1 > minutes2) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  getClosingStartDate(): string {
    return this.restaurantDetails.closedStartDate ? this.restaurantDetails.closedStartDate.split('T')[0] : '';
  }
  setClosingStartDate(value: string): void {
    this.restaurantDetails.closedStartDate = value === '' ? null : value;
  }
  getClosingEndDate(): string {
    return this.restaurantDetails.closedEndDate ? this.restaurantDetails.closedEndDate.split('T')[0] : '';
  }
  setClosingEndDate(value: string): void {
    this.restaurantDetails.closedEndDate = value === '' ? null : value;
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
