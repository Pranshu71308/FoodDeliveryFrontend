import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-online',
  standalone: true,
  imports: [CommonModule, UserDashboardComponent, FormsModule],
  templateUrl: './order-online.component.html',
  styleUrls: ['./order-online.component.css']
})
export class OrderOnlineComponent implements OnInit {
  restaurants: any[] = [];
  filteredRestaurants: any[] = [];
  menuData: any[] = [];
  isDropdownOpen = false;
  username: string;
  currentCity: string | undefined;
  isLocationDropdownOpen = false;
  userId: number | null = null;
  locationInput: string = ''; 
  filteredMenu: any[] = [];

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
    this.username = authService.getUsername() || '';
  }

  ngOnInit(): void {
    this.fetchRestaurants();
    this.userId = Number(localStorage.getItem('userid'));
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDropdownCart() {
    this.router.navigate(['/drop-down-menu/cart']);
  }

  toggleLocationDropdown() {
    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
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
  filterByLocation(event: any): void {
    const query = event.target.value.toLowerCase();
    const locationQuery = this.locationInput.toLowerCase();

    this.filteredRestaurants = this.restaurants.filter(restaurant => {
        const matchesLocation = restaurant && restaurant.location && restaurant.location.toLowerCase().includes(locationQuery);
        console.log("Filtered restaurant");
        console.log("restaurant",restaurant);
        return matchesLocation;
    });
    console.log("this.filterRestaurants",this.filterRestaurants);


    if (!query) {
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant && restaurant.location && restaurant.location.toLowerCase().includes(locationQuery)
      );
    }
  }

  detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.getCityFromCoordinates(latitude, longitude).then(city => {
          this.currentCity = city;
          this.locationInput = city; 
          this.isLocationDropdownOpen = false;
          this.filterRestaurantsBasedOnLocation();
        }).catch(error => {
          console.error('Error fetching city:', error);
        });
      }, error => {
        console.error('Error getting location:', error);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
  goToContact(){
    this.router.navigate(['/dashboard/contact']);
  }
  async getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
    const apiKey = '06174c4875bd4d6499d7f3313450b6c9'; 
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;
    try {
        const response = await this.http.get<any>(url).toPromise();
        const results = response.results;
        if (results.length > 0) {
            const components = results[0].components;
            console.log('Components:', components);
            return components.state_district || components.city || components.town || components.village || components.county || components.state || components.country || 'Unknown location';
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching city:', error);
        throw error;
    }
  }

  fetchRestaurants() {
    this.http.get<any[]>('https://localhost:7299/api/Food/Restaurants')
      .subscribe(
        (data) => {
          this.restaurants = data;
          this.filteredRestaurants = data;
          this.filteredMenu = data;
          console.log("IN FETCHUGBK");
          console.log(this.filteredRestaurants);
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  filterRestaurants(event: any) {
    const query = event.target.value.toLowerCase();
    const locationQuery = this.locationInput.toLowerCase();

    this.filteredRestaurants = this.restaurants.filter(restaurant => {
        const matchesName = restaurant && restaurant.restaurantName && restaurant.restaurantName.toLowerCase().includes(query);
        const matchesLocation = restaurant && restaurant.location && restaurant.location.toLowerCase().includes(locationQuery);
        return matchesName && matchesLocation;
    });

    if (!query) {
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant && restaurant.location && restaurant.location.toLowerCase().includes(locationQuery)
      );
    }
  }

  filterRestaurantsBasedOnLocation() {
    const locationQuery = this.locationInput.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant && restaurant.location && restaurant.location.toLowerCase().includes(locationQuery)
    );
  }

  onCardClick(restaurantId: number, restaurantName: string, location: string, ratings: number, latitude: number, longitude: number,openingTime:string,closingTime:string,closedStartDate:string,closedEndDate:string): void {
    const requestBody = {};
    console.log(openingTime);
    this.http.post<any>(`https://localhost:7299/api/Food/GetRestaurantMenu/${restaurantId}`, requestBody)
      .subscribe(
        (menuData) => {
          console.log("IN ONCARDCLICK");
          this.router.navigate(['/menu'], { state: { restaurantId, restaurantName, location, ratings, latitude, longitude,openingTime,closingTime,closedStartDate,closedEndDate, menuData } });
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
