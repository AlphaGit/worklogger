import { jest } from '@jest/globals';

global.jest = jest;

import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

process.on('warning', e => console.warn(e.stack));