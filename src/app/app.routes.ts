import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookingComponent } from './components/booking/booking.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'booking', component: BookingComponent },
  { path: '', redirectTo: '/booking', pathMatch: 'full' },
  { path: '**', redirectTo: '/booking' }
];
