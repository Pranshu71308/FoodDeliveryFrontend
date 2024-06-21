import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mergeNsAndName } from '@angular/compiler';

@Component({
  selector: 'app-order-online',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-online.component.html',
    styleUrl: './order-online.component.css'
})
export class OrderOnlineComponent implements OnInit {
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  menuData: any[] = []; // Assuming menuData is an array of items
  isDropdownOpen = false;
  username:string;


  constructor(private http: HttpClient, private router: Router,private authService:AuthService) { 
    this.username = authService.getUsername() || '';

  }

  ngOnInit(): void {
    this.fetchRestaurants();
    
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleDropdownCart() {
    this.router.navigate(['/drop-down-menu/cart']);
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

  filterRestaurants(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant && restaurant.restaurantName && restaurant.restaurantName.toLowerCase().includes(query)
    );

    if (!query) {
      this.filteredRestaurants = this.restaurants;
    }
  }

  onCardClick(restaurantId: number,restaurantName:string,location:string,ratings:number,latitude:number,longitude:number): void {
    const requestBody = {};
    this.http.post<any>(`https://localhost:7299/api/Food/GetRestaurantMenu/${restaurantId}`,requestBody)
      .subscribe(
        (menuData) => {
          this.router.navigate(['/menu'], { state: { restaurantId,restaurantName,location,ratings,latitude,longitude, menuData } });

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
}
