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
import { Suggestion, GeoFeature } from './gazetteer';
type Props = {
    setState: any;
    fetch?: any;
    value?: string;
    onError?: (error: any) => void;
    suggester?: (input: string) => Promise<Suggestion[]>;
    geofeature?: (suggestion: Suggestion) => Promise<GeoFeature>;
    errorMessage?: string;
    polygon?: any[];
    polyType?: string;
    setBufferState?: any;
    polygonBufferWidth?: string;
    polygonBufferUnits?: string;
    loadingMessage?: string;
    minimumInputLength?: number;
    placeholder?: string;
    variant?: TextFieldProps['variant'];
};
declare const Keyword: (props: Props) => import("react/jsx-runtime").JSX.Element;
export default Keyword;
