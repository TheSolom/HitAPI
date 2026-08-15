export type RelativePeriod = string;
export type RangePeriod = `${string}|${string}`;
export type Period = string;

export type TruncUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';

export type ParsedPeriod =
    | {
          type: 'relative';
          since: Date;
          durationMs: number;
          granularity: TruncUnit;
      }
    | { type: 'range'; startDate: Date; endDate: Date; granularity: TruncUnit };

export interface PeriodQuery {
    period?: Period;
    start_time?: string;
    end_time?: string;
}
