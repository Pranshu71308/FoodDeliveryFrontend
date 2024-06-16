import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { OrderOnlineComponent } from './order-online/order-online.component';

const routes: Routes = [
  {path:'',redirectTo:'user-dashboard',pathMatch:'full'},
  {path:'user-dashboard',component:UserDashboardComponent},
  {path:'order-online',component:OrderOnlineComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
