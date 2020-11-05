const logger = require('app/services/loggerFactory').getLogger('services/outputLoader');
const conditionLoader = require('app/services/conditionLoader');

function loadOutputs(outputConfigurations, appConfiguration) {
    return outputConfigurations.map(outputConfig => {
        const output = loadOuput(outputConfig, appConfiguration);
        const condition = conditionLoader.loadCondition(outputConfig.condition);
        const excludeFromNonProcessedWarning = !!outputConfig.excludeFromNonProcessedWarning;
        return { output, condition, excludeFromNonProcessedWarning };
    });
}

function loadOuput(outputConfiguration, appConfiguration) {
    const outputType = outputConfiguration.type;
    const formatter = loadFormatter(outputConfiguration.formatter, appConfiguration);

    const Output = require(`app/outputs/${outputType}/Output`);
    return new Output(formatter, outputConfiguration, appConfiguration);
}

function loadFormatter(formatterConfiguration, appConfiguration) {
    formatterConfiguration = (formatterConfiguration || {});
    let formatterType = formatterConfiguration.type;

    let Formatter;
    if (formatterType) {
        logger.debug(`Loading ${formatterType} formatter`);
        Formatter = require(`app/formatters/${formatterType}`);
    } else {
        logger.debug('Loading No-Format formatter');
        Formatter = require('app/formatters/NoFormatFormatter');
    }
    return new Formatter(formatterConfiguration, appConfiguration);
}

module.exports.loadOutputs = loadOutputs;
