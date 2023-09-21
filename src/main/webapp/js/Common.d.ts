import './requestAnimationFramePolyfill';
import { TimePrecision } from '@blueprintjs/datetime';
export declare const Common: {
    undefined: string;
    coreTransitionTime: number;
    cqlToHumanReadable(cql?: string): string | undefined;
    getFileSize(item?: string): string;
    getHumanReadableDateTime(date: string): string;
    getDateTimeFormats(): {
        [key: string]: {
            millisecond: {
                datetimefmt: string;
                timefmt: string;
            };
            minute: {
                datetimefmt: string;
                timefmt: string;
            };
            second: {
                datetimefmt: string;
                timefmt: string;
            };
        };
    };
    getDateTimeFormatsReverseMap(): {
        [key: string]: {
            format: string;
            precision: TimePrecision;
        };
    };
    getTimeFormatsReverseMap(): {
        [key: string]: {
            format: string;
            precision: TimePrecision;
        };
    };
    getTimeZones(): {
        UTC: string;
        '-12': string;
        '-11': string;
        '-10': string;
        '-9': string;
        '-8': string;
        '-7': string;
        '-6': string;
        '-5': string;
        '-4': string;
        '-3': string;
        '-2': string;
        '-1': string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
        11: string;
        12: string;
    };
    getRelativeDate(date: string): string;
    getImageSrc(img: string): string;
    getResourceUrlFromThumbUrl(url: string): string;
    cancelRepaintForTimeframe(requestDetails: any): void;
    repaintForTimeframe(time: any, callback: any): any;
    escapeHTML(value: string): string;
    wrapMapCoordinates(x: number, [min, max]: [number, number]): number;
    wrapMapCoordinatesArray(coordinates: Array<[number, number]>): number[][];
};
export default Common;
