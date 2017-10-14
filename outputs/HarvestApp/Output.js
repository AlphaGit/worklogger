const OutputBase = require('outputs/OutputBase');

module.exports = class HarvestAppOutput extends OutputBase {
    outputWorklogSet(worklogSet) {
        /* TODO
        - For each worklog
            - Obtain the project name from the tag HarvestProject
            - Find it in the cache by the name
            - Obtain the task for that project from the tag HarvestTask
            - Find it in the cache by the name
            - If something doesn't match, error out, skip worklog
        */
    }
};