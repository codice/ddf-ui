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
import Group from '../../../react-component/group/index';
import { Radio, RadioItem } from '../../../react-component/radio/radio';
import TextField from '../../../react-component/text-field/index';
import { Units } from '../../../react-component/location/common';
import ListEditor from '../inputs/list-editor';
import { DmsLatitude, DmsLongitude } from './coordinates';
import { dmsPoint } from '../models';
import DirectionInput from './direction';
import { Direction } from '../utils/dms-utils';
var latitudeDirections = [Direction.North, Direction.South];
var longitudeDirections = [Direction.East, Direction.West];
var Point = function (props) {
    var dms = props.dms, setState = props.setState;
    return (React.createElement(Group, null,
        React.createElement(DmsLatitude, { value: dms.point.latitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.point.latitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dms.point.latitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.point.latitude.direction = value);
                }) })),
        React.createElement(DmsLongitude, { value: dms.point.longitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.point.longitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dms.point.longitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.point.longitude.direction = value);
                }) }))));
};
var Circle = function (props) {
    var dms = props.dms, setState = props.setState;
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(Group, null,
            React.createElement(DmsLatitude, { value: dms.circle.point.latitude.coordinate, onChange: setState(function (draft, value) {
                    return (draft.dms.circle.point.latitude.coordinate = value);
                }) },
                React.createElement(DirectionInput
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                , { 
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    options: latitudeDirections, value: dms.circle.point.latitude.direction, onChange: setState(function (draft, value) {
                        return (draft.dms.circle.point.latitude.direction = value);
                    }) })),
            React.createElement(DmsLongitude, { value: dms.circle.point.longitude.coordinate, onChange: setState(function (draft, value) {
                    return (draft.dms.circle.point.longitude.coordinate = value);
                }) },
                React.createElement(DirectionInput
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                , { 
                    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                    options: longitudeDirections, value: dms.circle.point.longitude.direction, onChange: setState(function (draft, value) {
                        return (draft.dms.circle.point.longitude.direction = value);
                    }) }))),
        React.createElement(Units, { value: dms.circle.units, onChange: setState(function (draft, value) { return (draft.dms.circle.units = value); }) },
            React.createElement(TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
            , { 
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
                label: "Radius", type: "number", value: dms.circle.radius, onChange: setState(function (draft, value) { return (draft.dms.circle.radius = value); }) }))));
};
var Line = function (props) {
    var dms = props.dms, setState = props.setState;
    var points = dms.line.list.map(function (_entry, index) { return (React.createElement(Group, { key: index },
        React.createElement(DmsLatitude, { value: dms.line.list[index].latitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.line.list[index].latitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dms.line.list[index].latitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.line.list[index].latitude.direction = value);
                }) })),
        React.createElement(DmsLongitude, { value: dms.line.list[index].longitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.line.list[index].longitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dms.line.list[index].longitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.line.list[index].longitude.direction = value);
                }) })))); });
    return (React.createElement(ListEditor, { list: dms.line.list, defaultItem: dmsPoint, onChange: setState(function (draft, value) { return (draft.dms.line.list = value); }) }, points));
};
var Polygon = function (props) {
    var dms = props.dms, setState = props.setState;
    var points = dms.polygon.list.map(function (_entry, index) { return (React.createElement(Group, { key: index },
        React.createElement(DmsLatitude, { value: dms.polygon.list[index].latitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.polygon.list[index].latitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dms.polygon.list[index].latitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.polygon.list[index].latitude.direction = value);
                }) })),
        React.createElement(DmsLongitude, { value: dms.polygon.list[index].longitude.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.polygon.list[index].longitude.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dms.polygon.list[index].longitude.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.polygon.list[index].longitude.direction = value);
                }) })))); });
    return (React.createElement(ListEditor, { list: dms.polygon.list, defaultItem: dmsPoint, onChange: setState(function (draft, value) { return (draft.dms.polygon.list = value); }) }, points));
};
var BoundingBox = function (props) {
    var dms = props.dms, setState = props.setState;
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(DmsLatitude, { label: "South", value: dms.boundingbox.south.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.boundingbox.south.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dms.boundingbox.south.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.boundingbox.south.direction = value);
                }) })),
        React.createElement(DmsLatitude, { label: "North", value: dms.boundingbox.north.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.boundingbox.north.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: latitudeDirections, value: dms.boundingbox.north.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.boundingbox.north.direction = value);
                }) })),
        React.createElement(DmsLongitude, { label: "West", value: dms.boundingbox.west.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.boundingbox.west.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dms.boundingbox.west.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.boundingbox.west.direction = value);
                }) })),
        React.createElement(DmsLongitude, { label: "East", value: dms.boundingbox.east.coordinate, onChange: setState(function (draft, value) {
                return (draft.dms.boundingbox.east.coordinate = value);
            }) },
            React.createElement(DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            , { 
                // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                options: longitudeDirections, value: dms.boundingbox.east.direction, onChange: setState(function (draft, value) {
                    return (draft.dms.boundingbox.east.direction = value);
                }) }))));
};
var LatLongDMS = function (props) {
    var dms = props.dms, setState = props.setState;
    var inputs = {
        point: Point,
        line: Line,
        circle: Circle,
        polygon: Polygon,
        boundingbox: BoundingBox,
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var Component = inputs[dms.shape] || null;
    return (React.createElement("div", null,
        React.createElement(Radio, { value: dms.shape, onChange: setState(function (draft, value) { return (draft.dms.shape = value); }) },
            React.createElement(RadioItem, { value: "point" }, "Point"),
            React.createElement(RadioItem, { value: "circle" }, "Circle"),
            React.createElement(RadioItem, { value: "line" }, "Line"),
            React.createElement(RadioItem, { value: "polygon" }, "Polygon"),
            React.createElement(RadioItem, { value: "boundingbox" }, "Bounding Box")),
        React.createElement("div", { className: "input-location mt-2" }, Component !== null ? React.createElement(Component, __assign({}, props)) : null)));
};
export default LatLongDMS;
//# sourceMappingURL=lat-long-dms.js.map