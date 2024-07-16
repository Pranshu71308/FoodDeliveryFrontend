// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { Router, RouterModule } from '@angular/router';
// import { HttpClientModule } from '@angular/common/http';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.css'
// })
// export class RegisterComponent {
//   username: string = "";
//   email: string = "";
//   phoneNumber: string = "";
//   password: string = "";
//   confirmPassword: string = "";
//   constructor(private authService: AuthService, private router: Router) { }

//   register() {
//     this.authService.register(this.username, this.email, this.password, this.confirmPassword, this.phoneNumber).subscribe({
//       next: (response) => {
//         console.log("Registered", response);
//         this.router.navigate(['/dashboard']);
//       },
//       error: (err) => {
//         console.error("Registration failed", err);
//       }
//     });
//   }
// }
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // Fixed the property name here
})
export class RegisterComponent {
  username: string = "";
  email: string = "";
  phoneNumber: string = "";
  password: string = "";
  confirmPassword: string = "";
  errorMessage: string = ""; // Add a property to store error messages

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    // Validate password
    if (!this.isValidPassword(this.password)) {
      this.errorMessage = "Password must be at least 6 characters long, contain at least one special character, one uppercase letter, and one number.";
      return;
    }
 // Validate email
 if (!this.isValidEmail(this.email)) {
  this.errorMessage = "Email must be a valid Gmail address.";
  return;
}

// Validate phone number
if (!this.isValidPhoneNumber(this.phoneNumber)) {
  this.errorMessage = "Phone number must be 10 digits long.";
  return;
}
    // Proceed with the registration if the password is valid
    this.authService.register(this.username, this.email, this.password, this.confirmPassword, this.phoneNumber).subscribe({
      next: (response) => {
        console.log("Registered", response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Registration failed", err);
        this.errorMessage = "Registration failed. Please try again."; // Update error message on failure
      }
    });
  }

  // Method to validate password
  private isValidPassword(password: string): boolean {
    const minLength = 6;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasSpecialChar && hasUpperCase && hasNumber;
  }
  private isValidEmail(email: string): boolean {
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailPattern.test(email);
  }

  // Method to validate phone number (10 digits)
  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(phoneNumber);
  }
}
