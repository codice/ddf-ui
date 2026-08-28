/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
/**
 *  We might want to not export anything beyond the default state functions, but for now we can leave this and refactor when we have time.
 *  The idea is this state should be flowing in at the top when we make the component, and not be getting fetched in the leaves.  Maybe we can add it to the context.
 */
import { ComponentNameType } from '../golden-layout/golden-layout.types';
import { ModeType } from './results-visual/results-visual';
export declare const RESULTS_ATTRIBUTES_TABLE = "results-attributesShownTable";
export declare const RESULTS_ATTRIBUTES_LIST = "results-attributesShownList";
export declare const RESULTS_MODE = "results-mode";
export declare const MAP_LAYERS = "mapLayers";
export declare function getDefaultComponentState(component: ComponentNameType): {
    mapLayers: any;
    "results-attributesShownTable"?: undefined;
    "results-attributesShownList"?: undefined;
    "results-mode"?: undefined;
} | {
    "results-attributesShownTable": string[];
    "results-attributesShownList": string[];
    "results-mode": ModeType;
    mapLayers?: undefined;
} | {
    mapLayers?: undefined;
    "results-attributesShownTable"?: undefined;
    "results-attributesShownList"?: undefined;
    "results-mode"?: undefined;
};
export declare const getUserPreferencesMapLayersJSON: () => any;
export declare const getDefaultResultsMode: () => ModeType;
export declare const getDefaultResultsShownList: () => string[];
export declare const getDefaultResultsShownTable: () => string[];
export declare const getUserCoordinateFormat: () => string;
