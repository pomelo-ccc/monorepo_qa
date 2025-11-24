import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container">
      <div class="login-card">
        <h2>FAQ 管理系统</h2>
        <p class="subtitle">请登录以继续</p>
        
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              name="username"
              placeholder="输入用户名"
              required
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
            />
          </div>
          
          @if (errorMessage) {
            <div class="error-message">{{ errorMessage }}</div>
          }
          
          <button type="submit" class="login-btn">登录</button>
        </form>
        
        <div class="demo-info">
          <p><strong>演示账号：</strong></p>
          <p>管理员: admin / admin123</p>
          <p>普通用户: user / user123</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background);
      padding: 2rem;
    }
    
    .login-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 3rem;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    h2 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
      font-size: 2rem;
      text-align: center;
    }
    
    .subtitle {
      margin: 0 0 2rem 0;
      color: var(--color-textSecondary);
      text-align: center;
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
    
    input {
      padding: 0.875rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .error-message {
      padding: 0.75rem;
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid #dc3545;
      border-radius: 6px;
      color: #dc3545;
      font-size: 0.9rem;
    }
    
    .login-btn {
      padding: 1rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .login-btn:hover {
      background: var(--color-primaryLight);
      transform: translateY(-2px);
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
  `]
})
export class LoginComponent {
    username = '';
    password = '';
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

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
