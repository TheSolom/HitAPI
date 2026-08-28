import { gunzipSync } from 'node:zlib';
import TempGzipFile from '../../src/common/core/temp-gzip-file.js';

describe('Temporary gzip file', () => {
    it('End to end', async () => {
        const file = new TempGzipFile('test');
        expect(file.size).toBe(0);

        await file.writeLine(Buffer.from('test1'));
        await file.writeLine(Buffer.from('test2'));

        // Wait for gzip stream to flush to file write stream
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(file.size).toBeGreaterThan(0);

        await file.close();

        const compressedData = await file.getContent();
        const content = gunzipSync(compressedData).toString();
        expect(content).toBe('test1\ntest2\n');

        await file.delete();
    });
});
