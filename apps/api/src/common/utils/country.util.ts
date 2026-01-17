import countries from 'i18n-iso-countries';

export const LANGUAGE = 'en';

export function getCountryName(countryCode: string | null | undefined): string {
    if (!countryCode) {
        return 'Unknown';
    }

    return countries.getName(countryCode, LANGUAGE) ?? 'Unknown';
}
