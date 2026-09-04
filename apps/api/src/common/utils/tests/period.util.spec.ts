import { jest } from '@jest/globals';
import { parsePeriod, applyPeriodFilter } from '../period.util.js';
import type { SelectQueryBuilder } from 'typeorm';

describe('period.util', () => {
    describe('parsePeriod', () => {
        it('should parse relative periods correctly', () => {
            const result = parsePeriod('1h');
            expect(result.type).toBe('relative');
            if (result.type === 'relative') {
                expect(result.durationMs).toBe(3600000);
                expect(result.granularity).toBe('minute');
                expect(result.since).toBeInstanceOf(Date);
            }
        });

        it('should choose correct granularity for day/week ranges', () => {
            const dayResult = parsePeriod('1d');
            expect(dayResult.granularity).toBe('hour');

            const weekResult = parsePeriod('7d');
            expect(weekResult.granularity).toBe('day');

            const monthResult = parsePeriod('30d');
            expect(monthResult.granularity).toBe('week');
        });

        it('should parse absolute date range periods correctly', () => {
            const now = new Date();
            const start = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const end = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const periodStr = `${start}|${end}`;

            const result = parsePeriod(periodStr);
            expect(result.type).toBe('range');
            if (result.type === 'range') {
                expect(result.startDate).toBeInstanceOf(Date);
                expect(result.endDate).toBeInstanceOf(Date);
                expect(result.granularity).toBeDefined();
            }
        });

        it('should throw error if range format is missing start or end', () => {
            expect(() => parsePeriod('invalid|')).toThrow(
                'Invalid period format',
            );
            expect(() => parsePeriod('|invalid')).toThrow(
                'Invalid period format',
            );
        });

        it('should throw error if start date is after end date', () => {
            const now = new Date();
            const start = now.toISOString();
            const end = new Date(now.getTime() - 10000).toISOString();

            expect(() => parsePeriod(`${start}|${end}`)).toThrow(
                'Start date must be before end date',
            );
        });

        it('should throw error if start date is older than 12 months', () => {
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            const oneYearAgo = new Date();
            oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);

            expect(() =>
                parsePeriod(
                    `${twoYearsAgo.toISOString()}|${oneYearAgo.toISOString()}`,
                ),
            ).toThrow('Start date must be within the last 12 months');
        });
    });

    describe('applyPeriodFilter', () => {
        let qbMock: { andWhere: jest.Mock };

        beforeEach(() => {
            qbMock = {
                andWhere: jest.fn(),
            };
        });

        it('should apply relative period filter using >=', () => {
            const parsed = parsePeriod('1h');
            applyPeriodFilter(
                qbMock as unknown as SelectQueryBuilder<any>,
                parsed,
                'log',
                'timestamp',
            );

            expect(qbMock.andWhere).toHaveBeenCalledWith(
                'log.timestamp >= :periodTimestamp',
                {
                    periodTimestamp: expect.any(String),
                },
            );
        });

        it('should apply range period filter using BETWEEN', () => {
            const now = new Date();
            const start = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
            const end = now.toISOString().split('T')[0];
            const parsed = parsePeriod(`${start}|${end}`);

            applyPeriodFilter(
                qbMock as unknown as SelectQueryBuilder<any>,
                parsed,
                'log',
                'createdAt',
            );

            expect(qbMock.andWhere).toHaveBeenCalledWith(
                'log.createdAt BETWEEN :startDate AND :endDate',
                {
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                },
            );
        });
    });
});
