const fs = require('fs');
const logger = require('services/logger');

function retrieveAppCredentials() {
    return new Promise((resolve, reject) => {
        logger.debug('Reading Google App credentials file');
        fs.readFile('_private/client_secret.json', (err, content) => {
            if (err) {
                logger.warn('Credential file could not be read:', err);
                reject(`Error loading client secret file: ${err}`);
                return;
            }

            logger.trace('Google App credentials file contents:', content.toString());
            resolve(JSON.parse(content));
        });
    });
}

module.exports = {
    retrieveAppCredentials: retrieveAppCredentials,
};
