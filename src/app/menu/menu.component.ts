import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  filteredMenu: any[] = [];
  showAllImages = false;
  menuData: any[] = [];
  isDropdownOpen = false;

  constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar, private cartService: CartService) { }

  ngOnInit(): void {
    const navigation = window.history.state;
    if (navigation && navigation.menuData) {
      this.menuData = navigation.menuData;
      this.filteredMenu = [...this.menuData]; // Initialize filteredMenu with all menuData
    } else {
      // Handle case where menuData is not available
      console.error('No menu data found in navigation state.');
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
      this.cartService.addItem(item);
      this.showSnackbar(`${item.itemName} added to cart`, 'View Cart');
      item.quantity = 0; // Reset quantity to 0
    } else {
      this.showSnackbar(`Please select a quantity greater than 0`);
    }
  }

  showSnackbar(message: string, action: string = 'Close') {
    const config = new MatSnackBarConfig();
    config.duration = 20000;
    config.panelClass = ['custom-snackbar'];

    // Set positioning relative to viewport
    config.horizontalPosition = 'center'; // Align horizontally center
    config.verticalPosition = 'top'; // Align vertically top

    const snackbarRef = this.snackBar.open(message, action, config);

    snackbarRef.onAction().subscribe(() => {
      if (action === 'View Cart') {
        this.router.navigate(['/drop-down-menu/cart']);
      }
    });
  }

  logout() {
    // Implement your logout logic here
    // Clear local storage
    localStorage.clear();

    // Redirect to login page
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }

  filterRestaurants(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredMenu = this.menuData.filter(restaurant =>
      restaurant && restaurant.itemName && restaurant.itemName.toLowerCase().includes(query)
    );

    // Check if the search input is empty, reset the filtered restaurants to all restaurants
    if (!query) {
      this.filteredMenu = this.menuData;
    }
  }

  toggleShowAllImages(): void {
    this.showAllImages = !this.showAllImages;
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`; // Formats to 2 decimal places
  }
}
