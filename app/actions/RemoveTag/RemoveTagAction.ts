import { getLogger, LoggerCategory } from '../../services/Logger';
import { Worklog } from '../../models/Worklog';
import { RemoveTagConfiguration } from './RemoveTagConfiguration';
import { IAction } from '../IAction';

export class RemoveTagAction implements IAction {
    private _tagName: string;
    private _logger = getLogger(LoggerCategory.Actions);

    constructor(configuration: RemoveTagConfiguration) {
        if (!configuration.tagName)
            throw new Error('Configuration must include a tagName.');

        this._tagName = configuration.tagName;
    }

    apply(worklog: Worklog): void {
        if (!(worklog instanceof Worklog))
            throw new Error('Apply: a Worklog is required.');

        worklog.removeTag(this._tagName);
        this._logger.trace(`Removed tag ${this._tagName} from worklog.`);
    }

    toString(): string {
        return `RemoveTag: ${this._tagName}`;
    }
}
