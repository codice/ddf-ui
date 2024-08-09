import * as React from 'react';
import { TimeZone, TimeFormat } from './types';
import { TimePrecision } from '@blueprintjs/datetime';
type Props = {
    currentTime: string;
    timeZone: string;
    timeFormat: string;
    timeZones: TimeZone[];
    timePrecision: TimePrecision;
    handleTimeZoneUpdate: (timeZone: TimeZone) => any;
    handleTimeFormatUpdate: (timeFormat: TimeFormat) => any;
    handleTimePrecisionUpdate: (timePrecision: TimePrecision) => any;
};
declare class TimeSettingsPresentation extends React.Component<Props, {}> {
    render: () => JSX.Element;
}
declare const _default: typeof TimeSettingsPresentation;
export default _default;
