const logger = require('app/services/loggerFactory').getLogger('services/outputLoader');
const conditionLoader = require('app/services/conditionLoader');

function loadOutputs(outputConfigurations) {
    return outputConfigurations.map(outputConfig => {
        const output = loadOuput(outputConfig);
        const condition = conditionLoader.loadCondition(outputConfig.condition);
        return { output, condition };
    });
}

function loadOuput(outputConfiguration) {
    const outputType = outputConfiguration.type;
    const formatter = loadFormatter(outputType, outputConfiguration.formatter);

    const Output = require(`app/outputs/${outputType}/Output`);
    return new Output(formatter, outputConfiguration);
}

function loadFormatter(outputType, formatterConfiguration) {
    formatterConfiguration = (formatterConfiguration || {});
    let formatterType = formatterConfiguration.type;

    let Formatter;
    if (formatterType) {
        logger.debug(`Loading ${outputType} output with ${formatterType} formatter`);
        Formatter = require(`app/formatters/${outputType}/${formatterType}`);
    } else {
        logger.debug(`Loading ${outputType} output without formatter`);
        Formatter = require('app/formatters/NoFormatFormatter');
    }
    return new Formatter(formatterConfiguration);
}

module.exports.loadOutputs = loadOutputs;
