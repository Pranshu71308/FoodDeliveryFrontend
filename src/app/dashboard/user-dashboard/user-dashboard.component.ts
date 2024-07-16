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
  userId: number | null = null; 

  username:string;
    constructor(private router: Router,private authService:AuthService) {
      this.username = authService.getUsername() || '';
    }

    ngOnInit(): void {
      this.userId = Number(localStorage.getItem('userid'));
    }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDropdownCart() {
    this.router.navigate(['/drop-down-menu/cart']);
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
  addRestaurant(){
    this.router.navigate(['restaurant-owner/add-restaurant']);

  }
  Home(){
    this.router.navigate(['dashboard/user-dashboard']);
  }
  goToContact(){
    console.log("MKLJHGCF");
    this.router.navigate(['/dashboard/contact']);
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
  navigateTodineOut(){
    this.router.navigate(['/dashboard/dine-out']);
  }
}
