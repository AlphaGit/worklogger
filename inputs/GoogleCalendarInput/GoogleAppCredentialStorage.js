var fs = require('fs');

function retrieveAppCredentials() {
    return new Promise((resolve, reject) => {
        fs.readFile('_private/client_secret.json', (err, content) => {
            if (err) {
                reject(`Error loading client secret file: ${err}`);
                return;
            }

            resolve(JSON.parse(content));
        });
    });
}

module.exports = {
    retrieveAppCredentials: retrieveAppCredentials,
};
