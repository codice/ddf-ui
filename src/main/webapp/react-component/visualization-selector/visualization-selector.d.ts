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
import React from 'react';
export declare const unMaximize: (contentItem: any) => any;
declare class VisualizationSelector extends React.Component<{
    goldenLayout: any;
    onClose: () => void;
}> {
    cesium: any;
    histogram: any;
    inspector: any;
    interimChoice: any;
    interimState: any;
    openlayers: any;
    table: any;
    dragSources: any[];
    constructor(props: any);
    render(): JSX.Element;
    componentDidMount(): void;
    listenToDragStart(dragSource: any): void;
    listenToDragStop(dragSource: any): void;
    listenToDragSources(): void;
    handleChoice(): void;
    handleMouseDown(_event: any, choice: any): void;
    handleMouseUp(choice: any): void;
}
export default VisualizationSelector;
