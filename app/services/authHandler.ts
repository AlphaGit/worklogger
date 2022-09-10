import { google } from 'googleapis';
import { S3FileLoader } from './FileLoader/S3FileLoader';
import { BUCKET_OR_FOLDER_NAME, GOOGLE_APPLICATION_CREDENTIALS_FILE_NAME, GOOGLE_USER_CREDENTIALS_FILE_NAME } from '../config/authConfiguration';
import { OAuth2Client } from 'google-auth-library';

async function getAppAuthenticatedOAuthClient(): Promise<OAuth2Client> {
    const s3FileLoader = new S3FileLoader(BUCKET_OR_FOLDER_NAME);
    const authFileJson = await s3FileLoader.loadJson(GOOGLE_APPLICATION_CREDENTIALS_FILE_NAME);
    const { client_id, client_secret, redirect_uris } = authFileJson.web as { client_id: string, client_secret: string, redirect_uris: string[] };
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    return oauth2Client;
}

export async function getUserAuthenticatedOAuthClient(): Promise<OAuth2Client> {
    const oauth2Client = await getAppAuthenticatedOAuthClient();
    const s3FileLoader = new S3FileLoader(BUCKET_OR_FOLDER_NAME);
    const userCredentialsFileJson = await s3FileLoader.loadJson(GOOGLE_USER_CREDENTIALS_FILE_NAME);
    oauth2Client.setCredentials(userCredentialsFileJson);
    return oauth2Client;
}

export async function storeGoogleTokenFromCode(oauthCode: string) {
    const oauth2Client = await getAppAuthenticatedOAuthClient();
    const { tokens } = await oauth2Client.getToken(oauthCode);

    const s3FileLoader = new S3FileLoader(BUCKET_OR_FOLDER_NAME);
    await s3FileLoader.saveFile(GOOGLE_USER_CREDENTIALS_FILE_NAME, JSON.stringify(tokens));
}

export async function generateAuthUrl(): Promise<string> {
    const oauth2Client = await getAppAuthenticatedOAuthClient();

    const scopes = [
        "https://www.googleapis.com/auth/calendar.events.readonly"
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
    });
    return authorizationUrl;
}