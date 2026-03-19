export function calculateRate(
    numerator: number,
    denominator: number,
    precision: number = 2,
): number {
    if (denominator <= 0) return 0;

    const factor = Math.pow(10, precision);
    return Math.round((numerator / denominator) * 100 * factor) / factor;
}
