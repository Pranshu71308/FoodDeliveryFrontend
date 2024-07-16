import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRestaurantComponent } from './add-restaurant/add-restaurant.component';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';
import { NewRestaurantAddComponent } from './new-restaurant-add/new-restaurant-add.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  { path: 'add-restaurant', component: AddRestaurantComponent },
  { path: 'owner-dashboard', component: OwnerDashboardComponent },
  {path:'restaurant-details',component:RestaurantDetailsComponent},
  {path:'new-restaurant-add',component:NewRestaurantAddComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantOwnerRoutingModule { }
