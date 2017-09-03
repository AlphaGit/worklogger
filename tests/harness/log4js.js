const log4js = require('log4js');

function setLevel(level) {
    log4js.configure({
        appenders: {
            outAppender: {
                type: 'stdout'
            }
        },
        categories: {
            default: {
                appenders: ['outAppender'],
                level
            }
        }
    });
}

module.exports = {
    setLevel
};
