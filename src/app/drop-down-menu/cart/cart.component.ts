import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CartCheckOutComponent } from '../cart-check-out/cart-check-out.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../dashboard/navbar/navbar.component';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule,NavbarComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  originalCartItems: any[] = [];
  userId: number | null = null;
  username: string;

  changesMade: boolean = false;
  count: number | undefined;
  restauranId: number | null = null;
  itemId: number | null = null;
  quantity: number | null = null;
  totalPrice: number | null = null;
  isDropdownOpen = false;
  destinationLatitude: number | undefined;
  destinationLongitude: number | undefined;
  map: L.Map | undefined;
  routingControl: any; 

  latitude: number | undefined;
  longitude: number | undefined;
  currentLatitude: number | undefined;
  currentLongitude: number | undefined;

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar,
    private modalService: NgbModal,
    private authService: AuthService
  ) {
    this.userId = Number(localStorage.getItem('userid'));
    this.username = authService.getUsername() || '';
  }

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    const navigationState = window.history.state;
    if (navigationState) {
      this.latitude = navigationState.latitude;
      this.longitude = navigationState.longitude;
      this.currentLatitude = navigationState.currentLatitude;
      this.currentLongitude = navigationState.currentLongitude;
    }
    if (this.userId) {
      this.cartService.getCartDetails(this.userId).subscribe({
        next: (items: any[]) => {
          this.cartItems = items;
          this.originalCartItems = JSON.parse(JSON.stringify(items));
        },
        error: (error: any) => {
          console.error('Error fetching cart items:', error);
          this.showSnackbar('Failed to fetch cart items');
        }
      });
    } else {
      console.error('User ID not found in local storage.');
    }
  }
  ngAfterViewInit(): void {
  }
  
  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  increaseQuantity(item: any): void {
    item.quantity += 1;
    this.checkForChanges();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
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

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.checkForChanges();
    } else {
      this.removeItem(item);
    }
  }

  checkForChanges(): void {
    this.changesMade = this.cartItems.some((item, index) => item.quantity !== this.originalCartItems[index].quantity);
  }

  async saveChanges(cartItems: any): Promise<void> {
    if (this.userId) {
      try {
        for (const item of this.cartItems) {
          await this.cartService.addItemToCart(this.userId, item.restaurantId, item.itemId, item.quantity, item.price).toPromise();
        }
        this.changesMade = false;
        this.originalCartItems = JSON.parse(JSON.stringify(this.cartItems));
        this.showSnackbar('Changes saved successfully');
      } catch (error) {
        console.error('Failed to save changes:', error);
        this.showSnackbar('Failed to save changes');
      }
    } else {
      console.error('User ID not found in local storage.');
    }
  }

  showSnackbar(message: string, action: string = 'Close') {
    const config = new MatSnackBarConfig();
    config.duration = 2000;
    config.panelClass = ['custom-snackbar'];
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this.snackBar.open(message, action, config);
  }

  removeItem(item: any): void {
    const index = this.cartItems.indexOf(item);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.originalCartItems.splice(index, 1);
    }
  }

  loadCartItems(): void {
    if (this.userId) {
      this.cartService.getCartDetails(this.userId).subscribe({
        next: (items: any[]) => {
          this.cartItems = items;
        },
        error: (error: any) => {
          console.error('Error fetching cart items:', error);
          this.showSnackbar('Failed to fetch cart items');
        }
      });
    } else {
      console.error('User ID not found in local storage.');
    }
  }
  checkout(): void {
    if (this.userId) {
      this.authService.getUserDetails(this.userId).subscribe({
        next: (userDetails) => {
          console.log('User details fetched:', userDetails);
          if (!userDetails.address1 || !userDetails.address2) {
            this.showSnackbar('Please enter the address for delivery');
          } else {
            this.selectDeliveryAddress(userDetails.address1, userDetails.address2);
          }
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          this.showSnackbar('Failed to fetch user details');
        }
      });
    } else {
      console.error('User ID not found in local storage.');
    }
  }
  

  selectDeliveryAddress(address1: string, address2: string): void {
    const modalRef = this.modalService.open(CartCheckOutComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.cartItems = this.cartItems;
    modalRef.componentInstance.userId = this.userId;
    modalRef.componentInstance.address1 = address1;
    modalRef.componentInstance.address2 = address2;
    modalRef.componentInstance.clearCartEvent.subscribe(() => {
      this.clearCart();
      this.showMaps(this.currentLatitude,this.currentLongitude,this.latitude,this.longitude);
    });
  }
  

  showMaps(currentLatitude: number | undefined, currentLongitude: number | undefined, latitude:number|undefined, longitude:number|undefined): void {
    if (!currentLatitude || !currentLongitude) {
      console.error('Current latitude or longitude is undefined.');
      return;
    }

    const map = L.map('maps').setView([currentLatitude, currentLongitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([currentLatitude, currentLongitude]).addTo(map)
      .bindPopup('Your current location')
      .openPopup();
  }

  getCurrentLocation(): Promise<{ lat: number, lng: number }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ lat: 51.505, lng: -0.09 }); 
      }, 1000);
    });
  }

  
  
  
  clearCart(): void {
    if (this.userId) {
      this.cartService.clearCart(this.userId).subscribe({
        next: () => {
          this.cartItems = [];
          this.originalCartItems = [];
          console.log('Cart cleared successfully');
        },
        error: (error) => {
          console.error('Failed to clear cart:', error);
        }
      });
    } else {
      console.error('User ID not found in localStorage.');
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
}
