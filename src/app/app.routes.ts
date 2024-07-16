import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { MenuComponent } from './menu/menu.component';
import { ProfileComponent } from './drop-down-menu/profile/profile.component';
import { CartComponent } from './drop-down-menu/cart/cart.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: 'authentication',
        loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        component: MainLayoutComponent,
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'menu', 
        canActivate: [authGuard],
        component: MenuComponent 
    },
    {
        path: 'drop-down-menu',
        canActivate: [authGuard],
        loadChildren: () => import('./drop-down-menu/drop-down-menu.module').then(m => m.DropDownMenuModule)

    },
    {
        path: 'restaurant-owner', loadChildren: () => import('./restaurant-owner/restaurant-owner.module').then(m => m.RestaurantOwnerModule) 
    },
    {
        path: '**',
        redirectTo: '/authentication'
    },

];
