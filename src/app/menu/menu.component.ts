import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
declare module 'leaflet' {
  namespace Routing {
    function control(options: any): any;
  }
}
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  filteredMenu: any[] = [];
  showAllImages = false;
  menuData: any[] = [];
  isDropdownOpen = false;
  restaurantId: string | undefined;
  restaurantname: string | undefined;
  location: string | undefined;
  ratings: DoubleRange | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  userId: number | null = null; // Replace with the actual user ID
  activeSection: string = 'overview';
  isImagesSectionOpen: boolean = false;
  isImagesMenuSectionOpen: boolean = false;
  isMenuSectionOpen: boolean = true;
  isOverViewSectionOpen: boolean = false;
  map: L.Map | undefined; // Define map variable
  currentLatitude: number | undefined;
  currentLongitude: number | undefined;
  constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar, private cartService: CartService) { }

  ngOnInit(): void {
    const navigation = window.history.state;
    this.userId = Number(localStorage.getItem('userid'));
    if (navigation && navigation.menuData && navigation.restaurantId) {
      this.menuData = navigation.menuData;
      this.restaurantId = navigation.restaurantId;
      this.restaurantname = navigation.restaurantName;
      this.location = navigation.location;
      this.ratings = navigation.ratings;
      this.latitude = navigation.latitude;
      this.longitude = navigation.longitude;
      this.filteredMenu = [...this.menuData];
    } else {
      console.error('No menu data found in navigation state.');
    }
  }
  ngAfterViewInit(): void {
    // Ensure the map is only initialized after the DOM is ready
    if (this.isOverViewSectionOpen) {
      this.showMaps();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdownProfile() {
    this.router.navigate(['/drop-down-menu/profile']);
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

  setActiveSection(section: string) {
    this.activeSection = section;
    if (section === 'images') {
      this.isImagesMenuSectionOpen = true;
      this.isMenuSectionOpen = false;
      this.isOverViewSectionOpen = false;
    } else if (section === 'menu') {
      this.isImagesMenuSectionOpen = false;
      this.isMenuSectionOpen = true;
      this.isOverViewSectionOpen = false;
    }
    else if (section === 'overview') {
      this.isImagesMenuSectionOpen = false;
      this.isMenuSectionOpen = false;
      this.isOverViewSectionOpen = true;
      this.showMaps();
    }
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
          this.showSnackbar(`${item.itemName} added to cart`, 'View Cart');
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
        this.router.navigate(['/drop-down-menu/cart']);
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }

  filterRestaurants(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredMenu = this.menuData.filter(restaurant =>
      restaurant && restaurant.itemName && restaurant.itemName.toLowerCase().includes(query)
    );
    if (!query) {
      this.filteredMenu = this.menuData;
    }
  }

  toggleShowAllImages(): void {
    this.showAllImages = !this.showAllImages;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }
  showMaps(): void {
    console.log(this.latitude)
    this.getCurrentLocation().then((currentCoords) => {
      const { lat, lng } = currentCoords;
      this.currentLatitude = lat;
      this.currentLongitude = lng;

      console.log('Current Location - Latitude:', this.currentLatitude, 'Longitude:', this.currentLongitude);
      console.log('Restaurant Location - Latitude:', this.latitude, 'Longitude:', this.longitude);

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

}
