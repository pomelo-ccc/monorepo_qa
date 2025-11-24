import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app">
      <header class="app-header">
        <div class="header-left">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.2"/>
              <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="logo-text">FAQ</span>
            <span class="logo-badge">Internal</span>
          </div>
        </div>

        <div class="header-right">
          <!-- 主题切换 -->
          <div class="theme-selector">
            <button class="theme-toggle" (click)="toggleThemeMenu()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
            
            @if (showThemeMenu) {
              <div class="theme-menu">
                @for (theme of themes; track theme.id) {
                  <button 
                    class="theme-option"
                    [class.active]="currentTheme().id === theme.id"
                    (click)="selectTheme(theme)">
                    <span class="theme-color" [style.background]="theme.colors.primary"></span>
                    {{ theme.name }}
                  </button>
                }
              </div>
            }
          </div>

          <a routerLink="/" class="nav-link">首页</a>
          <a routerLink="/create" class="nav-link nav-link-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建问题
          </a>
        </div>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-background);
    }

    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      height: 64px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--color-primary);
    }

    .logo svg {
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text);
    }

    .logo-badge {
      padding: 0.25rem 0.6rem;
      background: var(--color-surfaceHover);
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--color-textSecondary);
      font-weight: 600;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .theme-selector {
      position: relative;
    }

    .theme-toggle {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-toggle:hover {
      background: var(--color-surfaceHover);
      border-color: var(--color-primary);
    }

    .theme-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.5rem;
      min-width: 180px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 1000;
    }

    .theme-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--color-text);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    .theme-option:hover {
      background: var(--color-surfaceHover);
    }

    .theme-option.active {
      background: var(--color-primary);
      color: white;
    }

    .theme-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      color: var(--color-text);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link:hover {
      background: var(--color-surfaceHover);
    }

    .nav-link-primary {
      background: var(--color-primary);
      color: white;
    }

    .nav-link-primary:hover {
      background: var(--color-primaryLight);
    }

    .app-main {
      flex: 1;
    }
  `],
})
export class AppComponent {
  showThemeMenu = false;
  themes: any[];
  currentTheme: any;

  constructor(public themeService: ThemeService) {
    this.themes = this.themeService.getThemes();
    this.currentTheme = this.themeService.getCurrentTheme();

    // Close theme menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.theme-selector')) {
        this.showThemeMenu = false;
      }
    });
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }

  selectTheme(theme: any) {
    this.themeService.setTheme(theme);
    this.showThemeMenu = false;
  }
}
