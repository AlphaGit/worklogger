module.exports = class TextFileOutput {
    constructor(formatter, outputConfiguration) {
        //TODO validate formatter
        //TODO validate configuration
        this._formatter = formatter;
        this._configuration = outputConfiguration;
    }

    outputWorklogSet(worklogSet) {
        const formattedOutput = this._formatter.format(worklogSet);
        //TODO write contents to configured textfile
    }
};