import type { MouseEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { Check, Copy, ExternalLink, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConsumerAvatar } from '../avatar';

export interface ConsumerCardItemProps {
    consumer: {
        id: number | string;
        name?: string | null;
        identifier: string;
        group?: { name: string } | null;
    };
    isCopied: boolean;
    onCopy: (identifier: string, e: MouseEvent) => void;
    onNavigate?: () => void;
    showGroupBadge?: boolean;
}

export function ConsumerCardItem({
    consumer,
    isCopied,
    onCopy,
    onNavigate,
    showGroupBadge = false,
}: Readonly<ConsumerCardItemProps>) {
    const displayName = consumer.name || consumer.identifier;

    return (
        <div className="group relative flex items-center justify-between gap-3 rounded-md border bg-card p-3 transition-colors duration-150 hover:bg-muted/30">
            <Link
                to="/consumers/$consumerId"
                params={{ consumerId: String(consumer.id) }}
                onClick={onNavigate}
                className="flex items-center gap-3 min-w-0 flex-1"
            >
                <ConsumerAvatar
                    name={consumer.name}
                    identifier={consumer.identifier}
                    className="transition-transform group-hover:scale-105"
                />

                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {displayName}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground truncate">
                        {consumer.identifier}
                    </div>
                </div>
            </Link>

            <div className="flex items-center gap-1.5 shrink-0">
                {showGroupBadge && consumer.group ? (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0.5 h-5 gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 font-medium"
                    >
                        <Layers className="h-2.5 w-2.5" />
                        <span className="truncate max-w-20">
                            {consumer.group.name}
                        </span>
                    </Badge>
                ) : null}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                        onCopy(consumer.identifier, e);
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
                    params={{ consumerId: String(consumer.id) }}
                    onClick={onNavigate}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        title="View profile"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
