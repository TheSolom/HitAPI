import nock from 'nock';

export const CLIENT_ID = '65973e74-3b71-4392-bbfa-d108a8a5d9d8';
export const HITAPI_BASE_URL = 'http://localhost:3000/api/v1/ingest';

export const mockHitAPIHub = () => {
    nock(HITAPI_BASE_URL, { reqheaders: { 'X-Client-ID': CLIENT_ID } })
        .persist()
        .post('/startup')
        .reply(204);

    nock(HITAPI_BASE_URL, { reqheaders: { 'X-Client-ID': CLIENT_ID } })
        .persist()
        .post('/sync')
        .reply(202);
};
