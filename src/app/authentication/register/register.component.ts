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
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username: string = "";
  email: string = "";
  phoneNumber: string = "";
  password: string = "";
  confirmPassword: string = "";
  constructor(private authService: AuthService, private router: Router) { }

  register() {
    this.authService.register(this.username, this.email, this.password, this.confirmPassword, this.phoneNumber).subscribe({
      next: (response) => {
        console.log("Registered", response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Registration failed", err);
      }
    });
  }
}
