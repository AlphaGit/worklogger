const requiredFetch = require('node-fetch');

module.exports = class HarvestClient {
    constructor(configuration, { fetch = requiredFetch } = {}) {
        if (!configuration)
            throw new Error('Missing parameter: configuration.');

        if (!configuration.accountId)
            throw new Error('Required configuration: accountId.');

        if (!configuration.token)
            throw new Error('Required configuration: token.');

        if (!configuration.contactInformation)
            throw new Error('Required configuration: contactInformation.');

        this._configuration = configuration;
        this._fetch = fetch;
    }

    getProjectsAndTasks() {
        return this._fetch('https://api.harvestapp.com/api/v2/users/me/project_assignments.json', {
            headers: {
                'Authorization': `Bearer ${this._configuration.token}`,
                'Harvest-Account-Id': `${this._configuration.accountId}`,
                'User-Agent': `Worklogger (${this._configuration.contactInformation})`
            }
        }).then(response => response.json())
        .then(this._getProjectsAndTasksFromApiResponse);
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
};