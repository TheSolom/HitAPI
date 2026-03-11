import type { Application } from 'express';
import request, { type Agent } from 'supertest';
import { jest } from '@jest/globals';
import { RestfulMethod } from '@hitapi/shared/enums';
import { HitAPIClient } from '../../../src/common/core/client.js';
import { mockHitAPIHub } from '../../utils.js';
import { getRouterInfo } from '../../../src/integrations/express/utils.js';
import {
    getAppWithMiddlewareOnRouter,
    getAppWithNestedRouters,
    getAppWithValidator,
} from './app.js';

const testCases = [
    {
        name: 'Middleware for Express with express-validator',
        getApp: getAppWithValidator,
    },
];

testCases.forEach(({ name, getApp }) => {
    describe(name, () => {
        let app: Application;
        let appTest: Agent;
        let client: HitAPIClient;

        beforeEach(async () => {
            mockHitAPIHub();
            app = getApp();
            appTest = request(app);
            client = HitAPIClient.getInstance();

            // Wait for 600 ms for startup data to be set
            await new Promise((resolve) => setTimeout(resolve, 600));
        });

        it('Request counter', async () => {
            await appTest.get('/hello?name=John&age=20').expect(200);
            await appTest
                .post('/hello')
                .send({ name: 'John', age: 20 })
                .expect(200);
            await appTest.get('/hello?name=Bob&age=17').expect(400); // invalid (age < 18)
            await appTest.get('/hello?name=X&age=1').expect(400); // invalid (name too short and age < 18)
            await appTest.get('/error').expect(500);

            const requests = client.requestCounter.getAndResetRequests();
            expect(requests.length).toBe(4);
            expect(
                requests.some(
                    (r) =>
                        r.consumer === 'test' &&
                        r.method === RestfulMethod.GET &&
                        r.path === '/hello' &&
                        r.statusCode === 200 &&
                        r.requestSizeSum === 0 &&
                        r.responseSizeSum > 0 &&
                        r.consumer === 'test',
                ),
            ).toBe(true);
            expect(
                requests.some(
                    (r) =>
                        r.method === RestfulMethod.POST &&
                        r.path === '/hello' &&
                        r.statusCode === 200 &&
                        r.requestSizeSum > 0 &&
                        r.responseSizeSum > 0,
                ),
            ).toBe(true);
            expect(
                requests.some(
                    (r) => r.statusCode === 400 && r.requestCount === 2,
                ),
            ).toBe(true);
            expect(
                requests.some(
                    (r) => r.statusCode === 500 && r.requestCount === 1,
                ),
            ).toBe(true);
        });

        it('Request logger', async () => {
            const spy = jest.spyOn(client.requestLogger, 'logRequest');
            let call = null;

            await appTest.get('/hello?name=John&age=20').expect(200);

            expect(spy).toHaveBeenCalledTimes(1);

            call = spy.mock.calls[0];

            expect(call[0].method).toBe(RestfulMethod.GET);
            expect(call[0].path).toBe('/hello');
            expect(call[0].url).toMatch(
                /^http:\/\/127\.0\.0\.1(:\d+)?\/hello\?name=John&age=20$/,
            );
            expect(call[0].consumer).toBe('test');

            expect(call[1].statusCode).toBe(200);
            expect(call[1].responseTime).toBeGreaterThan(0);
            expect(call[1].size).toBeGreaterThan(0);
            expect(call[1].headers).toContainEqual([
                'content-type',
                'text/plain; charset=utf-8',
            ]);
            expect(call[1].body).toBeInstanceOf(Buffer);
            expect(call[1].body!.toString()).toMatch(/^Hello John!/);

            expect(call[3]).toBeDefined();
            expect(call[3]).toHaveLength(2);
            expect(call[3]![0].level).toBe('warn');
            expect(call[3]![0].message).toBe('Console test');
            expect(call[3]![1].level).toBe('info');
            expect(call[3]![1].message).toBe('Winston test');

            spy.mockClear();

            await appTest
                .post('/hello')
                .send({ name: 'John', age: 20 })
                .expect(200);

            expect(spy).toHaveBeenCalledTimes(1);

            call = spy.mock.calls[0];

            expect(call[0].method).toBe(RestfulMethod.POST);
            expect(call[0].path).toBe('/hello');
            expect(call[0].headers).toContainEqual([
                'content-type',
                'application/json',
            ]);
            expect(call[0].body).toBeInstanceOf(Buffer);
            expect(call[0].body!.toString()).toMatch(
                /^{"name":"John","age":20}$/,
            );

            expect(call[1].body).toBeInstanceOf(Buffer);
            expect(call[1].body!.toString()).toMatch(/^Hello John!/);
        });

        it('Validation error counter', async () => {
            await appTest.get('/hello?name=John&age=20').expect(200);
            await appTest.get('/hello?name=Bob&age=17').expect(400); // invalid (age < 18)
            await appTest.get('/hello?name=X&age=1').expect(400); // invalid (name too short and age < 18)

            const validationErrors =
                client.validationErrorCounter.getAndResetValidationErrors();
            expect(validationErrors.length).toBe(2);
            expect(
                validationErrors.find(
                    (e) => e.loc[0] == 'query' && e.loc[1] == 'age',
                )?.errorCount,
            ).toBe(2);
        });

        it('Server error counter', async () => {
            await appTest.get('/error').expect(500);

            const serverErrors =
                client.serverErrorCounter.getAndResetServerErrors();
            expect(serverErrors.length).toBe(1);
            expect(
                serverErrors.some(
                    (e) =>
                        e.type === 'Error' &&
                        e.msg === 'test' &&
                        e.traceback &&
                        e.errorCount === 1,
                ),
            ).toBe(true);
        });

        it('List endpoints', () => {
            expect(client.startupData?.paths).toEqual([
                {
                    method: RestfulMethod.GET,
                    path: '/hello',
                },
                {
                    method: RestfulMethod.POST,
                    path: '/hello',
                },
                {
                    method: RestfulMethod.GET,
                    path: '/hello/:id',
                },
                {
                    method: RestfulMethod.GET,
                    path: '/error',
                },
            ]);
        });

        afterEach(async () => {
            if (client) {
                await HitAPIClient.shutdown();
            }
        });
    });
});

