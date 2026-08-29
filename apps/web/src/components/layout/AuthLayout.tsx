import type { ReactNode } from 'react';
import { Radar } from 'lucide-react';

interface AuthLayoutProps {
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthLayout({
    title,
    description,
    children,
    footer,
}: Readonly<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Radar className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold tracking-[0.18em] text-foreground">
                        HitAPI
                    </span>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
                        {title}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                    <div className="mt-6">{children}</div>
                </div>
                {footer && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
