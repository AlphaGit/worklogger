import * as moment from "moment-timezone";
import { Worklog, WorklogSet } from "../../models";
import { getLogger, LoggerCategory } from "../../services/Logger";
import { FormatterBase } from "../FormatterBase";

const logger = getLogger(LoggerCategory.Formatters);

export class TableListFormatter extends FormatterBase {
    async format(worklogSet: WorklogSet): Promise<string> {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const uniqueTagList = this._getUniqueTagList(worklogSet);
        const outputLines = this._generateOutputLines(worklogSet, uniqueTagList);
        const output = outputLines.join('\n');

        logger.debug('TableListFormatter output:', output);
        return output;
    }

    _getUniqueTagList(worklogSet: WorklogSet): string[] {
        const uniqueTagList = worklogSet.worklogs
            .map(w => w.getTagKeys())
            .reduce((a, b) => a.concat(b), [])
            .filter((value, index, self) => self.indexOf(value) === index);
        logger.debug('Unique tag list:', uniqueTagList);
        return uniqueTagList;
    }

    _generateOutputLines(worklogSet: WorklogSet, uniqueTagList: string[]): string[] {
        const headerLine = this._generateHeaderLineAndSeparator(uniqueTagList);
        const worklogLines = this._generateWorklogLines(worklogSet, uniqueTagList);
        const notes = this._getFootnotes();

        return [headerLine, ...worklogLines, ...notes];
    }

    _getFootnotes(): string[] {
        const timeZone = this._appConfiguration.options.timeZone;
        const timeZoneName = moment.tz(timeZone).zoneAbbr();
        const timeZoneNote = `All times are in ${timeZoneName} time.`;

        return ['', '', timeZoneNote];
    }

    _generateHeaderLineAndSeparator(uniqueTagList: string[]): string {
        const tagTitles = uniqueTagList.map(tag => `Tag: ${tag}`);
        const titles = ['Date', 'Start Time', 'End Time', 'Duration', 'Title', ...tagTitles];

        const headerLine = titles.join(' | ');

        const separatorLine = titles
            .map(() => '---')
            .join(' | ');

        return `${headerLine}\n${separatorLine}`;
    }

    _generateWorklogLines(worklogSet: WorklogSet, uniqueTagList: string[]): string[] {
        return worklogSet.worklogs
            .map(w => this._generateWorklogLine(w, uniqueTagList))
            .filter(l => l);
    }

    _generateWorklogLine(worklog: Worklog, uniqueTagList: string[]): string {
        const timeZone = this._appConfiguration.options.timeZone;
        const timeFormatString = 'HH:mm';
        const startDate = moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DD');
        const startDateTime = moment.tz(worklog.startDateTime, timeZone).format(timeFormatString);
        const endDateTime = moment.tz(worklog.endDateTime, timeZone).format(timeFormatString);
        const duration = worklog.getShortDuration();
        const title = worklog.name;
        const tags = uniqueTagList.map(tag => worklog.getTagValue(tag) || '');

        const line = [startDate, startDateTime, endDateTime, duration, title, ...tags].join(' | ');
        return line;
    }
}

export default TableListFormatter;