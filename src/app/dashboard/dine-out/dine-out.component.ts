import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-dine-out',
  standalone: true,
  imports: [CommonModule,FormsModule,NavbarComponent],
  templateUrl: './dine-out.component.html',
  styleUrl: './dine-out.component.css'
})
export class DineOutComponent implements OnInit {
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  menuData: any[] = [];
  isDropdownOpen = false;
  username: string;
  locationInput: string = ''; 


  constructor(private http: HttpClient, private router: Router, private authService: AuthService, private sharedService: SharedService) {
    this.username = authService.getUsername() || '';

  }

  ngOnInit(): void {
    this.fetchRestaurants();
    this.sharedService.filteredRestaurants$.subscribe(restaurants => {
      this.filteredRestaurants = restaurants;
    });
  }
  
  fetchRestaurants() {
    this.http.get<any[]>('https://localhost:7299/api/Food/Restaurants')
      .subscribe(
        (data) => {
          this.restaurants = data;
          this.filteredRestaurants = data;
          console.log(this.restaurants[3]);
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }


  onCardClick(restaurantId: number, restaurantName: string, location: string, ratings: number, latitude: number, longitude: number,openingTime:string,closingTime:string): void {
    const requestBody = {};
    this.http.post<any>(`https://localhost:7299/api/Food/GetRestaurantMenu/${restaurantId}`, requestBody)
      .subscribe(
        (menuData) => {
          this.router.navigate(['/menu'], { state: { fromDineOut:true,restaurantId, restaurantName, location, ratings, latitude, longitude,openingTime,closingTime, menuData } });

        },
        (error) => {
          console.error('Error fetching restaurant menu:', error);
        }
      );
  }
  calculateRatingWidth(rating: number): string {
    const maxRating = 5;
    const percentage = (rating / maxRating) * 100;
    return `${percentage}%`;
  }
  logout() {
    localStorage.clear();
    this.router.navigate(['authentication/login']);
    console.log('Logout clicked');
  }
  goToUserDashboard() {
    this.router.navigate(['dashboard/user-dashboard']);
  }
}

