/// <reference types="react" />
export declare const removeOldDrawing: ({ map, id }: {
    map: any;
    id: string;
}) => void;
export declare const removeOrLockOldDrawing: (isInteractive: boolean, id: any, map: any, model: any) => void;
export declare const CesiumDrawings: ({ map, selectionInterface, }: {
    map: any;
    selectionInterface: any;
}) => JSX.Element;
