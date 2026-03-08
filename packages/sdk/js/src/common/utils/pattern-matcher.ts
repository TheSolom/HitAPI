export function patternMatcher(
    value: string,
    patterns: readonly RegExp[],
): boolean {
    return patterns.some((pattern) => pattern.test(value));
}
