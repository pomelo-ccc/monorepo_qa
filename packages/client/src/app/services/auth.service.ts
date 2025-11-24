import { Injectable, signal } from '@angular/core';

export interface User {
    username: string;
    role: 'admin' | 'user' | 'guest';
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser = signal<User | null>(null);

    constructor() {
        // Load user from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser.set(JSON.parse(savedUser));
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAdmin(): boolean {
        return this.currentUser()?.role === 'admin';
    }

    isLoggedIn(): boolean {
        return this.currentUser() !== null;
    }

    login(username: string, password: string): boolean {
        // Simple mock authentication
        // In production, this should call a real API
        if (username === 'admin' && password === 'admin123') {
            const user: User = { username: 'admin', role: 'admin' };
            this.currentUser.set(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        } else if (username === 'user' && password === 'user123') {
            const user: User = { username: 'user', role: 'user' };
            this.currentUser.set(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('currentUser');
    }
}
