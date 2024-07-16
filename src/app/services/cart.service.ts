import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private storageKey = 'cartItems';
  private apiUrl = 'https://localhost:7299/api/Food';
  private FoodapiUrl = 'https://localhost:7299/api/Payment'; 

  constructor(private http: HttpClient) {
    this.loadCartItems();
  }
  private loadCartItems(): void {
    const savedItems = localStorage.getItem(this.storageKey);
    if (savedItems) {
      this.cartItems = JSON.parse(savedItems);
    }
  }
  private saveCartItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
  }
  addItemToCart(userId: number, restaurantId: number, itemId: number, quantity: number, totalPrice: number): Observable<any> {
    const body = {
      userId: userId,
      restaurantId: restaurantId,
      itemId: itemId,
      quantity: quantity,
      totalPrice: totalPrice
    };
    return this.http.post<any>(`${this.apiUrl}/storeCartDetails`, body).pipe(
      tap((response: any) => {
        console.log('Response from server:', response);
      }),
      catchError(this.handleError)
    );
  }
  getCartDetails(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetCartDetails/${userId}`);
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    return throwError('Something bad happened; please try again later.');
  }


  getItems(): any[] {
    return this.cartItems;
  }
  clearCart(userId: number): Observable<any> {
    const body = { userId: userId };
    console.log(userId + " In CartService");
    return this.http.post<any>(`${this.apiUrl}/DeleteCartDetails/${userId}`, body);
  }
  updateCartItems(userId: number, cartItems: any[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}`, cartItems);
  }
  storePaymentDetails(userId: number, cartItems: any[], paymentId: string, totalPrice: number, deliveryAddress: string): Observable<any> {
    const body = {
      userId: userId,
      transactionNumber: paymentId,
      totalPrice: totalPrice,
      address: deliveryAddress,
      items: cartItems.map(item => ({
        restaurantId: item.restaurantId,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      }))
    };
    return this.http.post<any>(`${this.FoodapiUrl}/createOrder`, body).pipe(
      catchError(error => {
        console.error('Error:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
      })
    );
  }
  getUserOrders(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetUserOrders/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  storeRatingDetails(restaurantId: number,ratings:number): Observable<any> {
    const body = {
    restaurantId:restaurantId,
    ratings:ratings
    };
    return this.http.post<any>(`${this.apiUrl}/UpdateRatings`, body).pipe(
      catchError(error => {
        console.error('Error:', error);
        return throwError(() => new Error('Something bad happened; please try again later.'));
      })
    );
  }
}
