const logger = require('app/services/loggerFactory').getLogger('services/outputLoader');

function loadOutputs(outputConfigurations) {
    const conditionLoader = require('app/services/conditionLoader');

    outputs = [];
    for (let outputConfig of outputConfigurations) {
        const output = loadOuput(outputConfig);
        const condition = conditionLoader.loadCondition(outputConfig.condition);
        outputs.push({ output, condition });
    }
    return outputs;
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
        logger.info(`Loading ${outputType} output with ${formatterType} formatter`);
        Formatter = require(`app/formatters/${outputType}/${formatterType}`);
    } else {
        logger.info(`Loading ${outputType} output without formatter`);
        Formatter = require('app/formatters/NoFormatFormatter');
    }
    return new Formatter(formatterConfiguration);
}

module.exports.loadOutputs = loadOutputs;
