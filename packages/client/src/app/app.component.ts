import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showThemeMenu = false;
  showHeader = true;
  themes: any[];
  currentTheme: any;

  constructor(public themeService: ThemeService, public authService: AuthService, private router: Router) {
    this.themes = this.themeService.getThemes();
    this.currentTheme = this.themeService.getCurrentTheme();
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.theme-selector')) this.showThemeMenu = false;
    });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
      this.showHeader = !event.urlAfterRedirects?.match(/^\/(create|edit|detail)/);
    });
  }

  toggleThemeMenu() { this.showThemeMenu = !this.showThemeMenu; }
  selectTheme(theme: any) { this.themeService.setTheme(theme); this.showThemeMenu = false; }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
