class Worklog {
    constructor(name, startDateTime, endDateTime,
        duration = (endDateTime - startDateTime) / (60 * 1000), // duration in minutes
        client, project) {
        if (!name) throw new Error('Missing name parameter');
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
        if (!client) throw new Error('Missing client parameter');
        if (!project) throw new Error('Missing project parameter');

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
