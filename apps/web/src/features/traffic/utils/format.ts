/**
 * Format bytes into human-readable unit (B, KB, MB, GB, etc.)
 */
export function formatBytes(bytes?: number | null, decimals = 1): string {
    if (
        bytes === undefined ||
        bytes === null ||
        bytes <= 0 ||
        !Number.isFinite(bytes)
    ) {
        return '0 B';
    }
    const k = 1024;
    const dm = Math.max(decimals, 0);
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);
    const val = bytes / Math.pow(k, sizeIndex);
    return `${val.toFixed(dm)} ${sizes[sizeIndex]}`;
}

/**
 * Format a percentage error or success rate
 */
export function formatRate(rate?: number | null, decimals = 2): string {
    if (rate === undefined || rate === null || Number.isNaN(rate)) {
        return '0.00%';
    }
    return `${rate.toFixed(decimals)}%`;
}
