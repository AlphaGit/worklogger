module.exports = class HasTagCondition {
    constructor(conditionConfiguration) {
        this._configuration = conditionConfiguration;
    }

    isSatisfiedBy(worklog) {
        const checkTagValue = !!this._configuration.tagValue;
        const worklogTagValue = worklog.getTagValue(this._configuration.tagName);

        return checkTagValue
            ? worklogTagValue == this._configuration.tagValue
            : worklogTagValue;
    }
};