import React from 'react';
import { LayoutConfig } from './golden-layout.types';
export declare const goldenLayoutChangeEventName = "golden layout change";
export type GoldenLayoutChangeEventType = CustomEvent<{
    value: LayoutConfig;
    goldenLayout: any;
}>;
export declare const dispatchGoldenLayoutChangeEvent: (target: HTMLElement, detail: GoldenLayoutChangeEventType['detail']) => void;
export declare const useListenToGoldenLayoutChangeEvent: ({ callback, }: {
    callback: (e: GoldenLayoutChangeEventType) => void;
}) => {
    setElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};
