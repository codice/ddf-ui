/**
 * Converts wkt to the user's preferred coordinate format.
 * Falls back to the wkt if the conversion fails.
 */
export declare const convertWktToPreferredCoordFormat: (wkt: string) => string;
/**
 * Converts coordinates from lat lon to a single string in
 * the user's preferred format
 */
export declare const convertCoordsToPreferred: (lat: number, lon: number) => string;
