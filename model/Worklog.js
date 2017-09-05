class Worklog {
    constructor(name, startDateTime, endDateTime,
        duration = (endDateTime - startDateTime) / (60 * 1000) // duration in minutes
    ) {
        if (!name) throw new Error('Missing name parameter');
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!endDateTime) throw new Error('Missing endDateTime parameter');

        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.duration = duration;
    }

    toString() {
        return `${this.name} (${this.duration} minutes)`;
    }
}

module.exports = Worklog;
