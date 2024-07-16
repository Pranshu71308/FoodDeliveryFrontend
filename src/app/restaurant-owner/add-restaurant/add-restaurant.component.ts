import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from "../../layout/navbar/navbar.component";

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, NavbarComponent],
  templateUrl: './add-restaurant.component.html',
  styleUrl: './add-restaurant.component.css'
})
export class AddRestaurantComponent {
  username:string;

  constructor(private router: Router,private authService:AuthService) {
    this.username = authService.getUsername() || '';
  }

  OwnerDashboard(){
    console.log("In OwnerDashboard");
    this.router.navigate(['restaurant-owner/owner-dashboard']);

  }
  NewRestaurant(){
    this.router.navigate(['restaurant-owner/new-restaurant-add']);

  }
}
