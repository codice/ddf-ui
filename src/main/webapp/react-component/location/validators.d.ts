type Direction = 'N' | 'S' | 'E' | 'W';
type Point = {
    latDirection: Direction;
    lonDirection: Direction;
    lat: string;
    lon: string;
};
type DmsCoordinate = {
    degrees: string;
    minutes: string;
    seconds: string;
    direction: Direction;
};
type UtmUpsPoint = {
    easting: number;
    northing: number;
    zoneNumber: number;
    hemisphere: 'NORTHERN' | 'SOUTHERN';
};
export type ValidationResult = {
    error: boolean;
    message?: string;
    defaultValue?: any;
};
declare function isUPS(input: string): boolean;
declare function parseDmsCoordinate(coordinate: string): DmsCoordinate | undefined;
declare function validateDmsLineOrPoly(dms: Point[], type: 'line' | 'polygon'): {
    error: boolean;
    message: string | null;
    defaultValue: undefined;
};
declare function validateUsngLineOrPoly(usng: string[], type: 'line' | 'polygon'): {
    error: boolean;
    message: string | null;
    defaultValue: undefined;
};
declare function validateUtmUpsLineOrPoly(utmups: UtmUpsPoint[], type: 'line' | 'polygon'): {
    error: boolean;
    message: string | null;
    defaultValue: undefined;
};
export { validateUsngLineOrPoly, validateDmsLineOrPoly, parseDmsCoordinate, validateUtmUpsLineOrPoly, isUPS, };
