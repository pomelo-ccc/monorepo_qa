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
    name: '赛博朋克',
    colors: {
      primary: '#ec4899',
      primaryLight: '#f472b6',
      background: '#0a0a0f',
      surface: '#111118',
      surfaceHover: '#1a1a24',
      text: '#f1f5f9',
      textSecondary: '#888899',
      border: '#252530',
      accent: '#22d3ee',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      glass: 'rgba(17, 17, 24, 0.8)',
    },
  },
  {
    id: 'blue',
    name: '清新蓝',
    colors: {
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 50%, #f0f9ff 100%)',
      surface: 'rgba(255, 255, 255, 0.85)',
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      text: '#0c4a6e',
      textSecondary: '#64748b',
      border: 'rgba(14, 165, 233, 0.2)',
      accent: '#06b6d4',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      glass: 'rgba(255, 255, 255, 0.7)',
      glassBlur: '12px',
    },
  },
  {
    id: 'mint',
    name: '薄荷青',
    colors: {
      primary: '#14b8a6',
      primaryLight: '#2dd4bf',
      background: 'linear-gradient(180deg, #99f6e4 0%, #ccfbf1 50%, #f0fdfa 100%)',
      surface: 'rgba(255, 255, 255, 0.85)',
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      text: '#134e4a',
      textSecondary: '#64748b',
      border: 'rgba(20, 184, 166, 0.2)',
      accent: '#0ea5e9',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      glass: 'rgba(255, 255, 255, 0.7)',
      glassBlur: '12px',
    },
  },
  {
    id: 'warm',
    name: '暖橙色',
    colors: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      background: 'linear-gradient(180deg, #fed7aa 0%, #ffedd5 50%, #fff7ed 100%)',
      surface: 'rgba(255, 255, 255, 0.85)',
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      text: '#7c2d12',
      textSecondary: '#78716c',
      border: 'rgba(249, 115, 22, 0.2)',
      accent: '#ea580c',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      glass: 'rgba(255, 255, 255, 0.7)',
      glassBlur: '12px',
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
    const body = document.body;

    // 移除所有主题类
    body.classList.remove('theme-blue', 'theme-mint', 'theme-warm');
    
    // 添加对应主题类
    if (theme.id !== 'cyberpunk') {
      body.classList.add(`theme-${theme.id}`);
    }

    // 先重置所有拟物化变量为默认值
    const defaultSkeuomorphicVars = {
      glassHighlight: 'transparent',
      glassShadow: 'transparent',
      glassInnerShadow: 'none',
      glassBorderTop: 'transparent',
      glassBorderBottom: 'transparent',
      glassReflection: 'none',
      glassBlur: theme.colors.glassBlur || '0px',
      cardShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      buttonShadow: 'none',
      inputShadow: 'none',
    };

    // 重置拟物化变量
    Object.entries(defaultSkeuomorphicVars).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 应用主题颜色
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value !== undefined) {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // 处理渐变背景
    if (theme.colors.background.includes('gradient')) {
      root.style.setProperty('--bg-gradient', theme.colors.background);
      root.style.setProperty('--color-background', 'transparent');
    } else {
      root.style.setProperty('--bg-gradient', 'none');
    }
  }
}
