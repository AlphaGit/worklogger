const OutputBase = require('outputs/OutputBase');

module.exports = class HarvestAppOutput extends OutputBase {
    outputWorklogSet() {
        /* TODO
        - Create a builder class, wrapper around HTTP Requests, use it from here
        - Set default headers:
            - Authorization: Bearer {this._configuration.token}
            - Harvest-Account-ID: {this._configuration.accountId}
            - Content-Type: application/json
            - User-Agent: Worklogger (user email... from configuration maybe?)
        - GET https://api.harvestapp.com/api/v2/users/me/project_assignments
            - Cache project_assignments.project.id and project_assignments.project.name
                - This is the list of projects names and their IDs
            - Cache project_assignments.task_assignments.task.id and project_assignments.task_assignments.task.name
                - This is the list of tasks for a particular project and their IDs
        - For each worklog
            - Obtain the project name from the tag HarvestProject
            - Find it in the cache by the name
            - Obtain the task for that project from the tag HarvestTask
            - Find it in the cache by the name
            - If something doesn't match, error out, skip worklog
            - POST https://api.harvestapp.com/api/v2/time_entries
            - JSON body:

                {
                    "project_id": project id found for worklog,
                    "task_id": task id found for worklog,
                    "spent_date": "2017-10-08" (yyyy-mm-dd of worklog start time),
                    "timer_started_at": "2017-10-08T07:00-0400" (ISO of worklog start time),
                    "hours": 1.5 (worklog duration in hours),
                    "notes": "Task description" (worklog summary)
                }
        */
    }
};