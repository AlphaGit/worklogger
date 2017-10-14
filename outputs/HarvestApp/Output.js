const OutputBase = require('outputs/OutputBase');
const RequiredHarvestClient = require('./HarvestClient');

module.exports = class HarvestAppOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { HarvestClient = RequiredHarvestClient }) {
        super(formatter, outputConfiguration);

        this._harvesctClient = new HarvestClient(outputConfiguration);
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        return this._harvesctClient.getProjectsAndTasks();
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