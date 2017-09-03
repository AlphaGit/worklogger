const logger = require('services/logger');

const loadInputs = function(appConfiguration) {
    var configuration = require('./configuration.json');

    var loadedInputs = [];

    for (let input of configuration.inputs) {
        logger.debug('Loading configuration for', input.type);

        var inputConfigurationClass = require(`./inputs/${input.type}/${input.type}Configuration`);
        var inputConfiguration = new inputConfigurationClass(input);

        var inputSystemClass = require(`./inputs/${input.type}/${input.type}`);
        var inputSystem = new inputSystemClass(appConfiguration, inputConfiguration);

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
};

module.exports.loadInputs = loadInputs;
