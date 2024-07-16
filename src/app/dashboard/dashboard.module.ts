import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';

import { DashboardRoutingModule } from './dashboard-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NavbarComponent
  ],
  exports:[NavbarComponent]
})
export class DashboardModule { }
