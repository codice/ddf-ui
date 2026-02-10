import { TimeZone } from './types';
type Props = {
    timeZone: string;
    timeZones: TimeZone[];
    handleTimeZoneUpdate: (timeZone: TimeZone) => any;
};
declare const TimeZoneSelector: (props: Props) => import("react/jsx-runtime").JSX.Element;
export default TimeZoneSelector;
