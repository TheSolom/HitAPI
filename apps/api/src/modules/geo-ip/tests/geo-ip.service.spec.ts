import { jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import type { IGeoIPService } from '../interfaces/geo-ip-service.interface.js';

const mockOpen = jest.fn<() => Promise<{ get: jest.Mock }>>();

jest.unstable_mockModule('maxmind', () => ({
    open: mockOpen,
}));

const { GeoIPService } = await import('../geo-ip.service.js');

describe('GeoIPService', () => {
    let service: IGeoIPService;
    let mockLookup: { get: jest.Mock };

    beforeEach(async () => {
        jest.clearAllMocks();
        (GeoIPService as unknown as { lookup: undefined }).lookup = undefined;

        mockLookup = {
            get: jest.fn(),
        };

        mockOpen.mockResolvedValue(mockLookup);

        const module: TestingModule = await Test.createTestingModule({
            providers: [GeoIPService],
        }).compile();

        await module.init();

        service = module.get<IGeoIPService>(GeoIPService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCountry', () => {
        it('should return country details when a valid IP is provided', () => {
            const mockIp = '8.8.8.8';
            const mockResponse = {
                country: {
                    iso_code: 'US',
                    names: {
                        en: 'United States',
                    },
                },
            };

            mockLookup.get.mockReturnValue(mockResponse);

            const result = service.getCountry(mockIp);

            expect(mockLookup.get).toHaveBeenCalledWith(mockIp);
            expect(result).toEqual({
                countryCode: 'US',
                countryName: 'United States',
            });
        });

        it('should return null when the IP is not found or returns no country data', () => {
            const mockIp = '127.0.0.1';
            mockLookup.get.mockReturnValue(null);

            const result = service.getCountry(mockIp);

            expect(mockLookup.get).toHaveBeenCalledWith(mockIp);
            expect(result).toBeNull();
        });

        it('should return null when the lookup response does not contain country info', () => {
            const mockIp = '10.0.0.1';
            const mockResponse = {
                city: { names: { en: 'Internal' } },
            };

            mockLookup.get.mockReturnValue(mockResponse);

            const result = service.getCountry(mockIp);

            expect(mockLookup.get).toHaveBeenCalledWith(mockIp);
            expect(result).toBeNull();
        });

        it('should return null when an error occurs during lookup', () => {
            const mockIp = 'invalid-ip';
            mockLookup.get.mockImplementation(() => {
                throw new Error('Database error');
            });

            const result = service.getCountry(mockIp);

            expect(mockLookup.get).toHaveBeenCalledWith(mockIp);
            expect(result).toBeNull();
        });
    });

    describe('onModuleInit', () => {
        it('should initialize the maxmind lookup', () => {
            expect(mockOpen).toHaveBeenCalledWith(
                'assets/GeoLite2-Country_20260102/GeoLite2-Country.mmdb',
            );
        });
    });
});
