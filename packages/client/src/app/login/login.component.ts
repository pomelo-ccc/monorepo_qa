import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ButtonComponent, CardComponent } from '@repo/ui-lib';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="login-container">
      <lib-card class="login-card">
        <div class="login-header">
          <h2>FAQ 管理系统</h2>
          <p class="subtitle">请登录以继续</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label>用户名</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="输入用户名"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>密码</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="输入密码"
              required
              class="form-input"
            />
          </div>

          @if (errorMessage) {
            <div class="error-message">{{ errorMessage }}</div>
          }

          <lib-button variant="primary" [block]="true" type="submit">登录</lib-button>
        </form>

        <div class="demo-info">
          <p><strong>演示账号：</strong></p>
          <p>管理员: admin / admin123</p>
          <p>普通用户: user / user123</p>
        </div>
      </lib-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        padding: 2rem;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      h2 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text);
        font-size: 2rem;
      }

      .subtitle {
        margin: 0;
        color: var(--color-textSecondary);
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      label {
        color: var(--color-text);
        font-weight: 600;
        font-size: 0.95rem;
      }

      .form-input {
        padding: 0.875rem;
        background: var(--color-glass, var(--color-background));
        border: 1px solid var(--color-border);
        border-top-color: var(--color-glassBorderBottom, var(--color-border));
        border-bottom-color: var(--color-glassBorderTop, var(--color-border));
        border-radius: 10px;
        color: var(--color-text);
        font-size: 1rem;
        transition: all 0.2s;
        width: 100%;
        box-sizing: border-box;
        box-shadow: var(--color-inputShadow, none);
      }

      .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow:
          var(--color-inputShadow, none),
          0 0 0 3px color-mix(in srgb, var(--color-primary), transparent 80%);
      }

      .error-message {
        padding: 0.75rem;
        background: color-mix(in srgb, var(--color-error), transparent 90%);
        border: 1px solid var(--color-error);
        border-radius: 6px;
        color: var(--color-error);
        font-size: 0.9rem;
      }

      .demo-info {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
        color: var(--color-textSecondary);
        font-size: 0.85rem;
      }

      .demo-info p {
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onLogin() {
    this.errorMessage = '';

    if (this.authService.login(this.username, this.password)) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage = '用户名或密码错误';
    }
  }
}
