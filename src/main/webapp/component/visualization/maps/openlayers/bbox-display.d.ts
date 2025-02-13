/// <reference types="react" />
import { Translation } from '../interactions.provider';
export declare const drawBbox: ({ map, model, rectangle, id, isInteractive, translation, }: {
    map: any;
    model: any;
    rectangle: any;
    id: string;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => void;
export declare const OpenlayersBboxDisplay: ({ map, model, isInteractive, translation, }: {
    map: any;
    model: any;
    isInteractive?: boolean | undefined;
    translation?: Translation | undefined;
}) => JSX.Element;
