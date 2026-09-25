import { useState } from 'react';
import { toast } from 'sonner';
import { downloadCsv } from '@/lib/download';

export interface UseExportCsvOptions<TParams> {
    /** Calls the API and returns raw CSV string */
    fetcher: (params: TParams, signal?: AbortSignal) => Promise<string>;
    /** Prefix for the downloaded filename, e.g. 'traffic' → `traffic-<appId>-<date>.csv` */
    filenamePrefix: string;
    /** Extracts the appId from params for the filename */
    getAppId: (params: TParams) => string;
}

/**
 * Generic reusable hook for exporting any API resource as a CSV file.
 *
 * @example
 * const { exportCsv, isExporting } = useExportCsv<GetRequestLogsOptions>({
 *     filenamePrefix: 'request-logs',
 *     getAppId: (p) => p.appId,
 *     fetcher: (p) => requestLogsApi.export(p),
 * });
 */
export function useExportCsv<TParams>(options: UseExportCsvOptions<TParams>) {
    const [isExporting, setIsExporting] = useState(false);

    const exportCsv = async (params: TParams) => {
        setIsExporting(true);
        const toastId = toast.loading('Exporting data as CSV...');

        try {
            const csv = await options.fetcher(params);
            if (!csv || typeof csv !== 'string') {
                throw new Error('No data received from export endpoint');
            }
            const dateStr = new Date().toISOString().slice(0, 10);
            const appId = options.getAppId(params);
            downloadCsv(
                csv,
                `${options.filenamePrefix}-${appId}-${dateStr}.csv`,
            );
            toast.success('Export complete', { id: toastId });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Failed to export';
            toast.error(message, { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return { exportCsv, isExporting };
}
