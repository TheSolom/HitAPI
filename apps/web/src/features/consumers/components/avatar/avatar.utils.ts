export const AVATAR_PALETTES = [
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
