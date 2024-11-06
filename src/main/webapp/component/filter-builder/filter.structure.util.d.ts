import { FilterClass, ValueType } from './filter.structure';
export declare const isRelativeValue: (value: ValueType) => value is {
    last: string;
    unit: "s" | "m" | "d" | "y" | "M" | "w" | "h";
};
export declare const isAroundValue: (value: ValueType) => value is {
    date: string;
    buffer: {
        amount: string;
        unit: "s" | "m" | "d" | "y" | "M" | "w" | "h";
    };
    direction: "both" | "before" | "after";
};
export declare const isProximityValue: (value: ValueType) => value is {
    first: string;
    second: string;
    distance: number;
};
export declare const isDateValue: (value: ValueType) => value is string;
export declare const isBooleanValue: (value: ValueType) => value is boolean;
export declare const isTextValue: (value: ValueType) => value is string;
export declare const isFloatValue: (value: ValueType) => value is number;
export declare const isIntegerValue: (value: ValueType) => value is number;
export declare const isDuringValue: (value: ValueType) => value is {
    start: string;
    end: string;
};
export declare const isBetweenValue: (value: ValueType) => value is {
    start: number;
    end: number;
};
export declare const isMultivalue: (value: ValueType) => value is string[];
export declare const isBooleanTextValue: (value: ValueType) => value is import("./filter.structure").BooleanTextType;
export declare const isLocationValue: (value: ValueType) => value is import("./filter.structure").LineLocation | import("./filter.structure").PolygonLocation | import("./filter.structure").PointRadiusLocation;
export declare const isValueEmpty: (filter: FilterClass) => boolean;
