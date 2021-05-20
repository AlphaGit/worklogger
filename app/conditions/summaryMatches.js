module.exports = class Summary {
    constructor(conditionConfiguration) {
        this._regex = new RegExp(conditionConfiguration.regex);
    }

    isSatisfiedBy(worklog) {
        return this._regex.test(worklog.name);
    }

    toString() {
        return `SummaryMatches(${this._regex.toString()})`;
    }
};