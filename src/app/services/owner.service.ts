import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface RestaurantData {
  restaurantID: number;
  restaurantName: string;
  location: string;
  latitude: number;
  longitude: number;
  ratings: number;
  image: any;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
  closedStartDate: string;
  closedEndDate: string;
  availableSeats: number;
}
export interface OrderItem {
  orderItemId: number;
  itemId: number;
  itemName: string;
  menuItemPrice: number;
  description: string;
  category: string;
  menuFoodImage: any;
  quantity: number;
  orderItemPrice: number;
}

export interface OrderDetails {
  orderId: number;
  userId: number;
  transactionNumber: string;
  totalPrice: number;
  dateTime: string;
  address: string;
  items: OrderItem[];
}
export interface Bookings{
  userBookedTableId:number,
  username:string,
  bookingDate:string,
  bookingTime:string,
  guests:number,
  email:string,
  phoneNumber:string,
  specialRequest:string
}
export interface MenuItem {
  itemId: number;
  itemName: string;
  price: number;
  description: string;
  category: string;
  foodImage: string;
}
export interface ExpandedTransactions {
  [transactionNumber: string]: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) { }

  getRestaurantsByUserId(userId: number): Observable<RestaurantData[]> {
    return this.http.get<RestaurantData[]>(`${this.apiUrl}/Owner/GetRestaurantsByUserId/${userId}`);
  }
  getRestaurantById(restaurantId: number): Observable<RestaurantData[]> {
    return this.http.get<RestaurantData[]>(`${this.apiUrl}/Owner/GetRestaurantsById/${restaurantId}`);
  }
  fetchRestaurantOrder(restaurantId: number): Observable<OrderDetails[]> {
    return this.http.get<OrderDetails[]>(`${this.apiUrl}/Owner/GetOrdersByRestaurantId/${restaurantId}`);
  }
  updateRestaurantDetails(updatedRestaurantDetails: any): Observable<any> {
    console.log("Inside updateresaurant");
    return this.http.post(`${this.apiUrl}/Auth/UpdateRestaurantDetails`, updatedRestaurantDetails,{responseType:'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
    })
    );
  }
  addRestaurantWithMenu(dataToSubmit: any): Observable<any> {
    console.log("Inside updateresaurant");
    return this.http.post(`${this.apiUrl}/Owner/AddRestaurantWithMenu`, dataToSubmit,{responseType:'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
    })
    );
  }
  menuItems: MenuItem[] = [];

  getMenuItemsByRestaurantId(restaurantId: number | null): Observable<MenuItem[]> {
    console.log(restaurantId);
    const url = `${this.apiUrl}/Food/GetRestaurantMenu/${restaurantId}`; 
    return this.http.post<MenuItem[]>(url,restaurantId);
  }
  updateRestaurantMenu(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Owner/UpdateRestaurantMenu`, request,{responseType:'text'}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
    }
    ));
  }
  getBookings(restaurantId:number|null): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.apiUrl}/Owner/GetBookingsByRestaurant/${restaurantId}`);

  }
  }

