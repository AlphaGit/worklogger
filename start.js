var inputLoader = require('./inputLoader');
var loadedInputs = inputLoader.loadInputs();

var worklogs = [];

for (input of loadedInputs) {
    worklogs = worklogs.concat(input.getWorkLogs());
}

console.log(`${worklogs.length} worklogs retrieved`);
for (worklog of worklogs) {
    console.log(`Worklog: ${worklog}`);
}
