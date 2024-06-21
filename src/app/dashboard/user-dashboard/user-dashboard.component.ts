import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  isDropdownOpen = false;
  username:string;
    constructor(private router: Router,private authService:AuthService) {
      this.username = authService.getUsername() || '';
    }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDropdownCart() {
    this.router.navigate(['/drop-down-menu/cart']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
  navigateToOrderOnline() {
    console.log("In order online");
    this.router.navigate(['/dashboard/order-online']);
  }
}
