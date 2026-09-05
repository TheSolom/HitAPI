/**
 * Format bytes into human-readable unit (B, KB, MB, GB, etc.)
 */
export function formatBytes(bytes?: number | null, decimals = 1): string {
    if (
        bytes === undefined ||
        bytes === null ||
        bytes <= 0 ||
        !Number.isFinite(bytes)
    )
        return '0 B';
    const k = 1024;
    const dm = Math.max(decimals, 0);
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);
    const val = bytes / Math.pow(k, sizeIndex);
    return `${val.toFixed(dm)} ${sizes[sizeIndex]}`;
}

/**
 * Format CPU percentage with appropriate precision and symbol
 */
export function formatCpuPercent(
    percent?: number | null,
    decimals = 1,
): string {
    if (percent === undefined || percent === null || Number.isNaN(percent)) {
        return '0%';
    }
    return `${percent.toFixed(decimals)}%`;
}
