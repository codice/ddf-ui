/// <reference types="react" />
export declare const LINE_BUFFER_MININUM_METERS = 75;
export declare function showErrorMessages(errors: any): void;
export declare function getFilterErrors(filters: any): unknown[];
export declare function validateGeo(key: string, value: any): {
    error: boolean;
    message: string | null;
} | undefined;
export declare const ErrorComponent: (props: any) => JSX.Element | null;
export declare function validateListOfPoints(coordinates: any[], mode: string): {
    error: boolean;
    message: string | null;
};
export declare const initialErrorState: {
    error: boolean;
    message: string;
};
export declare const initialErrorStateWithDefault: {
    error: boolean;
    message: string;
    defaultValue: string;
};
