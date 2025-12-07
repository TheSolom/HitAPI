import slugify from 'slugify';

export function createSlug(text: string): string {
    return slugify.default(text, { lower: true, strict: true, trim: true });
}
