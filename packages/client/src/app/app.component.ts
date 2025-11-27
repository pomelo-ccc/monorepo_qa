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
  template: `
    <div class="app">
      @if (showHeader) {
        <header class="app-header">
          <div class="header-container">
            <!-- 左侧 Logo 区 -->
            <div class="header-left">
              <div class="logo" routerLink="/">
                <div class="logo-icon">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
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
                </div>
                <span class="logo-text">FAQ</span>
              </div>

              <!-- 导航菜单（移到左侧，紧跟 Logo） -->
              <nav class="nav-menu">
                <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">首页</a>
                @if (authService.isAdmin()) {
                  <a routerLink="/admin" routerLinkActive="active" class="nav-link">系统配置</a>
                }
              </nav>
            </div>

            <!-- 右侧功能区 -->
            <div class="header-right">
              <!-- 新建问题按钮 -->
              @if (authService.isAdmin()) {
                <a routerLink="/create" class="action-btn primary" title="新建问题">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>新建</span>
                </a>
              }

              <!-- 分隔线 -->
              <div class="divider"></div>

              <!-- 主题切换 -->
              <div class="theme-selector">
                <button class="icon-btn" (click)="toggleThemeMenu()" title="切换主题">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
                </button>

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

              <!-- 用户菜单 -->
              @if (authService.isLoggedIn()) {
                <div class="user-profile">
                  <div class="avatar">
                    {{ authService.getCurrentUser()()?.username?.charAt(0)?.toUpperCase() }}
                  </div>
                  <button class="icon-btn logout-btn" (click)="logout()" title="退出登录">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              } @else {
                <a routerLink="/login" class="action-btn ghost">登录</a>
              }
            </div>
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
        height: 70px;
        background: var(--color-surface);
        backdrop-filter: blur(var(--color-glassBlur, 20px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 20px));
        border-bottom: 1px solid var(--color-border);
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: var(--color-cardShadow, 0 1px 2px rgba(0, 0, 0, 0.05));
      }

      .header-container {
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        padding: 0 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 3rem;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        text-decoration: none;
      }

      .logo-icon {
        filter: drop-shadow(0 4px 6px rgba(79, 70, 229, 0.2));
        transition: transform 0.3s;
      }

      .logo:hover .logo-icon {
        transform: scale(1.05);
      }

      .logo-text {
        font-family: 'Cinzel', serif;
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: 1px;
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .nav-menu {
        display: flex;
        gap: 2rem;
      }

      .nav-link {
        color: var(--color-textSecondary);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s;
        position: relative;
        padding: 0.5rem 0;
      }

      .nav-link:hover,
      .nav-link.active {
        color: var(--color-text);
      }

      .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--color-primary);
        border-radius: 2px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .divider {
        width: 1px;
        height: 24px;
        background: var(--color-border);
        margin: 0 0.5rem;
      }

      /* 按钮样式 */
      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }

      .action-btn.primary {
        background: var(--color-primary);
        color: white;
        box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.3);
      }

      .action-btn.primary:hover {
        background: var(--color-primaryLight);
        transform: translateY(-1px);
      }

      .action-btn.ghost {
        color: var(--color-textSecondary);
      }

      .action-btn.ghost:hover {
        color: var(--color-text);
        background: var(--color-surfaceHover);
      }

      .icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--color-textSecondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .icon-btn:hover {
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      .theme-selector {
        position: relative;
      }

      /* 用户头像 */
      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-left: 0.5rem;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .logout-btn {
        opacity: 0;
        transform: translateX(-10px);
        pointer-events: none;
      }

      .user-profile:hover .logout-btn {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      /* 主题菜单 */
      .theme-menu {
        position: absolute;
        top: calc(100% + 0.75rem);
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-top-color: var(--color-glassBorderTop, var(--color-border));
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
        border-radius: 16px;
        padding: 0.5rem;
        min-width: 180px;
        box-shadow: var(--color-cardShadow, 0 10px 30px rgba(0, 0, 0, 0.2));
        z-index: 1000;
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
        transform-origin: top right;
        animation: menuSlideIn 0.2s ease-out;
      }

      @keyframes menuSlideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .theme-option {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        border-radius: 10px;
        color: var(--color-text);
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .theme-option:hover {
        background: var(--color-surfaceHover);
      }

      .theme-option.active {
        background: color-mix(in srgb, var(--color-primary), transparent 90%);
        color: var(--color-primary);
      }

      .theme-color {
        width: 18px;
        height: 18px;
        border-radius: 6px;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
