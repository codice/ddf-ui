import { ValuesType } from 'utility-types';
import { Omit } from '../../typescript';
import { SpreadOperatorProtectedClass } from '../../typescript/classes';
import { BasicDataTypePropertyName } from './reserved.properties';
export declare const deserialize: {
    /**
     * example inputs:  // ' are part of input
     * 'RELATIVE(PT1S)' // last 1 seconds
     * 'RELATIVE(PT1M)' // last 1 minutes
     * 'RELATIVE(PT1H)' // last 1 hours
     * 'RELATIVE(P1D)' // last 1 days
     * 'RELATIVE(P7D)' // last 1 weeks (notice we get mod of 7 days)
     * 'RELATIVE(P1M)' // last 1 month
     * 'RELATIVE(P1Y)' // last 1 year
     **/
    dateRelative: (val: string) => ValueTypes['relative'];
};
export declare const serialize: {
    dateRelative: ({ last, unit }: ValueTypes['relative']) => string;
    dateAround: (value: ValueTypes['around']) => string;
    dateBetween: (value: ValueTypes['between']) => string;
    location: (property: string, value: ValueTypes['location']) => any;
};
declare class BaseFilterBuilderClass extends SpreadOperatorProtectedClass {
    readonly type: string;
    readonly filters: Array<any>;
    readonly negated: boolean;
    readonly id: string;
    constructor({ type, filters, negated, id, }?: {
        type?: BaseFilterBuilderClass['type'];
        filters?: BaseFilterBuilderClass['filters'];
        negated?: BaseFilterBuilderClass['negated'];
        id?: string;
    });
}
export declare class FilterBuilderClass extends BaseFilterBuilderClass {
    readonly type: 'AND' | 'OR';
    readonly filters: Array<FilterBuilderClass | FilterClass>;
    constructor({ type, filters, negated, id, }?: {
        type?: FilterBuilderClass['type'];
        filters?: FilterBuilderClass['filters'];
        negated?: FilterBuilderClass['negated'];
        id?: string;
    });
}
/**
 *  We want to support more complex negation than allowed by the normal filter tree, so we store negated in a property.
 *  However, since the write function in cql.tsx doesn't know about this, at some point we need to convert it back to this class where negation exists as a type instead of property.
 *  See the uncollapseNots function in cql.tsx for where this is done.
 */
export declare class CQLStandardFilterBuilderClass extends BaseFilterBuilderClass {
    readonly type: 'AND' | 'OR' | 'NOT';
    readonly filters: Array<FilterClass | CQLStandardFilterBuilderClass | FilterBuilderClass>;
    constructor({ type, filters, negated, id, }?: {
        type?: CQLStandardFilterBuilderClass['type'];
        filters?: CQLStandardFilterBuilderClass['filters'];
        negated?: CQLStandardFilterBuilderClass['negated'];
        id?: string;
    });
}
export type BooleanTextType = {
    text: string;
    cql: string;
    error: boolean;
    errorMessage?: string;
};
export type ValueTypes = {
    proximity: {
        first: string;
        second: string;
        distance: number;
    };
    date: string;
    boolean: boolean;
    text: string;
    float: number;
    integer: number;
    relative: {
        last: string;
        unit: 'm' | 'h' | 'd' | 'M' | 'y' | 's' | 'w';
    };
    around: {
        date: string;
        buffer: {
            amount: string;
            unit: 'm' | 'h' | 'd' | 'M' | 'y' | 's' | 'w';
        };
        direction: 'both' | 'before' | 'after';
    };
    during: {
        start: string;
        end: string;
    };
    between: {
        start: number;
        end: number;
    };
    multivalue: string[];
    booleanText: BooleanTextType;
    location: // this is all we technically need to reconstruct (lo fidelity)
    LineLocation | PolygonLocation | PointRadiusLocation;
};
export type LineLocation = {
    type: 'LINE';
    mode: 'line';
    lineWidth?: string;
    line: Array<Array<number>>;
};
export type PolygonLocation = {
    type: 'POLYGON';
    polygonBufferWidth?: number | string;
    polygonBufferUnits?: 'meters';
    polygon: Array<Array<number>>;
    locationType?: 'dd';
    polyType?: 'polygon';
    mode: 'poly';
};
export type PointRadiusLocation = {
    type: 'POINTRADIUS';
    radius: number | string;
    radiusUnits?: 'meters';
    mode: 'circle';
    lat: number;
    lon: number;
    locationType?: 'dd';
};
export declare class FilterClass extends SpreadOperatorProtectedClass {
    type: 'BEFORE' | 'AFTER' | 'RELATIVE' | '=' | 'DURING' | 'GEOMETRY' | 'DWITHIN' | 'ILIKE' | 'LIKE' | 'IS NULL' | '>' | '<' | '=' | '<=' | '>=' | 'DURING' | 'BETWEEN' | 'FILTER FUNCTION proximity' | 'AROUND' | 'BOOLEAN_TEXT_SEARCH';
    readonly property: string;
    readonly value: string | boolean | null | ValuesType<ValueTypes>;
    readonly negated: boolean | undefined;
    readonly id: string;
    constructor({ type, property, value, negated, id, }?: {
        type?: FilterClass['type'];
        property?: FilterClass['property'];
        value?: FilterClass['value'];
        negated?: FilterClass['negated'];
        id?: string;
    });
}
/**
 * determine it is actually an plain object form of the filter builder class
 */
export declare const shouldBeFilterBuilderClass: (filter: any) => filter is FilterBuilderClass;
/**
 *determine it is actually an instantiation of the filter builder class
 */
export declare const isFilterBuilderClass: (filter: FilterBuilderClass | FilterClass | CQLStandardFilterBuilderClass | Partial<FilterBuilderClass> | Partial<FilterClass> | Partial<CQLStandardFilterBuilderClass>) => filter is FilterBuilderClass;
/**
 *determine it is actually an instantiation of the cql standard filter builder class
 */
export declare const isCQLStandardFilterBuilderClass: (filter: FilterBuilderClass | FilterClass | CQLStandardFilterBuilderClass | Partial<FilterBuilderClass> | Partial<FilterClass> | Partial<CQLStandardFilterBuilderClass>) => filter is CQLStandardFilterBuilderClass;
export interface BasicFilterClass extends Omit<FilterClass, 'property'> {
    property: string[];
}
interface BasicDatatypeClass extends Omit<FilterClass, 'property' | 'value'> {
    property: typeof BasicDataTypePropertyName;
    value: string[];
}
export declare class BasicDatatypeFilter extends FilterClass implements BasicDatatypeClass {
    property: typeof BasicDataTypePropertyName;
    value: string[];
    constructor({ value, }?: {
        value?: string[];
    });
}
export declare const isBasicDatatypeClass: (filter: FilterBuilderClass | FilterClass | CQLStandardFilterBuilderClass | Partial<FilterBuilderClass> | Partial<FilterClass> | Partial<CQLStandardFilterBuilderClass>) => filter is BasicDatatypeClass;
export {};
