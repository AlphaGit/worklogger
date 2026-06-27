import { OutputBase } from '../OutputBase';
import { WorklogSet } from '../../models/WorklogSet';

import { getLogger, LoggerCategory } from '../../services/Logger';

export class LoggerOutput extends OutputBase {
    private _logger = getLogger(LoggerCategory.Outputs);

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this.formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
}

export default LoggerOutput;