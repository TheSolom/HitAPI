import nock from 'nock';

const getApiUrl = (): string => {
    const baseURL = process.env.API_URL || 'http://localhost:3000/api';
    const version = process.env.API_VERSION || '1';
    return `${baseURL}/v${version}/ingest/`;
};

export const CLIENT_ID = '65973e74-3b71-4392-bbfa-d108a8a5d9d8';
export const HITAPI_BASE_URL = getApiUrl();

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
