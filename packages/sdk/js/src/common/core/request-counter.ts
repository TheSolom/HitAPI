import type { RequestsItem } from '@hitapi/types';
import type { RequestInfo } from '../types/requests.js';

export default class RequestCounter {
    readonly #SEPARATOR = '█';
    readonly #requestCounts: Map<string, number>;
    readonly #requestSizeSums: Map<string, number>;
    readonly #responseSizeSums: Map<string, number>;
    readonly #responseTimes: Map<string, Map<number, number>>;
    readonly #requestSizes: Map<string, Map<number, number>>;
    readonly #responseSizes: Map<string, Map<number, number>>;

    constructor() {
        this.#requestCounts = new Map<string, number>();
        this.#requestSizeSums = new Map<string, number>();
        this.#responseSizeSums = new Map<string, number>();
        this.#responseTimes = new Map<string, Map<number, number>>();
        this.#requestSizes = new Map<string, Map<number, number>>();
        this.#responseSizes = new Map<string, Map<number, number>>();
    }

    #getKey(requestInfo: RequestInfo): string {
        return [
            requestInfo.consumer ?? '',
            requestInfo.method,
            requestInfo.path,
            requestInfo.statusCode,
        ].join(this.#SEPARATOR);
    }

    #roundToNearestTen(value: number): number {
        return Math.floor(value / 10) * 10;
    }

    #roundToNearestKb(value: number): number {
        return Math.floor(value / 1000) * 1000;
    }

    addRequest(requestInfo: RequestInfo): void {
        const key = this.#getKey(requestInfo);

        this.#requestCounts.set(key, (this.#requestCounts.get(key) ?? 0) + 1);

        if (!this.#responseTimes.has(key)) {
            this.#responseTimes.set(key, new Map<number, number>());
        }
        const responseTimeMap = this.#responseTimes.get(key)!;
        const responseTimeMsBin = this.#roundToNearestTen(
            requestInfo.responseTime,
        );
        responseTimeMap.set(
            responseTimeMsBin,
            (responseTimeMap.get(responseTimeMsBin) ?? 0) + 1,
        );

        if (requestInfo.requestSize) {
            const requestSize = Number(requestInfo.requestSize);
            this.#requestSizeSums.set(
                key,
                (this.#requestSizeSums.get(key) ?? 0) + requestSize,
            );
            if (!this.#requestSizes.has(key)) {
                this.#requestSizes.set(key, new Map<number, number>());
            }
            const requestSizeMap = this.#requestSizes.get(key)!;
            const requestSizeKbBin = this.#roundToNearestKb(requestSize);
            requestSizeMap.set(
                requestSizeKbBin,
                (requestSizeMap.get(requestSizeKbBin) ?? 0) + 1,
            );
        }

        if (requestInfo.responseSize) {
            const responseSize = Number(requestInfo.responseSize);
            this.#responseSizeSums.set(
                key,
                (this.#responseSizeSums.get(key) ?? 0) + responseSize,
            );
            if (!this.#responseSizes.has(key)) {
                this.#responseSizes.set(key, new Map<number, number>());
            }
            const responseSizeMap = this.#responseSizes.get(key)!;
            const responseSizeKbBin = this.#roundToNearestKb(responseSize);
            responseSizeMap.set(
                responseSizeKbBin,
                (responseSizeMap.get(responseSizeKbBin) ?? 0) + 1,
            );
        }
    }

    getAndResetRequests(): RequestsItem[] {
        const data: RequestsItem[] = [];
        this.#requestCounts.forEach((count, key) => {
            const [consumer, method, path, statusCodeStr] = key.split(
                this.#SEPARATOR,
            );
            const responseTimes =
                this.#responseTimes.get(key) ?? new Map<number, number>();
            const requestSizes =
                this.#requestSizes.get(key) ?? new Map<number, number>();
            const responseSizes =
                this.#responseSizes.get(key) ?? new Map<number, number>();

            data.push({
                consumer,
                method: method as RequestsItem['method'],
                path,
                statusCode: Number.parseInt(statusCodeStr),
                requestCount: count,
                requestSizeSum: this.#requestSizeSums.get(key) ?? 0,
                responseSizeSum: this.#responseSizeSums.get(key) ?? 0,
                responseTimes: Object.fromEntries(responseTimes),
                requestSizes: Object.fromEntries(requestSizes),
                responseSizes: Object.fromEntries(responseSizes),
            });
        });

        this.#requestCounts.clear();
        this.#requestSizeSums.clear();
        this.#responseSizeSums.clear();
        this.#responseTimes.clear();
        this.#requestSizes.clear();
        this.#responseSizes.clear();

        return data;
    }
}
