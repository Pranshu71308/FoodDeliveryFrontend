import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  identifier: string = "";
  password: string = "";
  errorMessage: string = ""; // Add this line

  constructor(private authService: AuthService, private router: Router) { }
  // login() {
  //   this.authService.login(this.identifier, this.password).subscribe({
  //     next: (response) => {
  //       console.log("Server Response", response);
  //       console.log("Logged In", response);
  //       this.router.navigate(['/dashboard']);
  //     },
  //     error: (err) => {
  //       console.error("Login failed", err);
  //     }
  //   });
  // }
  login() {
    this.authService.login(this.identifier, this.password).subscribe({
      next: (response) => {
        console.log("Server Response", response);
        console.log("Logged In", response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Login failed", err);
        this.errorMessage = "Either your username or password is incorrect"; // Set error message
      }
    });
  }
}
  
