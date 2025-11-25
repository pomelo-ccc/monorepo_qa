import {
  Routes,
  CanActivateFn,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { FaqListComponent } from './faq-list/faq-list.component';
import { FaqEditComponent } from './faq-edit/faq-edit.component';
import { FaqDetailComponent } from './faq-detail/faq-detail.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ConfigManagementComponent } from './admin/config-management/config-management.component';
import { AuthService } from './services/auth.service';

// Admin guard function
const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Redirect to login with returnUrl
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: FaqListComponent },
  { path: 'detail/:id', component: FaqDetailComponent },
  { path: 'create', component: FaqEditComponent, canActivate: [adminGuard] },
  { path: 'edit/:id', component: FaqEditComponent, canActivate: [adminGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'admin/config', component: ConfigManagementComponent, canActivate: [adminGuard] },
  {
    path: 'admin/files',
    loadComponent: () => import('./admin/file-management/file-management.component').then(m => m.FileManagementComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' },
];
