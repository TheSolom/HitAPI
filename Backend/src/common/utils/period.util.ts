import ms from 'ms';

export function calculatePeriodTimestamp(period: ms.StringValue): Date {
    const milliseconds = ms(period);

    return new Date(Date.now() - milliseconds);
}
