const requiredFetch = require('node-fetch');
const logger = require('app/services/loggerFactory').getLogger('services/HarvestClient');

module.exports = class HarvestClient {
    constructor(configuration, { fetch = requiredFetch } = {}) {
        this._validateConfiguration(configuration);

        this._configuration = configuration;
        this._fetch = fetch;
    }

    _validateConfiguration(configuration) {
        if (!configuration) throw new Error('Missing parameter: configuration.');
        if (!configuration.accountId) throw new Error('Required configuration: accountId.');
        if (!configuration.token) throw new Error('Required configuration: token.');
        if (!configuration.contactInformation) throw new Error('Required configuration: contactInformation.');
    }

    async getProjectsAndTasks() {
        logger.info('Retrieving known projects and tasks from Harvest');
        const response = await this._fetch('https://api.harvestapp.com/api/v2/users/me/project_assignments.json', {
            headers: this._getDefaultHeaders()
        });

        const jsonResponse = await response.json();
        const projects = this._getProjectsAndTasksFromApiResponse(jsonResponse);
        logger.trace('Projects and tasks retrieved from Harvest', projects);

        return projects;
    }

    async saveNewTimeEntry(timeEntry) {
        this._validateTimeEntry(timeEntry);

        logger.trace('Sending to Harvest:', timeEntry);
        const res = await this._fetch('https://api.harvestapp.com/api/v2/time_entries', {
            method: 'POST',
            body: JSON.stringify(timeEntry),
            headers: this._getDefaultHeaders()
        })

        logger.trace(res.json());
    }

    _validateTimeEntry(timeEntry) {
        if (!timeEntry) throw new Error('Required parameter: timeEntry.');
        if (!timeEntry.project_id) throw new Error('Time entry needs to have project_id.');
        if (!timeEntry.task_id) throw new Error('Time entry needs to have task_id.');
        if (!timeEntry.spent_date) throw new Error('Time entry needs to have spent_date.');
        if (!timeEntry.timer_started_at) throw new Error('Time entry needs to have timer_started_at.');
        if (!timeEntry.hours) throw new Error('Time entry needs to have hours.');
    }

    _getProjectsAndTasksFromApiResponse(apiResponse) {
        return apiResponse.project_assignments.map(pa => ({
            projectId: pa.project.id,
            projectName: pa.project.name,
            tasks: pa.task_assignments.map(ta => ({
                taskId: ta.task.id,
                taskName: ta.task.name
            }))
        }));
    }

    _getDefaultHeaders() {
        return {
            'Authorization': `Bearer ${this._configuration.token}`,
            'Harvest-Account-Id': `${this._configuration.accountId}`,
            'User-Agent': `Worklogger (${this._configuration.contactInformation})`,
            'Content-Type': 'application/json'
        };
    }
};
