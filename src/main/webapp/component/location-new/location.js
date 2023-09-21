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
import { validateWkt, validateDd, validateDms, validateUsng } from './utils';
import { Radio, RadioItem } from '../../react-component/radio/radio';
import { WKT, LatLongDD, LatLongDMS, USNG } from './geo-components';
import Gazetteer from '../../react-component/location/gazetteer';
import CQLUtils from '../../js/CQLUtils';
import immer from 'immer.1.5.0';
var produce = immer;
import { hot } from 'react-hot-loader';
var inputs = {
    wkt: {
        label: 'WKT',
        Component: WKT,
    },
    dd: {
        label: 'Lat/Lon (DD)',
        Component: LatLongDD,
    },
    dms: {
        label: 'Lat/Lon (DMS)',
        Component: LatLongDMS,
    },
    usng: {
        label: 'USNG/MGRS',
        Component: USNG,
    },
    keyword: {
        label: 'Keyword',
        Component: function (props) {
            var keyword = props.keyword;
            return (React.createElement(Gazetteer, { placeholder: 'Enter a location', value: keyword ? keyword.keywordValue : '', setState: props.setState(function (draft, value) {
                    value.type =
                        value.polyType.toLowerCase() === 'polygon'
                            ? 'POLYGON'
                            : 'MULTIPOLYGON';
                    value.keywordValue = value.value;
                    value.mode = 'keyword';
                    value.wkt = CQLUtils.generateFilter(undefined, 'location', value, undefined).value;
                    draft.keyword = value;
                    // onFieldEdit(field.id, location)
                }) }));
        },
    },
};
var validate = function (_a) {
    var state = _a.state, setState = _a.setState;
    var mode = state.mode;
    var validationReport;
    switch (mode) {
        case 'wkt':
            validationReport = validateWkt(state[mode]);
            break;
        case 'dd':
            validationReport = validateDd(state[mode]);
            break;
        case 'dms':
            validationReport = validateDms(state[mode]);
            break;
        case 'usng':
            validationReport = validateUsng(state[mode]);
            break;
    }
    setState(__assign(__assign({}, state), { valid: validationReport ? validationReport.valid : true, error: validationReport ? validationReport.error : false }));
};
var LocationInput = function (props) {
    var mode = props.mode, valid = props.valid, error = props.error, showErrors = props.showErrors, setState = props.setState;
    var input = inputs[mode] || {};
    var _a = input.Component, Component = _a === void 0 ? null : _a;
    React.useEffect(function () {
        validate({
            state: props,
            setState: props.setState(function (draft, value) {
                draft.valid = value.valid;
                draft.error = value.error;
                return draft;
            }),
        });
    }, [props]);
    return (React.createElement("div", null,
        React.createElement(Radio, { value: mode, onChange: setState(function (draft, value) { return (draft.mode = value); }) }, Object.keys(inputs).map(function (key) { return (React.createElement(RadioItem, { key: key, value: key }, inputs[key].label)); })),
        React.createElement("div", { className: "form-group flow-root mt-2" },
            Component !== null ? React.createElement(Component, __assign({}, props)) : null,
            React.createElement("div", { className: "for-error whitespace-pre-line ".concat(!valid && showErrors ? '' : 'invisible'), style: {
                    width: '400px',
                    maxWidth: '100%',
                } },
                React.createElement("span", { className: "fa fa-exclamation-triangle" }),
                " ",
                error))));
};
export default hot(module)(function (_a) {
    var state = _a.state, setState = _a.setState;
    return (React.createElement(LocationInput, __assign({}, state, { setState: function (producer) { return function (value) {
            var nextState = produce(state, function (draft) {
                producer(draft, value);
            });
            setState(nextState);
        }; } })));
});
//# sourceMappingURL=location.js.map