import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { ThemeContext, type ResolvedTheme, type Theme } from './theme-context';

const STORAGE_KEY = 'hitapi.theme';

const isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined';

function readStoredTheme(defaultTheme: Theme): Theme {
    if (!isBrowser) return defaultTheme;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system'
        ? stored
        : defaultTheme;
}

function systemTheme(): ResolvedTheme {
    if (!isBrowser) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(resolved: ResolvedTheme) {
    if (!isBrowser) return;
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.classList.toggle('light', resolved === 'light');
    root.style.colorScheme = resolved;
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
}: Readonly<ThemeProviderProps>) {
    // Lazy initializers run once and are guarded for non-browser environments,
    // so the first paint already matches the stored preference (no flash / layout shift).
    const [theme, setThemeState] = useState<Theme>(() =>
        readStoredTheme(defaultTheme),
    );
    const [system, setSystem] = useState<ResolvedTheme>(() => systemTheme());

    const resolvedTheme: ResolvedTheme = theme === 'system' ? system : theme;

    useEffect(() => {
        if (!isBrowser) return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e: MediaQueryListEvent) => {
            setSystem(e.matches ? 'dark' : 'light');
        };
        mql.addEventListener('change', onChange);
        return () => {
            mql.removeEventListener('change', onChange);
        };
    }, []);

    useEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    const setTheme = useCallback(
        (next: Theme, event?: React.MouseEvent | MouseEvent) => {
            const applyChange = () => {
                setThemeState(next);
                if (isBrowser) {
                    window.localStorage.setItem(STORAGE_KEY, next);
                }
            };

            const doc =
                typeof document !== 'undefined'
                    ? (document as Document & {
                          startViewTransition?: (
                              updateCallback: () => void,
                          ) => {
                              ready: Promise<void>;
                          };
                      })
                    : null;

            if (
                !doc ||
                typeof doc.startViewTransition !== 'function' ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
                applyChange();
                return;
            }

            const x = event ? event.clientX : Math.round(window.innerWidth / 2);
            const y = event ? event.clientY : 0;
            const endRadius = Math.round(
                Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y),
                ),
            );

            const transition = doc.startViewTransition(() => {
                applyChange();
            });

            transition.ready
                .then(() => {
                    const xStr = x.toString();
                    const yStr = y.toString();
                    const rStr = endRadius.toString();
                    const clipPath = [
                        `circle(0px at ${xStr}px ${yStr}px)`,
                        `circle(${rStr}px at ${xStr}px ${yStr}px)`,
                    ];
                    document.documentElement.animate(
                        {
                            clipPath,
                        },
                        {
                            duration: 380,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            pseudoElement: '::view-transition-new(root)',
                        },
                    );
                })
                .catch(() => {
                    // Gracefully fallback on error
                });
        },
        [],
    );

    // Keep multiple tabs in sync.
    useEffect(() => {
        if (!isBrowser) return;
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY)
                setThemeState(readStoredTheme(defaultTheme));
        };
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
        };
    }, [defaultTheme]);

    const toggleTheme = useCallback(
        (event?: React.MouseEvent | MouseEvent) => {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark', event);
        },
        [resolvedTheme, setTheme],
    );

    const value = useMemo(
        () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
        [theme, resolvedTheme, setTheme, toggleTheme],
    );

    return <ThemeContext value={value}>{children}</ThemeContext>;
}
