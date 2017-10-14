const OutputBase = require('outputs/OutputBase');

module.exports = class HarvestAppOutput extends OutputBase {
    outputWorklogSet() {
        /* TODO
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