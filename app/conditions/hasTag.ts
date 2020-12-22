export class HasTagCondition {
    private configuration: any;

    constructor(conditionConfiguration) {
        this.configuration = conditionConfiguration;
    }

    public isSatisfiedBy(worklog) {
        const checkTagValue = !!this.configuration.tagValue;
        const worklogTagValue = worklog.getTagValue(this.configuration.tagName);

        return checkTagValue
            ? worklogTagValue === this.configuration.tagValue
            : worklogTagValue;
    }

    public toString() {
        const tagValue = !this.configuration.tagValue
            ? ''
            : `: ${this.configuration.tagValue}`;
        return `HasTag(${this.configuration.tagName}${tagValue})`;
    }
};
