declare const Direction: Readonly<{
    North: "N";
    South: "S";
    East: "E";
    West: "W";
}>;
declare function parseDmsCoordinate(coordinate: any): any;
declare function dmsCoordinateToDD(coordinate: any): number | null;
declare function dmsToWkt(dms: any): string | null | undefined;
declare function validateDmsPoint(point: any): boolean;
declare function validateDms(dms: any): {
    valid: boolean;
    error: string | null;
};
declare function buildDmsString(components: any): any;
declare function ddToDmsCoordinateLat(dd: any, secondsPrecision?: number): {
    coordinate: any;
    direction: any;
} | undefined;
declare function ddToDmsCoordinateLon(dd: any, secondsPrecision?: number): {
    coordinate: any;
    direction: any;
} | undefined;
declare function getSecondsPrecision(dmsCoordinate: any): number | undefined;
export { dmsToWkt, validateDms, validateDmsPoint, dmsCoordinateToDD, parseDmsCoordinate, ddToDmsCoordinateLat, ddToDmsCoordinateLon, getSecondsPrecision, buildDmsString, Direction, };
