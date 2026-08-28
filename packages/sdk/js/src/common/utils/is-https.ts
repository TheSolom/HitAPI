export function isHttps(headers: [string, string][]): boolean {
    return headers.some(([key, value]) => {
        switch (key.toLowerCase()) {
            case 'x-forwarded-proto':
            case 'x-forwarded-protocol':
            case 'x-forwarded-scheme':
            case 'x-url-scheme':
            case 'x-scheme':
                return value.split(',')[0].trim().toLowerCase() === 'https';
            case 'front-end-https':
            case 'x-forwarded-ssl':
                return value.toLowerCase() === 'on';
            case 'forwarded':
                return value
                    .split(',')[0]
                    .trim()
                    .toLowerCase()
                    .includes('proto=https');
            default:
                return false;
        }
    });
}
