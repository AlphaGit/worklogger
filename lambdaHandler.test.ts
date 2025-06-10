import { afterEach, describe, expect, test, jest } from '@jest/globals';

const mockedStoreGoogleTokenFromCode = jest.fn();
jest.mock('./app/services/authHandler', () => ({
    storeGoogleTokenFromCode: mockedStoreGoogleTokenFromCode,
    generateAuthUrl: jest.fn()
}));

import { storeToken } from './lambdaHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';

function createEvent(params?: Record<string, string | undefined>): APIGatewayProxyEvent {
    return {
        queryStringParameters: params,
    } as unknown as APIGatewayProxyEvent;
}

describe('storeToken', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns 400 when no code or error provided', async () => {
        const response = await storeToken(createEvent());
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('Missing code or error.');
    });

    test('returns 400 when error is provided', async () => {
        const response = await storeToken(createEvent({ error: 'denied' }));
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('denied');
    });

    test('stores token when code is provided', async () => {
        const response = await storeToken(createEvent({ code: 'abc' }));
        expect(response.statusCode).toBe(200);
        expect(mockedStoreGoogleTokenFromCode).toHaveBeenCalledWith('abc');
    });
});