describe('Middleware for Express router', () => {
    let app: Application;
    let appTest: Agent;
    let client: HitAPIClient;

    beforeEach(async () => {
        mockHitAPIHub();
        app = getAppWithMiddlewareOnRouter();
        appTest = request(app);
        client = HitAPIClient.getInstance();

        // Wait for 1.2 seconds for startup data to be set
        await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    it('Request counter', async () => {
        await appTest.get('/api/hello').expect(200);

        const requests = client.requestCounter.getAndResetRequests();
        expect(requests.length).toBe(1);
        expect(
            requests.some(
                (r) =>
                    r.method === RestfulMethod.GET &&
                    r.path === '/api/hello' &&
                    r.statusCode === 200,
            ),
        ).toBe(true);
    });

    it('List endpoints', () => {
        expect(client.startupData?.paths).toEqual([
            {
                method: RestfulMethod.GET,
                path: '/api/api/hello',
            },
        ]);
    });

    afterEach(async () => {
        if (client) {
            await HitAPIClient.shutdown();
        }
    });
});

describe('Middleware for Express with nested routers', () => {
    let app: Application;
    let appTest: Agent;
    let client: HitAPIClient;

    beforeEach(async () => {
        mockHitAPIHub();
        app = getAppWithNestedRouters();
        appTest = request(app);
        client = HitAPIClient.getInstance();

        // Wait for 1.2 seconds for startup data to be set
        await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    it('Request counter', async () => {
        await appTest.get('/health').expect(200);
        await appTest.get('/api/v1/hello/bob').expect(200);
        await appTest.get('/api/v2/goodbye/world').expect(200);
        await appTest.get('/test').expect(200);

        const requests = client.requestCounter.getAndResetRequests();
        expect(requests.length).toBe(4);
        expect(
            requests.some(
                (r) =>
                    r.method === RestfulMethod.GET &&
                    r.path === '/health' &&
                    r.statusCode === 200,
            ),
        ).toBe(true);
        expect(
            requests.some(
                (r) =>
                    r.method === RestfulMethod.GET &&
                    r.path === '/api/:version/hello/:name' &&
                    r.statusCode === 200,
            ),
        ).toBe(true);
        expect(
            requests.some(
                (r) =>
                    r.method === RestfulMethod.GET &&
                    r.path === '/api/:version/goodbye/world' &&
                    r.statusCode === 200,
            ),
        ).toBe(true);
        expect(
            requests.some(
                (r) =>
                    r.method === RestfulMethod.GET &&
                    r.path === '/test' &&
                    r.statusCode === 200,
            ),
        ).toBe(true);
    });

    it('List endpoints', () => {
        const routerInfo = getRouterInfo(app);
        if (routerInfo.version === 'v5') {
            console.info(
                'Endpoint listing for nested routers is not yet supported on Express v5',
            );
            return;
        }

        expect(client.startupData?.paths).toEqual([
            {
                method: RestfulMethod.GET,
                path: '/health',
            },
            {
                method: RestfulMethod.GET,
                path: '/api/:version/hello/:name',
            },
            {
                method: RestfulMethod.GET,
                path: '/api/:version/goodbye/world',
            },
            {
                method: RestfulMethod.GET,
                path: '/test',
            },
        ]);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        if (client) {
            await HitAPIClient.shutdown();
        }
    });
});
