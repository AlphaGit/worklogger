const fs = require('fs');
const logger = require('app/services/loggerFactory').getLogger('CredentialStorage');

function retrieveAppCredentials() {
    return new Promise((resolve, reject) => {
        logger.debug('Reading Google App credentials file');
        fs.readFile('worklogger_home/client_secret.json', (err, content) => {
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
