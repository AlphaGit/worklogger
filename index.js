(async() => {
    const passedArguments = process.argv.slice(2);
    
    const { start } = require('./start');

    await start(passedArguments);
})();