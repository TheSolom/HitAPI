export const stringToInt = (value?: string | null): number => {
    return Number.parseInt(value ?? '0');
};

export const stringToFloat = (value?: string | null): number => {
    return Number.parseFloat(value ?? '0');
};
