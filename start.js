var inputLoader = require('./inputLoader');
var loadedInputs = inputLoader.loadInputs();

var worklogPromises = [];

for (let input of loadedInputs) {
    worklogPromises = worklogPromises.concat(input.getWorkLogs());
}

Promise.all(worklogPromises).then(worklogInputResult => {
    console.log(`${worklogInputResult.length} inputs retrieved`);
    for (let worklogs of worklogInputResult) {
        console.log(`${worklogs.length} worklogs retrieved`);
        for (let worklog of worklogs) {
            console.log(`Worklog: ${worklog}`);
        }
    }
}).catch(console.log);

