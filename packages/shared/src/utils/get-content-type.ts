export function getContentType(
    headers: [string, string][],
): string | undefined {
    return headers.find(([k]) => k.toLowerCase() === 'content-type')?.[1];
}
