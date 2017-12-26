const loggerFactory = require('services/loggerFactory');
const logger = loggerFactory.getLogger('inputLoader');

const loadInputs = function(appConfiguration) {
    var loadedInputs = [];

    for (let input of appConfiguration.inputs) {
        logger.debug('Loading configuration for', input.type);

        var inputConfigurationClass = require(`inputs/${input.type}/InputConfiguration`);
        var inputConfiguration = new inputConfigurationClass(input);

        var inputSystemClass = require(`inputs/${input.type}/Input`);
        var inputSystem = new inputSystemClass(appConfiguration, inputConfiguration);

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
};

module.exports.loadInputs = loadInputs;
