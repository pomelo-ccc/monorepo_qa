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
        glass?: string; // For glassmorphism
    };
}

export const THEMES: Theme[] = [
    {
        id: 'cyberpunk',
        name: '赛博朋克黑',
        colors: {
            primary: '#ff0080',
            primaryLight: '#ff3399',
            background: '#0a0e27',
            surface: '#1a1f3a',
            surfaceHover: '#252b4a',
            text: '#00ffff',
            textSecondary: '#8b9dc3',
            border: '#2d3561',
            accent: '#00ff41',
            glass: 'rgba(26, 31, 58, 0.7)'
        }
    },
    {
        id: 'elegant',
        name: '优雅蓝白',
        colors: {
            primary: '#2563eb',
            primaryLight: '#3b82f6',
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceHover: '#f1f5f9',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            accent: '#0ea5e9',
            glass: 'rgba(255, 255, 255, 0.8)'
        }
    },
    {
        id: 'glass',
        name: '拟态玻璃',
        colors: {
            primary: '#a78bfa',
            primaryLight: '#c4b5fd',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            surface: 'rgba(255, 255, 255, 0.1)',
            surfaceHover: 'rgba(255, 255, 255, 0.15)',
            text: '#ffffff',
            textSecondary: '#e0e7ff',
            border: 'rgba(255, 255, 255, 0.2)',
            accent: '#fbbf24',
            glass: 'rgba(255, 255, 255, 0.1)'
        }
    },
    {
        id: 'sunset',
        name: '暖色渐变',
        colors: {
            primary: '#f59e0b',
            primaryLight: '#fbbf24',
            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)',
            surface: 'rgba(255, 255, 255, 0.15)',
            surfaceHover: 'rgba(255, 255, 255, 0.25)',
            text: '#ffffff',
            textSecondary: '#fce7f3',
            border: 'rgba(255, 255, 255, 0.3)',
            accent: '#ec4899',
            glass: 'rgba(255, 255, 255, 0.15)'
        }
    }
];

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private currentTheme = signal<Theme>(THEMES[0]);

    constructor() {
        const savedThemeId = localStorage.getItem('theme');
        if (savedThemeId) {
            const theme = THEMES.find(t => t.id === savedThemeId);
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
