import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { MenuComponent } from './menu/menu.component';
import { ProfileComponent } from './drop-down-menu/profile/profile.component';
import { CartComponent } from './drop-down-menu/cart/cart.component';

export const routes: Routes = [
    {
        path: 'authentication',
        loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
    },
    {
        path: 'dashboard',
        component: MainLayoutComponent,
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'menu', 
        component: MenuComponent 
    },
    {
        path: 'drop-down-menu',
        loadChildren: () => import('./drop-down-menu/drop-down-menu.module').then(m => m.DropDownMenuModule)

    },
    {
        path: '**',
        redirectTo: '/authentication'
    },

];
