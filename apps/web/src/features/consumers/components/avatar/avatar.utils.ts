export const AVATAR_PALETTES = [
    {
        bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    },
    {
        bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    },
    {
        bg: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20',
    },
    {
        bg: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20',
    },
    {
        bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    },
] as const;

export function getAvatarPalette(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (str.codePointAt(i) ?? 0) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

export function getInitials(name?: string | null, identifier?: string): string {
    const raw = name || identifier || '?';
    const parts = raw.split(/[\s_-]+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
}
