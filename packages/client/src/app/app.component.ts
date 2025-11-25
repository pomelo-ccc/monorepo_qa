import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { ButtonComponent } from '@repo/ui-lib';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ButtonComponent],
  template: `
    <div class="app">
      @if (showHeader) {
        <header class="app-header">
          <div class="header-left">
            <div class="logo" routerLink="/">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="var(--color-primary)" />
                    <stop offset="1" stop-color="var(--color-accent)" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="10" fill="url(#logo-gradient)" />
                <path
                  d="M16 8L18.5 13.5L24 16L18.5 18.5L16 24L13.5 18.5L8 16L13.5 13.5L16 8Z"
                  fill="white"
                />
              </svg>
              <span class="logo-text">FAQ</span>
              <span class="logo-badge">Internal</span>
            </div>
          </div>

          <div class="header-right">
            <!-- 主题切换 -->
            <div class="theme-selector">
              <lib-button variant="ghost" (click)="toggleThemeMenu()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </lib-button>

              @if (showThemeMenu) {
                <div class="theme-menu">
                  @for (theme of themes; track theme.id) {
                    <button
                      class="theme-option"
                      [class.active]="currentTheme().id === theme.id"
                      (click)="selectTheme(theme)"
                    >
                      <span class="theme-color" [style.background]="theme.colors.primary"></span>
                      {{ theme.name }}
                    </button>
                  }
                </div>
              }
            </div>

            <a routerLink="/" class="nav-link">首页</a>

            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path
                    d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m-2 2l-4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m-2-2l-4.2-4.2"
                  />
                </svg>
                系统配置
              </a>
              <a routerLink="/create" style="text-decoration: none;">
                <lib-button variant="primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  新建问题
                </lib-button>
              </a>
            }

            @if (authService.isLoggedIn()) {
              <div class="user-menu">
                <span class="username">{{ authService.getCurrentUser()()?.username }}</span>
                @if (authService.isAdmin()) {
                  <span class="role-badge">管理员</span>
                }
                <lib-button variant="ghost" (click)="logout()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  登出
                </lib-button>
              </div>
            } @else {
              <a routerLink="/login" style="text-decoration: none;">
                <lib-button variant="ghost">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  登录
                </lib-button>
              </a>
            }
          </div>
        </header>
      }

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
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
        backdrop-filter: blur(var(--color-glassBlur, 12px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 12px));
        border-bottom: 1px solid var(--color-border);
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: var(--color-cardShadow, 0 1px 3px rgba(0, 0, 0, 0.1));
        position: relative;
      }

      /* Header 高光效果 */
      .app-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--color-glassBorderTop, transparent);
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
        cursor: pointer;
      }

      .logo svg {
        flex-shrink: 0;
        filter: drop-shadow(0 4px 6px rgba(79, 70, 229, 0.2));
      }

      .logo-text {
        font-family: 'Cinzel', serif;
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 1px;
      }

      .logo-badge {
        padding: 0.2rem 0.6rem;
        background: var(--color-surfaceHover);
        border: 1px solid var(--color-surface);
        border-radius: 12px;
        font-size: 0.7rem;
        color: var(--color-textSecondary);
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .theme-selector {
        position: relative;
      }

      .theme-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-top-color: var(--color-glassBorderTop, var(--color-border));
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
        border-radius: 12px;
        padding: 0.5rem;
        min-width: 180px;
        box-shadow: var(--color-cardShadow, 0 8px 24px rgba(0, 0, 0, 0.3));
        z-index: 1000;
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
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

      .user-menu {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;
        background: var(--color-surfaceHover);
        border-radius: 8px;
      }

      .username {
        color: var(--color-text);
        font-weight: 600;
        font-size: 0.95rem;
      }

      .role-badge {
        padding: 0.25rem 0.6rem;
        background: var(--color-primary);
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .app-main {
        flex: 1;
      }
    `,
  ],
})
export class AppComponent {
  showThemeMenu = false;
  showHeader = true;
  themes: any[];
  currentTheme: any;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router,
  ) {
    this.themes = this.themeService.getThemes();
    this.currentTheme = this.themeService.getCurrentTheme();

    // Close theme menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.theme-selector')) {
        this.showThemeMenu = false;
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.showHeader = !url.match(/^\/(create|edit|detail)/);
      });
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }

  selectTheme(theme: any) {
    this.themeService.setTheme(theme);
    this.showThemeMenu = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
