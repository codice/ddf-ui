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
import { ValidationResult } from '../../react-component/location/validators';
export declare const queryForms: {
    id: string;
    title: string;
    view: ({ model, errorListener, Extensions }: {
        model: any;
        errorListener?: ((validationResults: {
            [key: string]: ValidationResult | undefined;
        }) => void) | undefined;
        Extensions?: React.FunctionComponent<{}> | undefined;
    }) => JSX.Element;
}[];
type QueryAddReactType = {
    model: any;
    errorListener?: (validationResults: {
        [key: string]: ValidationResult | undefined;
    }) => void;
    Extensions?: React.FunctionComponent;
};
export declare const QueryAddReact: ({ model, errorListener, Extensions, }: QueryAddReactType) => JSX.Element;
export {};
