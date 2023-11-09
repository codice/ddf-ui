/// <reference types="react" />
import { Attribute, Coordinates, Format } from '.';
type Props = {
    format: Format;
    attributes: Attribute[];
    coordinates: Coordinates;
    measurementState: String;
    currentDistance: number;
};
declare const _default: (props: Props) => JSX.Element | null;
export default _default;
