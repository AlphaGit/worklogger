import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

process.on('warning', e => console.warn(e.stack));