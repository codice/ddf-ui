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
import * as React from 'react';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
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
export type GoldenLayoutViewProps = {
    layoutResult?: LazyQueryResult['plain'];
    editLayoutRef?: React.MutableRefObject<any>;
    configName?: string;
    selectionInterface: any;
    setGoldenLayout: (instance: any) => void;
};
export declare function getInstanceConfig({ goldenLayout }: {
    goldenLayout: any;
}): any;
export declare const GoldenLayoutViewReact: (options: GoldenLayoutViewProps) => JSX.Element;
