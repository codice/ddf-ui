/**
 * Examples pulled from the existing filter tree of filter json
 *
 * I noticed we don't keep the coordinate system stored anywhere in the location
 * json at the moment.  Need to add whatever keyword looks like.
 */
declare const examples: ({
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
    }[];
} | {
    type: string;
    filters: {
        type: string;
        value: boolean;
        property: {
            type: string;
            filterFunctionName: string;
            params: (string | number)[];
        };
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: null;
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
        from: string;
        to: string;
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: {
            lower: number;
            upper: number;
        };
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
        distance: number;
        geojson: {
            type: string;
            geometry: {
                type: string;
                coordinates: number[][];
            };
            properties: {
                type: string;
                buffer: {
                    width: string;
                    unit: string;
                };
            };
        };
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
        distance: number;
        geojson: {
            type: string;
            geometry: {
                type: string;
                coordinates: number[][][];
            };
            properties: {
                type: string;
                buffer: {
                    width: string;
                    unit: string;
                };
            };
        };
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
        distance: number;
        geojson: {
            type: string;
            geometry: {
                type: string;
                coordinates: number[];
            };
            properties: {
                type: string;
                buffer: {
                    width: number;
                    unit: string;
                };
            };
        };
    }[];
} | {
    type: string;
    filters: {
        type: string;
        property: string;
        value: string;
        geojson: {
            type: string;
            bbox: number[];
            geometry: {
                type: string;
                coordinates: number[][][];
            };
            properties: {
                type: string;
                north: number;
                east: number;
                south: number;
                west: number;
            };
        };
    }[];
})[];
