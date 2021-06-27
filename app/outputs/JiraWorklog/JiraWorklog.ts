export class JiraWorklog {
    constructor (public comment: string, public started: string, public timeSpent: string) {
        if (!comment) throw new Error('Worklog requires comment field.');
        if (!started) throw new Error('Worklog requires started field.');
        if (!timeSpent) throw new Error('Worklog requires timeSpent field.');
    }
}
