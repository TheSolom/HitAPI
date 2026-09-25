export type ChartViewType = 'bar' | 'area';

export interface ChartSeries {
    dataKey: string;
    name: string;
    color: string;
    radius?: [number, number, number, number];
    fillOpacity?: number;
    strokeWidth?: number;
}
