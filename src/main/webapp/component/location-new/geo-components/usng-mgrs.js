import { __assign } from "tslib";
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
import { Radio, RadioItem } from '../../../react-component/radio/radio';
import TextField from '../../../react-component/text-field/index';
import { Units } from '../../../react-component/location/common';
import ListEditor from '../inputs/list-editor';
import { UsngCoordinate } from './coordinates';
var Point = function (props) {
    var usng = props.usng, setState = props.setState;
    return (React.createElement(UsngCoordinate, { value: usng.point, onChange: setState(function (draft, value) { return (draft.usng.point = value); }) }));
};
var Circle = function (props) {
    var usng = props.usng, setState = props.setState;
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(UsngCoordinate, { value: usng.circle.point, onChange: setState(function (draft, value) { return (draft.usng.circle.point = value); }) }),
        React.createElement(Units, { value: usng.circle.units, onChange: setState(function (draft, value) { return (draft.usng.circle.units = value); }) },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
                label: "Radius", type: "number", value: usng.circle.radius, onChange: setState(function (draft, value) { return (draft.usng.circle.radius = value); }) }))));
};
var Line = function (props) {
    var usng = props.usng, setState = props.setState;
    var grids = usng.line.list.map(function (_entry, index) { return (React.createElement(UsngCoordinate, { value: usng.line.list[index], onChange: setState(function (draft, value) { return (draft.usng.line.list[index] = value); }), key: index })); });
    return (React.createElement(ListEditor, { list: usng.line.list, defaultItem: "", onChange: setState(function (draft, value) { return (draft.usng.line.list = value); }) }, grids));
};
var Polygon = function (props) {
    var usng = props.usng, setState = props.setState;
    var grids = usng.polygon.list.map(function (_entry, index) { return (React.createElement(UsngCoordinate, { value: usng.polygon.list[index], onChange: setState(function (draft, value) { return (draft.usng.polygon.list[index] = value); }), key: index })); });
    return (React.createElement(ListEditor, { list: usng.polygon.list, defaultItem: "", onChange: setState(function (draft, value) { return (draft.usng.polygon.list = value); }) }, grids));
};
var BoundingBox = function (props) {
    var usng = props.usng, setState = props.setState;
    return (React.createElement(UsngCoordinate, { value: usng.boundingbox, onChange: setState(function (draft, value) { return (draft.usng.boundingbox = value); }) }));
};
var USNG = function (props) {
    var usng = props.usng, setState = props.setState;
    var inputs = {
        point: Point,
        circle: Circle,
        line: Line,
        polygon: Polygon,
        boundingbox: BoundingBox,
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var Component = inputs[usng.shape] || null;
    return (React.createElement("div", null,
        React.createElement(Radio, { value: usng.shape, onChange: setState(function (draft, value) { return (draft.usng.shape = value); }) },
            React.createElement(RadioItem, { value: "point" }, "Point"),
            React.createElement(RadioItem, { value: "circle" }, "Circle"),
            React.createElement(RadioItem, { value: "line" }, "Line"),
            React.createElement(RadioItem, { value: "polygon" }, "Polygon"),
            React.createElement(RadioItem, { value: "boundingbox" }, "Bounding Box")),
        React.createElement("div", { className: "input-location mt-2" }, Component !== null ? React.createElement(Component, __assign({}, props)) : null)));
};
export default USNG;
//# sourceMappingURL=usng-mgrs.js.map