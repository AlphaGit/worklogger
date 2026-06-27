import { start } from './start';

(async() => {
    const passedArguments = process.argv.slice(2);

    await start(passedArguments);
})();