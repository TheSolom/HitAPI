import { createContext, use } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
    /** User preference: light, dark or system. */
    theme: Theme;
    /** Actual applied theme after resolving "system". */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent) => void;
    toggleTheme: (event?: React.MouseEvent | MouseEvent) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** React 19 native context consumption via `use()`. */
export function useTheme(): ThemeContextValue {
    const ctx = use(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}
