import { start } from './start';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { storeGoogleTokenFromCode, generateAuthUrl } from './app/services/authHandler';

export const logTimesheets = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { s3, c } = event as unknown as { s3: string, c: string };
    const parameters = { s3, c };

    await start(parameters);

    return {
        statusCode: 200,
        body: 'Timesheets logged.'
    };
};

export const storeToken = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { code, error } = event.queryStringParameters ?? {};

    if (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error
            })
        };
    }

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing code or error.'
            })
        };
    }

    await storeGoogleTokenFromCode(code);

    return {
        statusCode: 200,
        body: 'Token stored. You can close this window.'
    };
};

export const loginRedirect = async (): Promise<APIGatewayProxyResult> => {
    const authUrl = await generateAuthUrl();
    return {
        statusCode: 302,
        headers: {
            Location: authUrl
        },
        body: 'Redirecting...'
    };
};
