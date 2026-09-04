import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenCleanupService } from '../refresh-token-cleanup.service.js';
import { Services } from '../../../../common/constants/services.constant.js';

describe('RefreshTokenCleanupService', () => {
    let service: RefreshTokenCleanupService;
    let tokensServiceMock: {
        removeExpiredRefreshTokens: jest.Mock;
    };

    beforeEach(async () => {
        tokensServiceMock = {
            removeExpiredRefreshTokens: jest.fn(async () => {}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefreshTokenCleanupService,
                {
                    provide: Services.TOKENS,
                    useValue: tokensServiceMock,
                },
            ],
        }).compile();

        service = module.get<RefreshTokenCleanupService>(
            RefreshTokenCleanupService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call tokensService.removeExpiredRefreshTokens on cleanup', async () => {
        await service.cleanup();

        expect(
            tokensServiceMock.removeExpiredRefreshTokens,
        ).toHaveBeenCalledTimes(1);
    });
});
