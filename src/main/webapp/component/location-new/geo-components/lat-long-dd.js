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
import { DdLatitude, DdLongitude } from './coordinates';
import { ddPoint } from '../models';
import DistanceUtils from '../../../js/DistanceUtils';
var Point = function (props) {
    var dd = props.dd, setState = props.setState;
    return (React.createElement(Group, null,
        React.createElement(DdLatitude, { value: dd.point.latitude.toString(), onChange: setState(function (draft, value) {
                draft.dd.point.latitude = value;
            }), onBlur: setState(function (draft) {
                draft.dd.point.latitude = DistanceUtils.coordinateRound(draft.dd.point.latitude);
            }) }),
        React.createElement(DdLongitude, { value: dd.point.longitude.toString(), onChange: setState(function (draft, value) { return (draft.dd.point.longitude = value); }), onBlur: setState(function (draft) {
                draft.dd.point.longitude = DistanceUtils.coordinateRound(draft.dd.point.longitude);
            }) })));
};
var Circle = function (props) {
    var dd = props.dd, setState = props.setState;
    return (React.createElement("div", { className: "flex flex-col flex-nowrap space-y-2" },
        React.createElement(Group, null,
            React.createElement(DdLatitude, { value: dd.circle.point.latitude.toString(), onChange: setState(function (draft, value) { return (draft.dd.circle.point.latitude = value); }), onBlur: setState(function (draft) {
                    draft.dd.circle.point.latitude = DistanceUtils.coordinateRound(draft.dd.circle.point.latitude);
                }) }),
            React.createElement(DdLongitude, { value: dd.circle.point.longitude.toString(), onChange: setState(function (draft, value) {
                    return (draft.dd.circle.point.longitude = value);
                }), onBlur: setState(function (draft) {
                    draft.dd.circle.point.longitude = DistanceUtils.coordinateRound(draft.dd.circle.point.longitude);
                }) })),
        React.createElement(Units, { value: dd.circle.units, onChange: setState(function (draft, value) { return (draft.dd.circle.units = value); }) },
            React.createElement(TextField, { label: "Radius", type: "number", 
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
                value: DistanceUtils.coordinateRound(dd.circle.radius), onChange: setState(function (draft, value) {
                    return (draft.dd.circle.radius = DistanceUtils.coordinateRound(value));
                }) }))));
};
var Line = function (props) {
    var dd = props.dd, setState = props.setState;
    var points = dd.line.list.map(function (_entry, index) { return (React.createElement(Group, { key: index },
        React.createElement(DdLatitude, { value: dd.line.list[index].latitude, onChange: setState(function (draft, value) {
                return (draft.dd.line.list[index].latitude = value);
            }), onBlur: setState(function (draft) {
                draft.dd.line.list[index].latitude = DistanceUtils.coordinateRound(draft.dd.line.list[index].latitude);
            }) }),
        React.createElement(DdLongitude, { value: dd.line.list[index].longitude, onChange: setState(function (draft, value) {
                return (draft.dd.line.list[index].longitude = value);
            }), onBlur: setState(function (draft) {
                return (draft.dd.line.list[index].longitude =
                    DistanceUtils.coordinateRound(draft.dd.line.list[index].longitude));
            }) }))); });
    return (React.createElement(ListEditor, { list: dd.line.list, defaultItem: ddPoint, onChange: setState(function (draft, value) { return (draft.dd.line.list = value); }) }, points));
};
var Polygon = function (props) {
    var dd = props.dd, setState = props.setState;
    var points = dd.polygon.list.map(function (_entry, index) { return (React.createElement(Group, { key: index },
        React.createElement(DdLatitude, { value: dd.polygon.list[index].latitude.toString(), onChange: setState(function (draft, value) {
                return (draft.dd.polygon.list[index].latitude = value);
            }), onBlur: setState(function (draft) {
                return (draft.dd.polygon.list[index].latitude =
                    DistanceUtils.coordinateRound(draft.dd.polygon.list[index].latitude));
            }) }),
        React.createElement(DdLongitude, { value: dd.polygon.list[index].longitude.toString(), onChange: setState(function (draft, value) {
                return (draft.dd.polygon.list[index].longitude = value);
            }), onBlur: setState(function (draft) {
                return (draft.dd.polygon.list[index].longitude =
                    DistanceUtils.coordinateRound(draft.dd.polygon.list[index].longitude));
            }) }))); });
    return (React.createElement(ListEditor, { list: dd.polygon.list, defaultItem: ddPoint, onChange: setState(function (draft, value) { return (draft.dd.polygon.list = value); }) }, points));
};
var BoundingBox = function (props) {
    var dd = props.dd, setState = props.setState;
    return (React.createElement("div", { className: "flex flex-col space-y-2" },
        React.createElement(DdLatitude, { label: "South", value: dd.boundingbox.south.toString(), onChange: setState(function (draft, value) { return (draft.dd.boundingbox.south = value); }), onBlur: setState(function (draft) {
                return (draft.dd.boundingbox.south = DistanceUtils.coordinateRound(draft.dd.boundingbox.south));
            }) }),
        React.createElement(DdLatitude, { label: "North", value: dd.boundingbox.north.toString(), onChange: setState(function (draft, value) { return (draft.dd.boundingbox.north = value); }), onBlur: setState(function (draft) {
                return (draft.dd.boundingbox.north = DistanceUtils.coordinateRound(draft.dd.boundingbox.north));
            }) }),
        React.createElement(DdLongitude, { label: "West", value: dd.boundingbox.west.toString(), onChange: setState(function (draft, value) { return (draft.dd.boundingbox.west = value); }), onBlur: setState(function (draft) {
                return (draft.dd.boundingbox.west = DistanceUtils.coordinateRound(draft.dd.boundingbox.west));
            }) }),
        React.createElement(DdLongitude, { label: "East", value: dd.boundingbox.east.toString(), onChange: setState(function (draft, value) { return (draft.dd.boundingbox.east = value); }), onBlur: setState(function (draft) {
                return (draft.dd.boundingbox.east = DistanceUtils.coordinateRound(draft.dd.boundingbox.east));
            }) })));
};
var LatLongDD = function (props) {
    var dd = props.dd, setState = props.setState;
    var inputs = {
        point: Point,
        line: Line,
        circle: Circle,
        polygon: Polygon,
        boundingbox: BoundingBox,
    };
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    var Component = inputs[dd.shape] || null;
    return (React.createElement("div", null,
        React.createElement(Radio, { value: dd.shape, onChange: setState(function (draft, value) { return (draft.dd.shape = value); }) },
            React.createElement(RadioItem, { value: "point" }, "Point"),
            React.createElement(RadioItem, { value: "circle" }, "Circle"),
            React.createElement(RadioItem, { value: "line" }, "Line"),
            React.createElement(RadioItem, { value: "polygon" }, "Polygon"),
            React.createElement(RadioItem, { value: "boundingbox" }, "Bounding Box")),
        React.createElement("div", { className: "input-location mt-2" }, Component !== null ? React.createElement(Component, __assign({}, props)) : null)));
};
export default LatLongDD;
//# sourceMappingURL=lat-long-dd.js.map