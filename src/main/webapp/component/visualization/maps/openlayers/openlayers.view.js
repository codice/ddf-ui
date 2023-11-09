import { __read } from "tslib";
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
import { Memo } from '../../../memo/memo';
import { MapViewReact } from '../map.view';
import { OpenlayersDrawings } from './drawing-and-display';
import { useDrawingAndDisplayModels } from '../drawing-and-display';
import $ from 'jquery';
var loadOpenLayersCode = function () {
    // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
    var deferred = new $.Deferred();
    import('./map.openlayers').then(function (OpenlayersMap) {
        deferred.resolve(OpenlayersMap.default);
    });
    return deferred;
};
export var OpenlayersMapViewReact = function (_a) {
    var selectionInterface = _a.selectionInterface, outerSetMap = _a.setMap, drawingAndDisplayModels = _a.drawingAndDisplayModels;
    var _b = __read(React.useState(null), 2), map = _b[0], setMap = _b[1];
    React.useEffect(function () {
        if (outerSetMap) {
            outerSetMap(map);
        }
    }, [map]);
    if (!drawingAndDisplayModels) {
        drawingAndDisplayModels = useDrawingAndDisplayModels({
            selectionInterface: selectionInterface,
            map: map,
        });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Memo, null,
            React.createElement(MapViewReact, { selectionInterface: selectionInterface, loadMap: loadOpenLayersCode, setMap: setMap })),
        React.createElement(OpenlayersDrawings, { drawingAndDisplayModels: drawingAndDisplayModels, map: map })));
};
//# sourceMappingURL=openlayers.view.js.map