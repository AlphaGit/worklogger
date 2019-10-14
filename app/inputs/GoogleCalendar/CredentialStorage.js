const fs = require('fs');
const logger = require('app/services/loggerFactory').getLogger('CredentialStorage');
const util = require('util');
const readFile = (fileName, encoding) => util.promisify(fs.readFile)(fileName, encoding);

async function retrieveAppCredentials() {
    logger.debug('Reading Google App credentials file');
    try {
        const content = await readFile('worklogger_home/client_secret.json', 'utf8');
        logger.trace('Google App credentials file contents:', content);
        return JSON.parse(content);
    } catch (err) {
        logger.warn('Credential file could not be read:', err);
        throw new Error(`Error loading client secret file: ${err}`);
    }
}

module.exports = {
    retrieveAppCredentials,
};
