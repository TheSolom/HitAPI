import type { Request, Response, LogRecord } from '@hitapi/types';
import type { RequestLoggingConfig } from '../../common/types/config.js';
import { FileManager } from './file-manager.js';
import { DataMasker } from './data-masker.js';
import { RequestFilter } from './request-filter.js';
import { RequestLogItemBuilder } from './request-builder.js';
import TempGzipFile, {
    checkWritableFs,
} from '../../common/core/temp-gzip-file.js';
import { MAX_BODY_SIZE, MAINTAIN_INTERVAL_MS } from './constants/index.js';

const DEFAULT_CONFIG: RequestLoggingConfig = {
    enabled: false,
    logQueryParams: true,
    logRequestHeaders: false,
    logRequestBody: false,
    logResponseHeaders: true,
    logResponseBody: false,
    logException: true,
    captureLogs: false,
    captureTraces: false,
    maskQueryParams: [],
    maskHeaders: [],
    maskBodyFields: [],
    excludePaths: [],
};

export default class RequestLogger {
    #enabled: boolean;
    #suspendUntil: number | null = null;
    #maintainIntervalId: NodeJS.Timeout | null = null;
    readonly #config: RequestLoggingConfig;
    readonly #dataMasker: DataMasker;
    readonly #filter: RequestFilter;
    readonly #builder: RequestLogItemBuilder;
    readonly #fileManager: FileManager;

    constructor(config?: Partial<RequestLoggingConfig>) {
        this.#config = { ...DEFAULT_CONFIG, ...config };
        this.#enabled = this.#config.enabled && checkWritableFs();
        this.#dataMasker = new DataMasker();
        this.#filter = new RequestFilter(this.#config);
        this.#builder = new RequestLogItemBuilder(
            this.#config,
            this.#dataMasker,
        );
        this.#fileManager = new FileManager();

        if (this.#enabled) {
            this.#startMaintenance();
        }
    }

    get maxBodySize(): number {
        return MAX_BODY_SIZE;
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    set suspendUntil(value: number | null) {
        this.#suspendUntil = value;
    }

    get config(): RequestLoggingConfig {
        return this.#config;
    }

    #startMaintenance(): void {
        this.#maintainIntervalId = setInterval(() => {
            void this.maintain();
        }, MAINTAIN_INTERVAL_MS);
    }

    #stopMaintenance(): void {
        if (this.#maintainIntervalId) {
            clearInterval(this.#maintainIntervalId);
        }
    }

    logRequest(
        request: Request,
        response: Response,
        error?: Error,
        logs?: LogRecord[],
        traceId?: string,
    ): void {
        if (!this.#enabled || this.#suspendUntil !== null) return;
        if (!this.#filter.shouldLog(request)) return;

        const item = this.#builder.build(
            request,
            response,
            error,
            logs,
            traceId,
        );
        this.#fileManager.writeItem(item);
    }

    async writeToFile(): Promise<void> {
        if (!this.#enabled) return;
        await this.#fileManager.flush();
    }

    async rotateFile(): Promise<void> {
        await this.#fileManager.rotateFile();
    }

    getFile(): TempGzipFile | undefined {
        return this.#fileManager.getNextFile();
    }

    retryFileLater(file: TempGzipFile): void {
        this.#fileManager.retryFile(file);
    }

    async maintain(): Promise<void> {
        if (!this.#enabled) return;

        await this.writeToFile();

        if (this.#fileManager.shouldRotate()) {
            await this.rotateFile();
        }

        await this.#fileManager.cleanup();

        if (this.#suspendUntil !== null && this.#suspendUntil < Date.now()) {
            this.#suspendUntil = null;
        }
    }

    async clear(): Promise<void> {
        this.#fileManager.clear();
        await this.rotateFile();
        await this.#fileManager.deleteAllFiles();
    }

    async close(): Promise<void> {
        this.#enabled = false;
        await this.clear();

        this.#stopMaintenance();
    }
}
