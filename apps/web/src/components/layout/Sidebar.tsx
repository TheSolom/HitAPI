import { useEffect, memo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { PanelLeftClose, Radar } from 'lucide-react';
import { navGroups, type NavItem } from './nav-config';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface NavItemRowProps {
    item: NavItem;
    collapsed: boolean;
    pathname: string;
    onClick?: () => void;
}

const NavItemRow = memo(function NavItemRow({
    item,
    collapsed,
    pathname,
    onClick,
}: Readonly<NavItemRowProps>) {
    const Icon = item.icon;
    const isExact = pathname === item.to;
    const isPrefix = pathname.startsWith(`${item.to}/`);
    const active = isExact || isPrefix;

    const linkContent = (
        <Link
            to={item.to}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group relative flex h-9 items-center rounded-lg px-2 text-sm font-medium overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
        >
            <span
                className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110',
                    active ? 'text-primary' : 'text-sidebar-foreground',
                )}
            >
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span
                className={cn(
                    'overflow-hidden whitespace-nowrap truncate transition-[max-width,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
                    collapsed
                        ? 'max-w-0 opacity-0 -translate-x-2'
                        : 'max-w-37.5 opacity-100 translate-x-0 ml-2.5',
                )}
            >
                {item.label}
            </span>
        </Link>
    );

    return (
        <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            {collapsed && (
                <TooltipContent
                    side="right"
                    sideOffset={12}
                    className="font-medium"
                >
                    {item.label}
                </TooltipContent>
            )}
        </Tooltip>
    );
});

export function Sidebar() {
    const collapsed = useUiStore((s) => s.sidebarCollapsed);
    const toggleSidebar = useUiStore((s) => s.toggleSidebar);
    const mobileOpen = useUiStore((s) => s.sidebarMobileOpen);
    const setMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);
    const pathname = useRouterState({ select: (s) => s.location.pathname });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleSidebar]);

    return (
        <TooltipProvider delayDuration={150}>
            {/* Desktop Animated Sidebar */}
            <aside
                aria-label="Sidebar navigation"
                className={cn(
                    'hidden shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none md:flex',
                    collapsed ? 'w-17' : 'w-60',
                )}
            >
                <div className="relative flex h-14 items-center overflow-hidden border-b border-sidebar-border px-3">
                    <div
                        className={cn(
                            'flex items-center gap-2.5 overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
                            collapsed
                                ? 'max-w-0 opacity-0 -translate-x-4 pointer-events-none'
                                : 'max-w-40 opacity-100 translate-x-0',
                        )}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs transition-transform duration-200 hover:scale-105">
                            <Radar className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-bold tracking-[0.18em] text-sidebar-foreground whitespace-nowrap">
                            HitAPI
                        </span>
                    </div>

                    <div
                        className={cn(
                            'flex items-center',
                            collapsed
                                ? 'w-full justify-center'
                                : 'ml-auto justify-end',
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
                            onClick={toggleSidebar}
                            aria-label={
                                collapsed
                                    ? 'Expand sidebar (Ctrl+B)'
                                    : 'Collapse sidebar (Ctrl+B)'
                            }
                            title={
                                collapsed
                                    ? 'Expand sidebar (Ctrl+B)'
                                    : 'Collapse sidebar (Ctrl+B)'
                            }
                        >
                            <PanelLeftClose
                                className={cn(
                                    'h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
                                    collapsed && 'rotate-180',
                                )}
                            />
                        </Button>
                    </div>
                </div>

                <nav
                    aria-label="Main navigation"
                    className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <div
                                className={cn(
                                    'overflow-hidden whitespace-nowrap transition-[max-height,opacity,transform,margin,padding] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
                                    collapsed
                                        ? 'max-h-0 opacity-0 -translate-y-1 mb-0 py-0'
                                        : 'max-h-8 opacity-100 translate-y-0 px-2.5 pb-1 pt-2',
                                )}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                                    {group.label}
                                </p>
                            </div>
                            <ul className="space-y-0.5">
                                {group.items.map((item) => (
                                    <li key={item.to}>
                                        <NavItemRow
                                            item={item}
                                            collapsed={collapsed}
                                            pathname={pathname}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile Sheet Navigation */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent
                    side="left"
                    className="flex w-72 flex-col border-sidebar-border bg-sidebar p-0"
                >
                    <SheetHeader className="flex h-14 flex-row items-center justify-between border-b border-sidebar-border px-4 space-y-0">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                                <Radar className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-bold tracking-[0.18em] text-sidebar-foreground">
                                HitAPI
                            </span>
                        </div>
                        <SheetTitle className="sr-only">
                            Main Navigation
                        </SheetTitle>
                    </SheetHeader>
                    <nav
                        aria-label="Mobile navigation"
                        className="flex-1 space-y-4 overflow-y-auto px-3 py-4"
                    >
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.label}
                                </p>
                                <ul className="space-y-1">
                                    {group.items.map((item) => (
                                        <li key={item.to}>
                                            <NavItemRow
                                                item={item}
                                                collapsed={false}
                                                pathname={pathname}
                                                onClick={() => {
                                                    setMobileOpen(false);
                                                }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </TooltipProvider>
    );
}

