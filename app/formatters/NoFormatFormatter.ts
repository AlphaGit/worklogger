import { FormatterBase } from './FormatterBase';

export class NoFormatFormatter extends FormatterBase {
    public format(worklogSet) {
        return worklogSet;
    }
};
