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
type Props = {
    model: LazyQueryResult;
};
type State = {
    currentOverlayUrl: string;
};
declare class MapActions extends React.Component<Props, State> {
    constructor(props: Props);
    getActions: () => {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    getMapActions: () => {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    getOverlayActions: () => {
        description: string;
        url: string;
        overlayText: string;
    }[];
    getOverlayText: (actionUrl: String) => string;
    overlayImage: (event: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default MapActions;
