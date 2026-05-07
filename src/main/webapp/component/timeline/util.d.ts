import { Moment } from 'moment-timezone';
import { TimelineItem } from './timeline';
/** Python's "range" function */
export declare const range: (n: number) => number[];
export declare const createTestData: (n: number) => TimelineItem[];
export declare const formatDate: (value: Moment, format: string) => string;
export declare const convertToDisplayable: (value: Moment, timezone: string, format: string) => string;
export declare const dateWithinRange: (date: Moment, range: Moment[]) => boolean;
export declare const multiFormat: (date: Date) => string;
