import { StartupData } from './model/Startup/startup';
declare function generateAnyGeoFilter(property: any, model: any): any;
declare function sanitizeGeometryCql(cqlString: any): any;
declare function getProperty(filter: any): any;
declare function generateIsEmptyFilter(property: any): {
    type: string;
    property: any;
    value: null;
};
declare function generateFilter(type: any, property: string, value: any, metacardDefinitions?: StartupData['MetacardDefinitions']): any;
declare function generateFilterForFilterFunction(filterFunctionName: any, params: any): {
    type: string;
    value: boolean;
    property: {
        type: string;
        filterFunctionName: any;
        params: any;
    };
};
declare function isGeoFilter(type: any): boolean;
declare function isPointRadiusFilter(filter: any): any;
declare function buildIntersectCQL(this: any, locationGeometry: any): string | undefined;
declare function arrayFromPolygonWkt(wkt: any): any;
declare const _default: {
    sanitizeGeometryCql: typeof sanitizeGeometryCql;
    getProperty: typeof getProperty;
    generateIsEmptyFilter: typeof generateIsEmptyFilter;
    generateAnyGeoFilter: typeof generateAnyGeoFilter;
    generateFilter: typeof generateFilter;
    generateFilterForFilterFunction: typeof generateFilterForFilterFunction;
    isGeoFilter: typeof isGeoFilter;
    isPolygonFilter: (filter: any) => any;
    isLineFilter: (filter: any) => any;
    isPointRadiusFilter: typeof isPointRadiusFilter;
    buildIntersectCQL: typeof buildIntersectCQL;
    arrayFromPolygonWkt: typeof arrayFromPolygonWkt;
    arrayFromLinestringWkt: (wkt: string) => [number, number][];
    arrayFromMultilinestringWkt: (wkt: string) => [number, number][][];
    arrayFromPointWkt: (wkt: string) => [number, number][];
};
export default _default;
