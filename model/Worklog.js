class Worklog {
    constructor(name, startDateTime, endDateTime, duration, client, project) {
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.duration = duration;
        this.client = client;
        this.project = project;
    }

    toString() {
        return `[${this.client}/${this.project}] ${this.name} (${this.duration} minutes)`;
    }
}

module.exports = Worklog;
