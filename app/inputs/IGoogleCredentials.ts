export type IGoogleInstalledCredentials = {
    client_secret: string;
    client_id: string;
    redirect_uris: string[];
}

export type IGoogleCredentials = {
    installed: IGoogleInstalledCredentials;
};