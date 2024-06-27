/// <reference types="react" />
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
import { TextFieldProps } from '@mui/material/TextField';
export declare const getLargestBbox: (polygonCoordinates: any[], isMultiPolygon: boolean) => {
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
};
type Props = {
    value?: string;
    setState: any;
    fetch?: any;
    placeholder?: string;
    loadingMessage?: string;
    variant?: TextFieldProps['variant'];
};
export type Suggestion = {
    id: string;
    name: string;
    geo?: any;
    extensionGeo?: GeoFeature;
};
export type GeoFeature = {
    type: string;
    geometry: {
        type: string;
        coordinates: any[][][];
    };
    properties?: any;
    id: string;
};
declare const Gazetteer: (props: Props) => JSX.Element;
export default Gazetteer;
