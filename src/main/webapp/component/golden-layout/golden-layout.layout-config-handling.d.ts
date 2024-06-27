import { GoldenLayoutViewProps } from './golden-layout.view';
import * as React from 'react';
import { LayoutConfig } from './golden-layout.types';
import { ResultType } from '../../js/model/Types';
/**
 *  add in missing component state defaults, as we do not create layouts using golden layout all the time and sometimes they have minimal details,
 *  this will also add a default state to old layouts so they aren't seen as changed unnecessarily on load (we don't fire a change event)
 */
export declare function normalizeLayout(layout: LayoutConfig): LayoutConfig;
export declare function getInstanceConfig({ goldenLayout }: {
    goldenLayout: any;
}): LayoutConfig;
export declare function parseResultLayout(layoutResult: ResultType): LayoutConfig;
export declare function getGoldenLayoutConfig({ layoutResult, editLayoutRef, configName, }: GoldenLayoutViewProps): LayoutConfig;
export declare function handleGoldenLayoutStateChange({ options, goldenLayout, currentConfig, lastConfig, }: {
    goldenLayout: any;
    currentConfig: any;
    options: GoldenLayoutViewProps;
    lastConfig: React.MutableRefObject<any>;
}): void;
export declare function removeEphemeralStateAndNormalize(config: LayoutConfig): LayoutConfig;
export declare const FALLBACK_GOLDEN_LAYOUT: {
    type: string;
    content: {
        type: string;
        componentName: string;
        title: string;
    }[];
}[];
export declare const DEFAULT_GOLDEN_LAYOUT_CONTENT: {
    content: import("../../js/model/Startup/startup.types").VisualizationType[] | {
        type: string;
        content: {
            type: string;
            componentName: string;
            title: string;
        }[];
    }[];
};
export declare const getStringifiedDefaultLayout: () => string;
export declare function getGoldenLayoutSettings(): {
    settings: {
        showPopoutIcon: boolean;
        popoutWholeStack: boolean;
        responsiveMode: string;
    };
    dimensions: {
        borderWidth: number;
        minItemHeight: number;
        minItemWidth: number;
        headerHeight: number;
        dragProxyWidth: number;
        dragProxyHeight: number;
    };
    labels: {
        close: string;
        maximise: string;
        minimise: string;
        popout: string;
        popin: string;
        tabDropdown: string;
    };
};
