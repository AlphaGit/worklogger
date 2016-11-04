var inputLoader = require('./inputLoader');
var loadedInputs = inputLoader.loadInputs();

var worklogPromises = [];

for (input of loadedInputs) {
    worklogPromises = worklogPromises.concat(input.getWorkLogs());
}

Promise.all(worklogPromises).then(worklogInputResult => {
    console.log(`${worklogInputResult.length} inputs retrieved`);
    for (worklogs of worklogInputResult) {
        console.log(`${worklogs.length} worklogs retrieved`);
        for (worklog of worklogs) {
            console.log(`Worklog: ${worklog}`);
        }
    }
}).catch(console.log);

