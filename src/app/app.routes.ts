import { Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { MenuComponent } from './views/menu/menu.component';
import { CuponsComponent } from './views/cupons/cupons.component';
import { AnalyticsComponent } from './views/analytics/analytics.component';
import { LiveOrdersComponent } from './views/live-orders/live-orders.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'menu', component: MenuComponent },
            { path: 'cupons', component: CuponsComponent },
            { path: 'analytics', component: AnalyticsComponent },
            { path: 'live-orders', component: LiveOrdersComponent },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
