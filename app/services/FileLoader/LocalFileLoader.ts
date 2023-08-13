import { getLogger, LoggerCategory } from '../Logger';
import { resolve } from 'path';
import { IFileLoader } from './IFileLoader';

const logger = getLogger(LoggerCategory.Services);

export class LocalFileLoader implements IFileLoader {
    public async loadJson(filePath: string): Promise<Record<string, unknown>> {
        const fullPath = resolve(filePath);
        logger.info('Loading local file:', fullPath);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const contents = require(fullPath);
        return contents;
    }
}
