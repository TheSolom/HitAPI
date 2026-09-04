import { createCSV } from '../csv.util.js';

describe('csv.util', () => {
    describe('createCSV', () => {
        it('should generate CSV string from array of objects and headers', async () => {
            const data = [
                { id: '1', name: 'App One' },
                { id: '2', name: 'App Two' },
            ];
            const headers = ['id', 'name'];

            const result = await createCSV(data, headers);
            expect(result).toContain('id,name');
            expect(result).toContain('1,App One');
            expect(result).toContain('2,App Two');
        });

        it('should format dates and objects properly', async () => {
            const date = new Date('2026-01-01T00:00:00.000Z');
            const data = [{ id: '1', meta: { key: 'val' }, createdAt: date }];
            const headers = ['id', 'meta', 'createdAt'];

            const result = await createCSV(data, headers);
            expect(result).toContain('id,meta,createdAt');
            expect(result).toContain('2026-01-01T00:00:00.000Z');
        });

        it('should handle empty data list', async () => {
            const data: Record<string, any>[] = [];
            const headers = ['id', 'name'];

            const result = await createCSV(data, headers);
            expect(result).toContain('id,name');
        });
    });
});
