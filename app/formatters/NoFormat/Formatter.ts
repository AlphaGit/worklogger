import { FormatterBase } from '../FormatterBase';
import { WorklogSet } from '../../models/WorklogSet';

export class NoFormatFormatter extends FormatterBase {
    format(worklogSet: WorklogSet): string {
        return worklogSet.toString();
    }
}

export default NoFormatFormatter;