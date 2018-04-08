const logger = require('app/services/loggerFactory').getLogger('services/actionLoader');

const conditionLoader = require('app/services/conditionLoader');

function loadActionsAndConditions(actionConfigs) {
    return actionConfigs.map(config => {
        const action = loadAction(config.action);
        const condition = conditionLoader.loadCondition(config.condition);
        return { action, condition };
    });
}

function loadAction(actionConfig) {
    logger.debug('Loading action:', actionConfig.type);
    const actionClass = require(`app/actions/${actionConfig.type}`);
    return new actionClass(actionConfig);
}

module.exports.loadActionsAndConditions = loadActionsAndConditions;