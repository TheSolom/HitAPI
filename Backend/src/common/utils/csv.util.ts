import { stringify } from 'csv-stringify';

export async function createCSV(
    data: Record<string, any>[],
    headers: string[],
): Promise<string> {
    return new Promise((resolve, reject) => {
        const stringifier = stringify({
            header: true,
            columns: headers,
            cast: {
                object: (value) => JSON.stringify(value),
                date: (value) => value.toISOString(),
            },
        });

        let csv = '';
        stringifier.on('readable', () => {
            let row: string | null;
            while ((row = stringifier.read() as string | null) !== null) {
                csv += row;
            }
        });

        stringifier.on('error', (err) => reject(err));
        stringifier.on('finish', () => resolve(csv));

        data.forEach((item) => stringifier.write(item));
        stringifier.end();
    });
}
