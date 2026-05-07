import moment from 'moment-timezone';
export type TimeZone = {
    timestamp: number;
    zone: moment.MomentZone | null;
    zonedDate: moment.Moment;
    offsetAsString: string;
    abbr: string;
    zoneName: string;
};
export type TimeFormat = {
    label: string;
    value: string;
};
