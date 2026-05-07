import { Attribute, Coordinates, Format } from '.';
export declare const formatAttribute: ({ name, value }: Attribute) => string | null;
export declare const formatCoordinates: ({ coordinates, format, }: {
    coordinates: Coordinates;
    format: Format;
}) => any;
