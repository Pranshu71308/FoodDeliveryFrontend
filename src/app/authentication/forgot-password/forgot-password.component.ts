import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = "";
  otp: string[] = ["", "", "", "", "", ""];
  otpSent: boolean = false;
  otpVerified: boolean = false;
  otpError: string | null = null;
  emailError: string | null = null; 
  showChangePasswordForm: boolean = false;
  newPassword: string = "";
  confirmPassword: string = "";
emailid:string="";
  constructor(private authService: AuthService, private router: Router) { }
  submitEmail() {
    this.emailError = null; 
    this.emailid=this.email;
    console.log(this.emailid);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        console.log("Email sent for password reset.");
        this.otpSent = true;
      },
      error: (err) => {
        console.error("Error sending email for password reset.", err);
        this.emailError = "The email address is incorrect."; // Set the error message
      }
    });
  }
  verifyOtp() {
    const otpCode = this.otp.join('');
    this.authService.verifyOtp(this.email, otpCode).subscribe({
      next: () => {
        this.otpVerified = true;
        this.showChangePasswordForm = true; // Show change password form after OTP verification
        this.otpError = null;
      },
      error: (err) => {
        this.otpVerified = false;
        this.otpError = "Invalid OTP. Please try again.";
        console.error("Error verifying OTP.", err);
      }
    });
  }
  moveToNext(event: any, index: number) {
    const input = event.target;
    if (input.value.length === input.maxLength) {
      const nextInput = document.querySelector(`input[name=otp${index + 1}]`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  }
  changePassword(newPassword:string,confirmPassword:string) {
    console.log("New pass"+newPassword);
    if (this.newPassword !== this.confirmPassword) {
      console.error("Passwords do not match.");
      return;
    }
    else{
      console.log("NEWPASS"+newPassword);      
      this.authService.resetPassword(this.emailid, newPassword).subscribe({
        next: () => {
          console.log("Password changed successfully."); 
          this.router.navigate(['/login']); // Redirect to login page

        },
        error: (err: HttpErrorResponse) => {
          console.error("Error changing password.", err);
          if (err.error instanceof ErrorEvent) {
            console.error("Client-side error occurred:", err.error.message);
          } else {
            console.error(`Server-side error: HTTP ${err.status}, ${err.error}`);
          }
          // Handle error (show message to user, etc.)
        }
      });
    }
  }
}

