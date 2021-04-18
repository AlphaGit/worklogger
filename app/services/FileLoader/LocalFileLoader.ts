import { resolve } from 'path';
import { LoggerFactory } from '../LoggerFactory';
import { IFileLoader } from './IFileLoader';

const logger = LoggerFactory.getLogger('services/FileLoader/LocalFileLoader');

export class LocalFileLoader implements IFileLoader {
    public async loadJson(filePath: string): Promise<Record<string, unknown>> {
        const fullPath = resolve(filePath);
        logger.info('Loading local file:', fullPath);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const contents = require(filePath);
        return Promise.resolve(contents);
    }
}
