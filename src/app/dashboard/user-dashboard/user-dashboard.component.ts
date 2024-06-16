import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  isDropdownOpen = false;

    constructor(private router: Router) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    // Implement your logout logic here
     // Clear local storage
    localStorage.clear();

    // Redirect to login page
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
  navigateToOrderOnline() {
    console.log("In order online");
    // Use router.navigate to navigate without reloading the page
    this.router.navigate(['/dashboard/order-online']);
  }
}
