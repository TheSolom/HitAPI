import AsyncLock from 'async-lock';
import Denque from 'denque';
import type { RequestLogItem, Request, Response } from '@hitapi/types';
import TempGzipFile from '../../common/core/temp-gzip-file.js';
import {
    MAX_PENDING_WRITES,
    MAX_FILE_SIZE,
    MAX_FILES,
    FILE_LOCK_KEY,
} from './constants/index.js';

export class FileManager {
    #currentFile: TempGzipFile | null = null;
    readonly #pendingWrites = new Denque<RequestLogItem>();
    readonly #files = new Denque<TempGzipFile>();
    readonly #lock = new AsyncLock();

    #skipEmptyValues<T extends Record<string, any>>(data: T): Partial<T> {
        const entries = Object.entries(data).filter(([, value]) => {
            if (value == null || Number.isNaN(value)) return false;

            if (
                Array.isArray(value) ||
                Buffer.isBuffer(value) ||
                typeof value === 'string'
            ) {
                return value.length > 0;
            }

            return true;
        });

        return Object.fromEntries(entries) as Partial<T>;
    }

    #serializeItem(item: RequestLogItem): string {
        const finalItem = {
            uuid: item.uuid,
            request: this.#skipEmptyValues<Request>(item.request),
            response: this.#skipEmptyValues<Response>(item.response),
            exception: item.exception,
            logs: item.logs,
            traceId: item.traceId,
        };

        return JSON.stringify(finalItem, (_key, value) => {
            if (Buffer.isBuffer(value)) {
                return value.toString('base64');
            }
            return value as string;
        });
    }

    async #writeToCurrentFile(item: RequestLogItem): Promise<void> {
        if (!this.#currentFile) return;

        const serializedItem = this.#serializeItem(item);
        await this.#currentFile.writeLine(Buffer.from(serializedItem));
    }

    writeItem(item: RequestLogItem): void {
        this.#pendingWrites.push(item);

        if (this.#pendingWrites.length > MAX_PENDING_WRITES) {
            this.#pendingWrites.shift();
        }
    }

    getNextFile(): TempGzipFile | undefined {
        return this.#files.shift();
    }

    retryFile(file: TempGzipFile): void {
        this.#files.unshift(file);
    }

    clear(): void {
        this.#pendingWrites.clear();
    }

    shouldRotate(): boolean {
        return (
            (this.#currentFile && this.#currentFile.size > MAX_FILE_SIZE) ??
            false
        );
    }

    async rotateFile(): Promise<void> {
        return this.#lock.acquire(FILE_LOCK_KEY, async () => {
            if (this.#currentFile) {
                await this.#currentFile.close();
                this.#files.push(this.#currentFile);
                this.#currentFile = null;
            }
        });
    }

    async flush(): Promise<void> {
        if (this.#pendingWrites.length === 0) return;

        const FILE_NAME = 'request_logs';
        return this.#lock.acquire(FILE_LOCK_KEY, async () => {
            this.#currentFile ??= new TempGzipFile(FILE_NAME);

            while (this.#pendingWrites.length > 0) {
                const item = this.#pendingWrites.shift();
                if (!item) continue;

                await this.#writeToCurrentFile(item);
            }
        });
    }

    async cleanup(): Promise<void> {
        while (this.#files.length > MAX_FILES) {
            const file = this.#files.shift();
            await file?.delete();
        }
    }

    async deleteAllFiles(): Promise<void> {
        while (!this.#files.isEmpty()) {
            const file = this.#files.shift();
            await file?.delete();
        }
        this.#files.clear();
    }
}
