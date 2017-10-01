const logger = require('services/logger');

function loadOuput(outputConfiguration) {
    logger.info(`Loading ${outputConfiguration.type} output with ${outputConfiguration.formatter.type} formatter`);

    const Output = require(`./outputs/${outputConfiguration.type}/Output`);
    const Formatter = require(`./formatters/${outputConfiguration.type}/${outputConfiguration.formatter.type}`);

    // formatter configuration
    const formatter = new Formatter(outputConfiguration.formatter);
    const output = new Output(formatter, outputConfiguration);
    return output;
}

module.exports.load = loadOuput;