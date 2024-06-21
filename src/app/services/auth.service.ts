import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService { 
  private readonly JWT_TOKEN = 'JWT-TOKEN';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private apiurl = environment.apiurl;
  private loginurl = `${this.apiurl}/Auth/login`;
  private registerurl = `${this.apiurl}/Auth/Register`;
  private forgotPasswordUrl = `${this.apiurl}/Auth/forgot-password`;
  private verifyOtpUrl = `${this.apiurl}/Auth/verify-otp`;
  private resetPasswordUrl =  `${this.apiurl}/Auth/reset-password`;
  private getFoodMenuUrl = `${this.apiurl}/api/food/GetFoodMenu`; // Update with your API endpoint

  constructor(private http: HttpClient) { }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginurl, { identifier, password }).pipe(
      tap((response: LoginResponse) => {
        this.storeToken(response.token);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError("Either your username or password is incorrect");
        }
        return throwError("An error occurred while processing your request");
      })
    );
  }
  forgotPassword(email: string) {
    return this.http.post(this.forgotPasswordUrl, { email }, { responseType: 'text' });
  }
  verifyOtp(email: string, otp: string) {
    return this.http.post(this.verifyOtpUrl, { email, otp }, { responseType: 'text' });
  }
  private storeToken(token: string): void {
    localStorage.setItem(this.JWT_TOKEN, token);
    if(token){
      const decodetoken = jwtDecode(token) as { userid: string, username: string };
      localStorage.setItem("userid",decodetoken.userid);
      localStorage.setItem("username",decodetoken.username);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.JWT_TOKEN);
  }
  getUsername():string|null{
    return localStorage.getItem("username");
  }
  register(username: string, email: string, password: string, confirmPassword: string, phoneNumber: string): Observable<any> {
    return this.http.post(this.registerurl, { username, email, password, confirmPassword, phoneNumber }, { responseType: 'text' });
  }

  logout() {
    localStorage.removeItem(this.JWT_TOKEN);
    this.isAuthenticatedSubject.next(false);
  }
  resetPassword(email: string, newPassword: string): Observable<any> {
   return this.http.post(this.resetPasswordUrl, { email, newPassword }, { responseType: 'text' });
  }
  getFoodMenu(restaurantId: number): Observable<any[]> {
    const url = `${this.getFoodMenuUrl}/${restaurantId}`;
    return this.http.get<any[]>(url);
  }
}
