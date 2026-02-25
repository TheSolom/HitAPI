import type { StringValue } from 'ms';

export type RelativePeriod = StringValue;
export type RangePeriod = `${string}|${string}`;
export type Period = RelativePeriod | RangePeriod;
export type TruncUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';
export type ParsedPeriod =
    | {
          type: 'relative';
          since: Date;
          durationMs: number;
          granularity: TruncUnit;
      }
    | { type: 'range'; startDate: Date; endDate: Date; granularity: TruncUnit };
