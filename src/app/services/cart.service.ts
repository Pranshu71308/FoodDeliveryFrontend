import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private storageKey = 'cartItems';
  private apiUrl = 'https://localhost:7299/api/Food'; // Replace with your API endpoint URL

  constructor(private http:HttpClient) {
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
    console.log("BODY"+body.totalPrice);
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
    const body = { userId: userId }; // Wrap userId in an object
    console.log(userId + " In CartService");
    return this.http.post<any>(`${this.apiUrl}/DeleteCartDetails/${userId}`, body);
  }
  updateCartItems(userId: number, cartItems: any[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}`, cartItems);
  }

}
