import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
    mkdirSync,
    writeFileSync,
    unlinkSync,
    WriteStream,
    createWriteStream,
} from 'node:fs';
import { createGzip, Gzip } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { readFile, unlink } from 'node:fs/promises';

const APP_NAME = 'HitAPI';
const TEMP_DIR = join(tmpdir(), APP_NAME);

export function checkWritableFs() {
    try {
        mkdirSync(TEMP_DIR, { recursive: true });
        const testPath = join(TEMP_DIR, `test_${randomUUID()}`);
        writeFileSync(testPath, 'test');
        unlinkSync(testPath);

        return true;
    } catch {
        return false;
    }
}

export default class TempGzipFile {
    readonly #uuid: string;
    readonly #filePath: string;
    readonly #writeStream: WriteStream;
    readonly #readyPromise: Promise<void>;
    readonly #closedPromise: Promise<void>;
    readonly #gzip: Gzip;

    constructor(name: string) {
        mkdirSync(TEMP_DIR, { recursive: true });

        this.#uuid = randomUUID();
        this.#filePath = join(TEMP_DIR, `${name}_${this.#uuid}.gz`);

        this.#writeStream = createWriteStream(this.#filePath);
        this.#readyPromise = new Promise<void>((resolve, reject) => {
            this.#writeStream.once('ready', resolve);
            this.#writeStream.once('error', reject);
        });
        this.#closedPromise = new Promise<void>((resolve, reject) => {
            this.#writeStream.once('close', resolve);
            this.#writeStream.once('error', reject);
        });

        this.#gzip = createGzip();
        this.#gzip.pipe(this.#writeStream);
    }

    get uuid(): string {
        return this.#uuid;
    }

    get size(): number {
        return this.#writeStream.bytesWritten;
    }

    async writeLine(data: Buffer): Promise<void> {
        await this.#readyPromise;

        return new Promise<void>((resolve, reject) => {
            this.#gzip.write(
                Buffer.concat([data, Buffer.from('\n')]),
                (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                },
            );
        });
    }

    async getContent(): Promise<Buffer<ArrayBuffer>> {
        return readFile(this.#filePath);
    }

    async close(): Promise<void> {
        await new Promise<void>((resolve) => this.#gzip.end(() => resolve()));

        await this.#closedPromise;
    }

    async delete(): Promise<void> {
        await this.close();
        await unlink(this.#filePath);
    }
}
