/// <reference types="react" />
export type LocationInputPropsType = {
    dd: {
        boundingBox: {
            north: string;
            south: string;
            east: string;
            west: string;
        };
        circle: {
            point: {
                latitude: string;
                longitude: string;
            };
            radius: string;
            units: 'meters';
        };
        line: {
            list: any[];
        };
        point: {
            latitude: string;
            longitude: string;
        };
        polygon: {
            list: any[];
        };
        shape: 'point';
    };
    keyword: any;
    dms: any;
    error: null | string;
    mode: 'wkt' | 'dd' | 'dms' | 'usng' | 'keyword';
    setState: any;
    showErrors: boolean;
    usng: any;
    valid: boolean;
    wkt: string;
};
declare const _default: ({ state, setState }: any) => JSX.Element;
export default _default;
