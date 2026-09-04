import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Laptop, LogOut, Menu, Moon, Sun } from 'lucide-react';
import type { Period } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/components/theme/theme-context';
import { useLogout } from '@/features/auth';
import { useTeamsQuery } from '@/features/teams';
import { useAppsQuery } from '@/features/apps/hooks';
import { formatPeriodLabel } from '@/lib/utils';
import { CustomRangeDialog } from './CustomRangeDialog';

const PERIODS: { value: Period; label: string }[] = [
    { value: '1h', label: 'Last hour' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range...' },
];

function getPeriodDisplayLabel(periodValue: string): string {
    return formatPeriodLabel(periodValue);
}

export function Topbar() {
    const navigate = useNavigate();
    const [customDialogOpen, setCustomDialogOpen] = useState(false);
    const { activeAppId, setActiveAppId, period, setPeriod } = useUiStore();
    const toggleSidebarMobile = useUiStore((s) => s.toggleSidebarMobile);
    const activeTeamId = useUiStore((s) => s.activeTeamId);
    const setActiveTeamId = useUiStore((s) => s.setActiveTeamId);
    const { theme, setTheme } = useTheme();
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();

    const teamsQuery = useTeamsQuery();
    const teams = useMemo(
        () => teamsQuery.data?.data ?? [],
        [teamsQuery.data?.data],
    );
    const effectiveTeamId = activeTeamId ?? teams[0]?.id;

    useEffect(() => {
        if (!activeTeamId && teams.length > 0) {
            const firstTeamId = teams[0]?.id;
            if (firstTeamId) {
                setActiveTeamId(firstTeamId);
            }
        }
    }, [activeTeamId, teams, setActiveTeamId]);

    const appsQuery = useAppsQuery(
        effectiveTeamId ? { teamId: effectiveTeamId } : undefined,
    );
    const apps = appsQuery.data?.data ?? [];

    const userIdentifier = user?.displayName ?? user?.email ?? '?';
    const initials = userIdentifier
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const selectValue = period.includes('|') ? 'custom' : period;

    const handlePeriodChange = (v: string) => {
        if (v === 'custom') {
            setCustomDialogOpen(true);
        } else {
            setPeriod(v);
        }
    };

    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-1.5 border-b border-border bg-background px-2.5 sm:gap-3 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8.5 w-8.5 shrink-0 md:hidden"
                    onClick={toggleSidebarMobile}
                    aria-label="Toggle navigation"
                >
                    <Menu className="h-4 w-4" />
                </Button>

                <Select
                    value={activeAppId ?? 'all'}
                    onValueChange={(v) => {
                        setActiveAppId(v === 'all' ? null : v);
                    }}
                >
                    <SelectTrigger
                        className="h-8.5 w-26 min-w-20 text-xs sm:h-9 sm:w-40 sm:text-sm md:w-48 shrink-0"
                        aria-label="Select app"
                    >
                        <SelectValue placeholder="All apps" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All apps</SelectItem>
                        {apps.map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                                {app.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectValue} onValueChange={handlePeriodChange}>
                    <SelectTrigger
                        className="h-8.5 w-24 min-w-20 text-xs sm:h-9 sm:w-36 sm:text-sm md:w-48 shrink-0"
                        aria-label="Select time period"
                    >
                        <span className="truncate">
                            {getPeriodDisplayLabel(period)}
                        </span>
                    </SelectTrigger>
                    <SelectContent>
                        {PERIODS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <CustomRangeDialog
                open={customDialogOpen}
                onOpenChange={setCustomDialogOpen}
                initialPeriod={period}
                onApply={(newPeriod) => {
                    setPeriod(newPeriod);
                }}
            />

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Change theme"
                            className="relative h-8.5 w-8.5 overflow-hidden sm:h-9 sm:w-9"
                        >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 motion-reduce:transition-none dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 motion-reduce:transition-none dark:rotate-0 dark:scale-100" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onSelect={(e) => {
                                setTheme(
                                    'light',
                                    e as unknown as React.MouseEvent,
                                );
                            }}
                            aria-current={theme === 'light'}
                        >
                            <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                setTheme(
                                    'dark',
                                    e as unknown as React.MouseEvent,
                                );
                            }}
                            aria-current={theme === 'dark'}
                        >
                            <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                setTheme(
                                    'system',
                                    e as unknown as React.MouseEvent,
                                );
                            }}
                            aria-current={theme === 'system'}
                        >
                            <Laptop
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                            />
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8.5 gap-1.5 px-1.5 sm:h-9 sm:gap-2 sm:px-2"
                            aria-label="Account menu"
                        >
                            <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold sm:h-7 sm:w-7">
                                {initials}
                            </span>
                            <span className="hidden max-w-30 truncate text-sm sm:inline">
                                {user?.displayName ?? user?.email}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="truncate">
                            {user?.email ?? 'Signed in'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/teams">Teams</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => {
                                logout.mutate(undefined, {
                                    onSettled: () => {
                                        void navigate({ to: '/login' });
                                    },
                                });
                            }}
                        >
                            <LogOut
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                            />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
