'use strict';

const { start } = require('./start');

module.exports.logTimesheets = async event => {
    const { s3, c } = event;
    const parameters = { s3, c };

    await start(parameters);

    return {
        statusCode: 200,
        body: 'Timesheets logged.'
    }
};