module.exports = class HasTagCondition {
    constructor(conditionConfiguration) {
        this._configuration = conditionConfiguration;
    }

    isSatisfiedBy(worklog) {
        return worklog.getTagValue(this._configuration.tagName);
    }
};