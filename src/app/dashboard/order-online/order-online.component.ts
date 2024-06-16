import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.fetchRestaurants();
    
  }

  fetchRestaurants() {
    // Replace 'API_URL' with the actual URL of your API endpoint
    this.http.get<any[]>('https://localhost:7299/api/Food/Restaurants')
      .subscribe(
        (data) => {
          this.restaurants = data; // Assign fetched data to 'restaurants' array
          this.filteredRestaurants = data; // Initialize filteredRestaurants with all data
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

    // Check if the search input is empty, reset the filtered restaurants to all restaurants
    if (!query) {
      this.filteredRestaurants = this.restaurants;
    }
  }

  onCardClick(restaurantId: number): void {
    console.log(restaurantId);
    const requestBody = {};
    this.http.post<any>(`https://localhost:7299/api/Food/GetRestaurantMenu/${restaurantId}`,requestBody)
      .subscribe(
        (menuData) => {
          console.log(menuData);
          this.router.navigate(['/menu'], { state: { menuData } });
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
}
