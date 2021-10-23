import { start } from './start';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const logTimesheets = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { s3, c } = event as unknown as { s3: string, c: string };
    const parameters = { s3, c };

    await start(parameters);

    return {
        statusCode: 200,
        body: 'Timesheets logged.'
    }
};
