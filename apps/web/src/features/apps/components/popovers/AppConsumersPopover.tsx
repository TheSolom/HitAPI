import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    ArrowRight,
    Check,
    Copy,
    ExternalLink,
    Layers,
    Search,
    User,
    Users,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ConsumerResponseDto } from '@hitapi/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConsumersQuery } from '@/features/consumers/hooks';

interface AppConsumersPopoverProps {
    readonly appId: string;
    readonly appName: string;
}

const AVATAR_PALETTES = [
    {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    },
    {
        bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25',
    },
    {
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
    },
    {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    },
    {
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    },
    {
        bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
    },
    {
        bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    },
] as const;

function getAvatarPalette(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

function getInitials(name?: string | null, identifier?: string): string {
    const raw = name || identifier || '?';
    const parts = raw.split(/[\s_-]+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
}

export function AppConsumersPopover({
    appId,
    appName,
}: AppConsumersPopoverProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Fetch all consumers for this app ONLY when modal is opened
    const { data: consumersData, isLoading } = useConsumersQuery(
        open ? appId : undefined,
    );

    const consumers: ConsumerResponseDto[] = consumersData?.data ?? [];

    const filteredConsumers = consumers.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            c.identifier.toLowerCase().includes(q) ||
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.group && c.group.name.toLowerCase().includes(q))
        );
    });

    const handleCopy = (identifier: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard.writeText(identifier);
        setCopiedId(identifier);
        toast.success(`Copied "${identifier}"`);
        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    title={`View ${appName} consumers`}
                    aria-label={`View ${appName} consumers`}
                >
                    <Users className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl border-border/80 bg-card">
                {/* Header */}
                <DialogHeader className="p-5 pb-4 border-b bg-muted/20 shrink-0">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold">
                                    {appName} Clients
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    All registered API consumers and client cohorts for this app
                                </DialogDescription>
                            </div>
                        </div>

                        <Badge
                            variant="secondary"
                            className="px-2.5 py-1 text-xs font-semibold rounded-full"
                        >
                            {consumers.length} registered
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Search Bar */}
                <div className="px-5 py-3 border-b bg-muted/10 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by client name, identifier, or group..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            className="h-9 pl-9.5 pr-8 text-sm rounded-lg bg-background"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                }}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Consumers List Area */}
                <div className="p-4 overflow-hidden min-h-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-xs text-muted-foreground gap-2.5">
                            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span>Loading registered consumers...</span>
                        </div>
                    ) : consumers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                                <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                No clients registered yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                Clients identified via SDK middleware or header tags will appear automatically here.
                            </p>
                        </div>
                    ) : filteredConsumers.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">
                            No consumers match &quot;{search}&quot;
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[52vh] pr-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {filteredConsumers.map((consumer) => {
                                    const displayName =
                                        consumer.name || consumer.identifier;
                                    const initials = getInitials(
                                        consumer.name,
                                        consumer.identifier,
                                    );
                                    const palette = getAvatarPalette(
                                        consumer.identifier,
                                    );
                                    const isCopied =
                                        copiedId === consumer.identifier;

                                    return (
                                        <div
                                            key={consumer.id}
                                            className="group relative flex items-center justify-between gap-3 rounded-xl border bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30 hover:shadow-xs"
                                        >
                                            <Link
                                                to="/consumers/$consumerId"
                                                params={{
                                                    consumerId: String(
                                                        consumer.id,
                                                    ),
                                                }}
                                                onClick={() => {
                                                    setOpen(false);
                                                }}
                                                className="flex items-center gap-3 min-w-0 flex-1"
                                            >
                                                {/* Colored Avatar */}
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold shadow-2xs transition-transform group-hover:scale-105 ${palette.bg}`}
                                                >
                                                    {initials}
                                                </div>

                                                {/* Text Info */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                                                        {displayName}
                                                    </div>
                                                    <div className="font-mono text-[11px] text-muted-foreground truncate">
                                                        {consumer.identifier}
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Badge & Quick Copy */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {consumer.group ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0.5 h-5 gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 font-medium"
                                                    >
                                                        <Layers className="h-2.5 w-2.5" />
                                                        <span className="truncate max-w-[80px]">
                                                            {consumer.group.name}
                                                        </span>
                                                    </Badge>
                                                ) : null}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        handleCopy(
                                                            consumer.identifier,
                                                            e,
                                                        );
                                                    }}
                                                    title="Copy identifier"
                                                >
                                                    {isCopied ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>

                                                <Link
                                                    to="/consumers/$consumerId"
                                                    params={{
                                                        consumerId: String(
                                                            consumer.id,
                                                        ),
                                                    }}
                                                    onClick={() => {
                                                        setOpen(false);
                                                    }}
                                                    className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Footer Actions */}
                <DialogFooter className="p-4 border-t bg-muted/20 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">
                            Close
                        </Button>
                    </DialogClose>

                    <Button
                        asChild
                        size="sm"
                        className="gap-2 text-xs font-semibold"
                        onClick={() => {
                            setOpen(false);
                        }}
                    >
                        <Link to="/consumers" search={{ appId }}>
                            <span>Full Consumers & Telemetry</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
