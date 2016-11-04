class Worklog {
    constructor(name, startDateTime, endDateTime, client, project) {
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.client = client;
        this.project = project;
    }

    toString() {
        return `[${this.client}/${this.project}] ${this.name} (${this.startDateTime} - ${this.endDateTime})`;
    }
}

module.exports = Worklog;
