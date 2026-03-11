import nock from 'nock';
import { jest } from '@jest/globals';
import { mockHitAPIHub, CLIENT_ID, HITAPI_BASE_URL } from '../utils.js';
import { HitAPIClient } from '../../src/common/core/client.js';

describe('Client', () => {
    beforeAll(() => mockHitAPIHub());

    it('Initializes client Successfully', () => {
        const client = HitAPIClient.init({ clientId: CLIENT_ID });
        expect(client.enabled).toBe(true);
    });

    it('stops Initialization when using invalid Client ID', () => {
        const client = HitAPIClient.init({ clientId: 'xxx' });
        expect(client.enabled).toBe(false);
    });

    it('Throws when getting non initialized instance', () => {
        expect(() => HitAPIClient.getInstance()).toThrow(
            'HitAPI client is not initialized',
        );
    });

    it('Stops sync if client ID is invalid', async () => {
        nock.cleanAll();
        nock(HITAPI_BASE_URL)
            .persist()
            .post(/\/(startup|sync)$/)
            .reply(401, `Missing X-Client-ID header`);

        const client = HitAPIClient.init({ clientId: CLIENT_ID });
        jest.spyOn(client.logger, 'error').mockImplementation(() => {});
        await client.startSync();

        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(client.enabled).toBe(false);
    });

    afterEach(async () => HitAPIClient.shutdown());
});
