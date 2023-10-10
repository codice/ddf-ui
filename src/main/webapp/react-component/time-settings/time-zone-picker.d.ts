/// <reference types="react" />
import { TimeZone } from './types';
type Props = {
    timeZone: string;
    timeZones: TimeZone[];
    handleTimeZoneUpdate: (timeZone: TimeZone) => any;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
