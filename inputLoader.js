const loadInputs = function() {
    var configuration = require('./configuration.json');

    var loadedInputs = [];

    for (let input of configuration.inputs) {
        var inputConfigurationClass = require(`./inputs/${input.type}/${input.type}Configuration`);
        var inputConfiguration = new inputConfigurationClass(input);

        var inputSystemClass = require(`./inputs/${input.type}/${input.type}`);
        var inputSystem = new inputSystemClass();
        inputSystem.configuration = inputConfiguration;

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
};

module.exports.loadInputs = loadInputs;
