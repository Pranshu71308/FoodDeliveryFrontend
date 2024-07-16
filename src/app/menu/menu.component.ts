import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { BookMarkService } from '../services/book-mark.service';
import { PaymentService } from '../services/payment.service';
import { NavbarComponent } from '../dashboard/navbar/navbar.component';
import { SharedService } from '../services/shared.service';
import Swal from 'sweetalert2';

declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}
declare var Razorpay: any;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, ImageModalComponent, FormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, NavbarComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, AfterViewInit {
  showBookSeat: boolean = false;
  menuData: any[] = [];
  restaurantId: string | undefined;
  restaurantname: string | undefined;
  location: string | undefined;
  ratings: DoubleRange | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  opening: string | undefined;
  closing: string | undefined;
  closedStartDate: string | undefined;
  closedEndDate: string | undefined;
  filteredMenu: any[] = [];
  userId: number | null = null;
  showAllImages = false;
  isDropdownOpen = false;
  activeSection: string = 'overview';
  isImagesSectionOpen: boolean = false;
  isImagesMenuSectionOpen: boolean = false;
  isBookSeatSectionOpen: boolean = false;
  isMenuSectionOpen: boolean = true;
  isOverViewSectionOpen: boolean = false;
  map: L.Map | undefined;
  currentLatitude: number | undefined;
  currentLongitude: number | undefined;
  username: string;

  selectedDate: string = 'Today';
  selectedSlot: string = '';
  selectedGuests: number = 1;
  availableDates: string[] = [];
  availableSlot: string[] = ['Lunch', 'Dinner'];
  availableGuests: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  timeSlots: string[] = [];
  lunchSlots: string[] = [];
  dinnerSlots: string[] = [];
  isLunchDisabled: boolean = false;
  isBookmarked: boolean = false;
  isReviewBookingVisible: boolean = false;
  SelectedTimeSlot: string = '';
  showSpecialRequestBox = false;
  specialRequest: string = '';
  originalAmount: number = 0;
  bookingDate: Date = new Date();
  isbooknowEnabled: boolean = false;
  isTimeSlotSelected: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar, private cartService: CartService, private authService: AuthService, private paymentService: PaymentService, private BookMarkService: BookMarkService, private modalService: NgbModal, private cdr: ChangeDetectorRef, private sharedService: SharedService) {
    this.username = authService.getUsername() || '';
  }

  ngOnInit(): void {

    const state = window.history.state;
    this.userId = Number(localStorage.getItem('userid'));

    if (state && state.menuData && state.restaurantId) {
      this.showBookSeat = !!state.fromDineOut;
      this.menuData = state.menuData;
      this.restaurantId = state.restaurantId;
      this.restaurantname = state.restaurantName;
      this.location = state.location;
      this.ratings = state.ratings;
      this.latitude = state.latitude;
      this.longitude = state.longitude;
      this.opening = state.openingTime;
      this.closing = state.closingTime;
      this.closedStartDate = state.closedStartDate;
      this.closedEndDate = state.closedEndDate;
      this.filteredMenu = [...this.menuData];
      console.log("IN MENUSHB");
      console.log(this.closedEndDate);
    } else {
      console.error('No menu data found in navigation state.');
    }

    this.sharedService.filteredMenu$.subscribe(menus => {
      if (menus.length > 0) {
        this.filteredMenu = menus;
      }
    });
    this.setDefaultSlot();
    this.generateAvailableDates();
    this.generateTimeSlots(this.opening, this.closing);
    this.onDateChange();
  }

  ngAfterViewInit(): void {
    if (this.isOverViewSectionOpen) {
      setTimeout(() => {
        this.showMaps();
      }, 0);
    }
  }
  CheckSlot(date: string): void {
    const currentDate = new Date();

    if (date === 'Today' && currentDate.getHours() >= 16 && currentDate.getMinutes() >= 15) {
      this.availableSlot = ['Dinner'];
      this.selectedSlot = 'Dinner';
    } else {
      this.availableSlot = ['Lunch', 'Dinner'];
      this.selectedSlot = '';
      this.setDefaultSlot();
    }
  }

  onDateChange(): void {
    this.CheckSlot(this.selectedDate);
  }
  proceedToCart(): void {
    if (!this.isTimeSlotSelected) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a time slot.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    this.isReviewBookingVisible = true;

    const overviewSection = document.getElementById('overview');
    if (overviewSection) {
      overviewSection.style.display = 'none';
    }

    setTimeout(() => {
      const reviewSection = document.querySelector('.review-booking-section');
      if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }
  toggleSpecialRequestBox() {
    this.showSpecialRequestBox = !this.showSpecialRequestBox;
  }


  BookNow() {
    const bookingDate = this.reverseDateFormat(this.selectedDate);
    const bookingDateFormatted = bookingDate.toISOString().split('T')[0];
    const selectedTimeFormatted = this.convertTimeToHHMMSS(this.SelectedTimeSlot);
    this.makePayment(bookingDateFormatted, selectedTimeFormatted);
  }

  storeBookingDetails(
    paymentId: string,
    amount: number,
    bookingDateFormatted: string,
    selectedTimeFormatted: string,
    selectedGuests: number,
    restaurantname: string | undefined,
    location: string | undefined,
    specialRequest: string
  ): void {
    const bookingDetails = {
      userId: this.userId,
      restaurantId: parseInt(this.restaurantId!),
      guests: this.selectedGuests,
      bookingDate: bookingDateFormatted,
      bookingTime: selectedTimeFormatted,
      orderId: 1,
      orderNumber: 'Order_' + paymentId,
      amount: amount,
      specialRequest: this.specialRequest
    };

    this.paymentService.insertOrUpdateBooking(bookingDetails).subscribe(
      response => {
        console.log('Booking stored successfully', response);
        Swal.fire({
          title: 'Success!',
          text: 'Your booking has been stored successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.isbooknowEnabled = true;

      },
      error => {
        console.error('Error storing booking', error);
        Swal.fire({
          title: 'Error!',
          text: 'There was an error storing your booking.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );
  }

  reverseDateFormat(dateString: string): Date {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateString === 'Today') {
      return today;
    } else if (dateString === 'Tomorrow') {
      return tomorrow;
    } else if (dateString.includes(',')) {
      const parts = dateString.split(', ');
      const dateParts = parts[1].split(' ');
      const day = parseInt(dateParts[0], 10);
      const monthName = dateParts[1];
      const month = this.getMonthNumber(monthName);
      const year = today.getFullYear();
      return new Date(year, month, day + 1);
    } else {
      return new Date(dateString);
    }
  }

  getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    return months[monthName];
  }
  convertTimeToHHMMSS(timeString: string): string {
    const parts = timeString.split(' ');
    const timeParts = parts[0].split(':');
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const period = parts[1];

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    return formattedTime;
  }

  makePayment(bookingDateFormatted: string, selectedTimeFormatted: string): void {
    const amountInPaise = 50 * 100;
    this.originalAmount = amountInPaise / 100;
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
        console.log("In Handler");
        this.storeBookingDetails(
          response.razorpay_payment_id,
          this.originalAmount,
          bookingDateFormatted,
          selectedTimeFormatted,
          this.selectedGuests,
          this.restaurantname,
          this.location,
          this.specialRequest
        );

      }
    };

    const razorpay = new Razorpay(razorpayOptions);
    razorpay.on('payment.failed', (response: any) => {
    });

    razorpay.open();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdownProfile(): void {
    this.authService.getUserDetails(this.userId!).subscribe({
      next: (userDetails) => {
        this.router.navigate(['/drop-down-menu/profile'], { state: { userDetails } });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
  }
  toggleTimeSLot() {
    this.isTimeSlotSelected = !this.isTimeSlotSelected;
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
  toggleShowAllImages(): void {
    this.showAllImages = !this.showAllImages;
  }
  generateTimeSlots(openingTime: string | undefined, closingTime: string | undefined): void {
    if (!openingTime || !closingTime) return;

    const [openingHour, openingMinute] = openingTime.split(':').map(Number);
    const [closingHour, closingMinute] = closingTime.split(':').map(Number);

    const lunchEndHour = 16;
    let currentHour = openingHour;
    let currentMinute = openingMinute;

    this.lunchSlots = [];
    this.dinnerSlots = [];

    while (currentHour < closingHour || (currentHour === closingHour && currentMinute < closingMinute)) {
      const formattedTime = this.convertTo12HourFormat(this.formatTime(currentHour, currentMinute));

      if (!(currentHour === openingHour && currentMinute === openingMinute) &&
        !(currentHour === closingHour && currentMinute === closingMinute)) {
        if (currentHour < lunchEndHour) {
          this.lunchSlots.push(formattedTime);
        } else {
          this.dinnerSlots.push(formattedTime);
        }
      }

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour += 1;
      }
    }

    if (this.lunchSlots[this.lunchSlots.length - 1] === this.convertTo12HourFormat(this.formatTime(closingHour, closingMinute))) {
      this.lunchSlots.pop();
    }
    if (this.dinnerSlots[this.dinnerSlots.length - 1] === this.convertTo12HourFormat(this.formatTime(closingHour, closingMinute))) {
      this.dinnerSlots.pop();
    }
  }

  parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  formatTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  selectTimeSlot(SlotTime: string, slot: string): void {
    this.selectedSlot = SlotTime;
    this.SelectedTimeSlot = slot;
    this.toggleTimeSLot();
  }
  checkRestaurantStatus(closedStartDate: string | undefined, closedEndDate: string | undefined): string {
    if (!closedStartDate || !closedEndDate) {
      return 'Open';
    }

    const currentDate = new Date();
    const closedStartDate1 = new Date(closedStartDate);
    const closedEndDate1 = new Date(closedEndDate);

    if (currentDate >= closedStartDate1 && currentDate <= closedEndDate1) {
      return 'Closed';
    } else {
      return 'Open';
    }
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
  getStatus(openingTime: string | undefined, closingTime: string | undefined): string {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const formatTime = (timeString: string | undefined): string => {
      if (!timeString) {
        return '';
      }
      const [hours, minutes] = timeString.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    const openingDate = new Date(now);
    openingDate.setHours(parseInt(openingTime?.substr(0, 2) || '0'), parseInt(openingTime?.substr(3, 2) || '0'), 0, 0);

    const closingDate = new Date(now);
    closingDate.setHours(parseInt(closingTime?.substr(0, 2) || '0'), parseInt(closingTime?.substr(3, 2) || '0'), 0, 0);
    const subtractMinutes = (date: Date, minutes: number): Date => {
      return new Date(date.getTime() - minutes * 60000);
    };
    if (now >= openingDate && now <= closingDate) {
      return `Open Now`;
    } else if (now < openingDate && now >= subtractMinutes(openingDate, 30)) {
      return `Opens Soon`;
    } else if (now > closingDate && now <= this.addMinutes(closingDate, 30)) {
      return `Closes soon`;
    } else {
      return `Closed`;
    }

  }
  formatTime(hours: number, minutes: number): string {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }
  setDefaultSlot() {
    const currentDate = new Date();
    const defaultTime = new Date();
    defaultTime.setHours(16, 30, 0, 0);

    if (currentDate < defaultTime) {
      this.selectedSlot = 'Lunch';
    } else {
      this.selectedSlot = 'Dinner';
    }
  }
  getStatusClass(openingTime: string | undefined, closingTime: string | undefined): string {
    const status = this.getStatus(openingTime, closingTime);
    switch (status) {
      case 'Open Now':
        return 'open-now';
      case 'Closes soon':
        return 'closes-soon';
      case 'Closed':
        return 'closed';
      case 'Opens Soon':
        return 'opens-soon';
      default:
        return '';
    }
  }
  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }
  setActiveSection(section: string) {
    this.activeSection = section;

    if (section === 'images') {
      this.isImagesMenuSectionOpen = true;
      this.isMenuSectionOpen = false;
      this.isOverViewSectionOpen = false;
      this.isBookSeatSectionOpen = false;
      this.isReviewBookingVisible = false;
    } else if (section === 'menu') {
      this.isMenuSectionOpen = true;
      this.isImagesMenuSectionOpen = false;
      this.isOverViewSectionOpen = false;
      this.isBookSeatSectionOpen = false;
      this.isReviewBookingVisible = false;
    } else if (section === 'overview') {
      this.isOverViewSectionOpen = true;
      this.isImagesMenuSectionOpen = false;
      this.isMenuSectionOpen = false;
      this.isBookSeatSectionOpen = false;
      this.isReviewBookingVisible = false;
      this.showMaps();
    } else if (section === 'BookSeat') {
      this.isBookSeatSectionOpen = true;
      this.isImagesMenuSectionOpen = false;
      this.isMenuSectionOpen = false;
      this.isOverViewSectionOpen = false;
      this.isReviewBookingVisible = false;
    }
    this.cdr.detectChanges();

    const sectionElement = document.getElementById(section);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }

    const links = document.querySelectorAll('.section-links a');
    links.forEach(link => {
      link.classList.remove('active');
      if ((link as HTMLElement).innerText.toLowerCase() === section) {
        link.classList.add('active');
      }
    });
  }
  generateAvailableDates(): void {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let formattedDate = '';
      if (i === 0) {
        formattedDate = 'Today';
      } else if (i === 1) {
        formattedDate = 'Tomorrow';
      } else {
        const dayName = daysOfWeek[date.getDay()];
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        formattedDate = `${dayName}, ${day} ${month}`;
      }

      this.availableDates.push(formattedDate);
    }
  }


  SaveRestaurantOverView() {
    this.BookMarkService.addBookmark(this.userId, this.restaurantId).subscribe({
      next: (response) => {
        this.isBookmarked = true;
        console.log('Bookmark added successfully', response);
      },
      error: (error) => {
        console.error('Error adding bookmark', error);
      }
    });
  }
  increaseQuantity(item: any): void {
    item.quantity = (item.quantity || 0) + 1;
  }

  decreaseQuantity(item: any): void {
    if (item.quantity && item.quantity > 0) {
      item.quantity -= 1;
    }
  }

  addToCart(item: any): void {
    if (item.quantity && item.quantity > 0) {
      const totalPrice = item.price;
      this.cartService.addItemToCart(this.userId!, parseInt(this.restaurantId!), item.itemId, item.quantity, totalPrice).subscribe({
        next: (response: any) => {

          Swal.fire({
            title: 'Success!',
            text: 'Item added to your cart',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          item.quantity = 0;
        },
        error: (error: any) => {
          console.error('Error adding item to cart:', error);
          this.showSnackbar('Failed to add item to cart');
        }
      });
    } else {
      this.showSnackbar(`Please select a quantity greater than 0`);
    }
  }

  showSnackbar(message: string, action: string = 'Close') {
    const config = new MatSnackBarConfig();
    config.duration = 20000;
    config.panelClass = ['custom-snackbar'];
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top'

    const snackbarRef = this.snackBar.open(message, action, config);

    snackbarRef.onAction().subscribe(() => {
      if (action === 'View Cart') {
        this.router.navigate(['/drop-down-menu/cart'], {
          state: {
            latitude: this.latitude,
            longitude: this.longitude,
            currentLatitude: this.currentLatitude,
            currentLongitude: this.currentLongitude
          }
        });
      }
    });
  }

  showMaps(): void {
    const mapsElement = document.getElementById('maps');

    if (mapsElement) {
      this.getCurrentLocation().then((currentCoords) => {
        const { lat, lng } = currentCoords;
        this.currentLatitude = lat;
        this.currentLongitude = lng;
        this.map = L.map('maps').setView([this.currentLatitude, this.currentLongitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        if (this.latitude !== undefined && this.longitude !== undefined) {

          const restaurantMarker = L.marker([this.latitude, this.longitude]).addTo(this.map)
            .bindPopup(`${this.location}`)
            .openPopup();
        } else {
          console.error('Restaurant coordinates are undefined.');
        }
        const currentLocationMarker = L.marker([this.currentLatitude, this.currentLongitude]).addTo(this.map)
          .bindPopup('Your Current Location')
          .openPopup();

        if (this.latitude !== undefined && this.longitude !== undefined) {
          L.Routing.control({
            waypoints: [
              L.latLng(this.currentLatitude, this.currentLongitude),
              L.latLng(this.latitude, this.longitude)
            ],
          }).addTo(this.map);
        } else {
          console.error('Cannot add routing control: Restaurant coordinates are undefined.');
        }
      }).catch((error) => {
        console.error('Error getting current location:', error);
      });
    }
    else {
      console.error('Map container element #maps not found.');

    }
  }

  getCurrentLocation(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        }, (error) => {
          reject(error);
        });
      } else {
        reject(new Error('Geolocation not supported by this browser.'));
      }
    });
  }
  showBigImage(foodImage: any): void {
    const modalRef = this.modalService.open(ImageModalComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.foodImage = foodImage;

  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
  }
}