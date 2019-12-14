const path = require('path');
const logger = require('app/services/loggerFactory').getLogger('services/FileLoader/LocalFileLoader');

class LocalFileLoader {
    loadJson(filePath) {
        const fullPath = path.resolve(filePath);
        logger.info('Loading local file:', fullPath);
        return require(filePath);
    }
}

module.exports.LocalFileLoader = LocalFileLoader;