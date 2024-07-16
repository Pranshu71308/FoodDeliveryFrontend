import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private razorpayKey = 'rzp_test_AekOZ0gOtU4sda';
  private baseUrl = 'https://api.razorpay.com/v1'; 
  private apiUrl = 'https://localhost:7299/api/Payment/InsertOrUpdateBooking';
  private apiUrl1 = 'https://localhost:7299/api/Payment';

  constructor(private http: HttpClient) { }

  createOrder(orderDetails: any): Promise<any> {
    return this.http.post<any>(`${this.baseUrl}/orders`, orderDetails).toPromise();
  }

  capturePayment(paymentId: string, amount: number): Promise<any> {
    return this.http.post<any>(`${this.baseUrl}/payments/${paymentId}/capture`, { amount }).toPromise();
  }
  insertOrUpdateBooking(bookingDetails: any): Observable<any> {
    console.log("IN Insertorupdatebooking");
    console.log(bookingDetails);
    return this.http.post<any>(this.apiUrl, bookingDetails);
  }
  getBookingDetails(userId:number | null ){
    let params = userId ? new HttpParams().set('userId', userId.toString()) : undefined;
    console.log(params);
    return this.http.get<any>(`${this.apiUrl1}/GetUserBookings`,{params});
  }
}
