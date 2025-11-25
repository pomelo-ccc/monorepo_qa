import { Injectable, signal } from '@angular/core';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    glass?: string; // For glassmorphism
    // 拟物化扩展属性
    glassHighlight?: string; // 玻璃高光
    glassShadow?: string; // 玻璃阴影
    glassInnerShadow?: string; // 内阴影
    glassBorderTop?: string; // 顶部边框高光
    glassBorderBottom?: string; // 底部边框阴影
    glassReflection?: string; // 反射效果
    glassBlur?: string; // 模糊程度
    cardShadow?: string; // 卡片阴影
    buttonShadow?: string; // 按钮阴影
    inputShadow?: string; // 输入框阴影
  };
}

export const THEMES: Theme[] = [
  {
    id: 'cyberpunk',
    name: '赛博朋克黑',
    colors: {
      primary: '#F06292',
      primaryLight: '#F48FB1',
      background: '#1E1E24',
      surface: '#2B2D31',
      surfaceHover: '#36383D',
      text: '#E0E0E0',
      textSecondary: '#A0A0A0',
      border: '#3F3F46',
      accent: '#4DB6AC',
      success: '#4DB6AC',
      warning: '#FFD54F',
      error: '#E57373',
      glass: 'rgba(30, 30, 36, 0.8)',
    },
  },
  {
    id: 'elegant',
    name: '优雅蓝白',
    colors: {
      primary: '#5B7DB1',
      primaryLight: '#7DA0D6',
      background: '#FAF9F6',
      surface: '#FFFFFF',
      surfaceHover: '#F3F4F6',
      text: '#374151',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      accent: '#A3C1DA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      glass: 'rgba(255, 255, 255, 0.9)',
    },
  },
  {
    id: 'glass',
    name: '拟态玻璃',
    colors: {
      // 主色调 - 使用淡蓝色作为主色，更有玻璃质感
      primary: '#60a5fa',
      primaryLight: '#93c5fd',
      // 深色渐变背景，模拟真实环境光
      background: 'linear-gradient(145deg, #1e3a5f 0%, #0f172a 50%, #1e1b4b 100%)',
      // 毛玻璃表面 - 更高的透明度和更真实的玻璃效果
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.15)',
      text: '#f8fafc',
      textSecondary: 'rgba(248, 250, 252, 0.65)',
      // 玻璃边缘 - 模拟真实玻璃的折射边缘
      border: 'rgba(255, 255, 255, 0.12)',
      accent: '#fbbf24',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      glass: 'rgba(255, 255, 255, 0.06)',
      // 拟物化扩展 - 真实玻璃效果
      glassHighlight: 'rgba(255, 255, 255, 0.25)', // 顶部高光
      glassShadow: 'rgba(0, 0, 0, 0.4)', // 底部阴影
      glassInnerShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)', // 内部高光
      glassBorderTop: 'rgba(255, 255, 255, 0.3)', // 顶部边框高光
      glassBorderBottom: 'rgba(0, 0, 0, 0.2)', // 底部边框阴影
      glassReflection:
        'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)', // 反射渐变
      glassBlur: '20px', // 模糊程度
      cardShadow:
        '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      buttonShadow:
        '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
      inputShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'sunset',
    name: '暖色渐变',
    colors: {
      primary: '#F6AD55',
      primaryLight: '#FBD38D',
      background: '#FFFBF0',
      surface: '#FFFFFF',
      surfaceHover: '#FFF5E6',
      text: '#5D4037',
      textSecondary: '#8D6E63',
      border: '#F3E5F5',
      accent: '#D1913C',
      success: '#68D391',
      warning: '#F6E05E',
      error: '#FC8181',
      glass: 'rgba(255, 255, 255, 0.6)',
    },
  },
];

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = signal<Theme>(THEMES[0]);

  constructor() {
    const savedThemeId = localStorage.getItem('theme');
    if (savedThemeId) {
      const theme = THEMES.find((t) => t.id === savedThemeId);
      if (theme) {
        this.setTheme(theme);
      }
    } else {
      this.applyTheme(THEMES[0]);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getThemes() {
    return THEMES;
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('theme', theme.id);
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Special handling for glass theme background
    if (theme.id === 'glass') {
      root.style.setProperty('--bg-gradient', theme.colors.background);
    } else {
      root.style.setProperty('--bg-gradient', 'none');
    }
  }
}
