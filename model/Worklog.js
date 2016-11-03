class Worklog {
    constructor(name, startDateTime, endDateTime) {
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    toString() {
        return `${this.name} (${this.startDateTime} - ${this.endDateTime})`;
    }
}

module.exports = Worklog;
