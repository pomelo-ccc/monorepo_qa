import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { FaqListComponent } from './faq-list/faq-list.component';
import { FaqEditComponent } from './faq-edit/faq-edit.component';
import { FaqDetailComponent } from './faq-detail/faq-detail.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { AuthService } from './services/auth.service';

// Auth guard function
const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};

// Admin guard function
const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAdmin()) {
        return true;
    }

    alert('只有管理员才能访问此页面');
    router.navigate(['/']);
    return false;
};

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: FaqListComponent, canActivate: [authGuard] },
    { path: 'detail/:id', component: FaqDetailComponent, canActivate: [authGuard] },
    { path: 'create', component: FaqEditComponent, canActivate: [adminGuard] },
    { path: 'edit/:id', component: FaqEditComponent, canActivate: [adminGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
    { path: '**', redirectTo: '' }
];
