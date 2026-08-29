export interface ParsedSessionDevice {
    browser: string;
    os: string;
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'app';
    label: string;
}

export function parseUserAgent(ua?: string | null): ParsedSessionDevice {
    if (!ua) {
        return {
            browser: 'Unknown Browser',
            os: 'Unknown OS',
            deviceType: 'desktop',
            label: 'Unknown Device',
        };
    }

    let os = 'Unknown OS';
    if (/windows nt 10\.0/i.test(ua)) os = 'Windows';
    else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
    else if (/windows nt 6\.2/i.test(ua)) os = 'Windows 8';
    else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/iphone/i.test(ua)) os = 'iOS (iPhone)';
    else if (/ipad/i.test(ua)) os = 'iPadOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Web Browser';
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'app' = 'desktop';

    if (/ipad/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/iphone|android.*mobile/i.test(ua)) {
        deviceType = 'mobile';
    }

    if (/code\//i.test(ua) || /electron/i.test(ua)) {
        browser = 'VS Code / Desktop App';
        deviceType = 'app';
    } else if (/edg\//i.test(ua)) {
        browser = 'Microsoft Edge';
    } else if (/opr\/|opera/i.test(ua)) {
        browser = 'Opera';
    } else if (/chrome\//i.test(ua)) {
        browser = 'Google Chrome';
    } else if (/firefox\//i.test(ua)) {
        browser = 'Mozilla Firefox';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        browser = 'Apple Safari';
    }

    return {
        browser,
        os,
        deviceType,
        label: `${browser} on ${os}`,
    };
}
