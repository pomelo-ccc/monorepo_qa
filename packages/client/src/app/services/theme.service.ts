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
    };
}

export const THEMES: Theme[] = [
    {
        id: 'dark-blue',
        name: '深蓝夜空',
        colors: {
            primary: '#667eea',
            primaryLight: '#7c8ff5',
            background: '#0f172a',
            surface: '#1e293b',
            surfaceHover: '#334155',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            border: '#334155',
            accent: '#3b82f6'
        }
    },
    {
        id: 'purple-dream',
        name: '紫色梦幻',
        colors: {
            primary: '#a855f7',
            primaryLight: '#c084fc',
            background: '#1a0b2e',
            surface: '#2d1b4e',
            surfaceHover: '#3d2a5f',
            text: '#f5f3ff',
            textSecondary: '#c4b5fd',
            border: '#3d2a5f',
            accent: '#d946ef'
        }
    },
    {
        id: 'green-forest',
        name: '森林绿意',
        colors: {
            primary: '#10b981',
            primaryLight: '#34d399',
            background: '#0a2e1f',
            surface: '#1a3d2e',
            surfaceHover: '#2a4d3e',
            text: '#ecfdf5',
            textSecondary: '#86efac',
            border: '#2a4d3e',
            accent: '#14b8a6'
        }
    },
    {
        id: 'orange-sunset',
        name: '橙色日落',
        colors: {
            primary: '#f97316',
            primaryLight: '#fb923c',
            background: '#1c1917',
            surface: '#292524',
            surfaceHover: '#3f3f46',
            text: '#fef3c7',
            textSecondary: '#fcd34d',
            border: '#3f3f46',
            accent: '#fb923c'
        }
    },
    {
        id: 'light',
        name: '明亮白昼',
        colors: {
            primary: '#3b82f6',
            primaryLight: '#60a5fa',
            background: '#f8fafc',
            surface: '#ffffff',
            surfaceHover: '#f1f5f9',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            accent: '#0ea5e9'
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
    }
}
