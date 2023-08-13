import { FormatterBase } from '../FormatterBase';
import { WorklogSet } from '../../models/WorklogSet';

export class NoFormatFormatter extends FormatterBase {
    async format(worklogSet: WorklogSet): Promise<string> {
        return worklogSet.toString();
    }
}

export default NoFormatFormatter;