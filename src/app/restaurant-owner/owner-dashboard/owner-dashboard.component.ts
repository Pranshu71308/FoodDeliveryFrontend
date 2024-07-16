import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { OwnerService, RestaurantData } from '../../services/owner.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { NavbarComponent } from '../../dashboard/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FormsModule, MatCommonModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent {
  restaurants: RestaurantData[] = [];
  userId: number | undefined = 0;
  isRestaurantExist = false;
  constructor(private ownerService: OwnerService,private sharedService:SharedService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userid'));
    this.fetchRestaurants(this.userId);
    this.sharedService.filteredRestaurants$.subscribe(restaurants => {
      this.restaurants = restaurants;
    });
  }

  fetchRestaurants(userId: number): void {
    this.ownerService.getRestaurantsByUserId(userId).subscribe({
      next: (data) => {
        this.isRestaurantExist = true;
        this.restaurants = data;
        console.log(this.restaurants);
      },
      error: (err) => {
        console.error('Error fetching restaurant data', err);
      }
    });
  }
  checkRestaurantStatus(restaurant: RestaurantData): string {
    if (!restaurant.closedStartDate || !restaurant.closedEndDate) {
      return 'Open';
    }
  
    const currentDate = new Date();
    const closedStartDate = new Date(restaurant.closedStartDate);
    const closedEndDate = new Date(restaurant.closedEndDate);
  
    if (currentDate >= closedStartDate && currentDate <= closedEndDate) {
      return 'Closed';
    } else {
      return 'Open'; 
    }
  }
  openRestaurantCard(restaurant: any) {
    console.log(restaurant)
    this.authService.getUserDetails(this.userId!).subscribe({
      next: (userDetails) => {
        this.router.navigate(['restaurant-owner/restaurant-details'], {
          state: {
            userDetails: userDetails,
            restaurant: restaurant
          }
        });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
      }
    });
  }

}
