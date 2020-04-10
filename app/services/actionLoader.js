const logger = require('app/services/loggerFactory').getLogger('services/actionLoader');

const conditionLoader = require('app/services/conditionLoader');

function loadActionsAndConditions(actionConfigs) {
    return actionConfigs.map(config => {
        const action = loadAction(config.action);
        const condition = conditionLoader.loadCondition(config.condition);
        logger.debug('Loaded: On condition', condition.toString(), 'apply action', action.toString());
        return { action, condition };
    });
}

function loadAction(actionConfig) {
    const actionClass = require(`app/actions/${actionConfig.type}`);
    return new actionClass(actionConfig);
}

module.exports.loadActionsAndConditions = loadActionsAndConditions;