const logger = require('services/logger');

function loadOuput(outputConfiguration) {
    const outputType = outputConfiguration.type;
    const formatterConfiguration = (outputConfiguration.formatter || {});
    let formatterType = formatterConfiguration.type;
    
    let Formatter;
    if (formatterType) {
        logger.info(`Loading ${outputType} output with ${formatterType} formatter`);
        Formatter = require(`formatters/${outputType}/${formatterType}`);
    } else {
        logger.info(`Loading ${outputType} output without formatter`);
        Formatter = require('formatters/NoFormatFormatter');
    }
    const Output = require(`outputs/${outputType}/Output`);

    // formatter configuration
    const formatter = new Formatter(formatterConfiguration);
    const output = new Output(formatter, outputConfiguration);
    return output;
}

module.exports.load = loadOuput;