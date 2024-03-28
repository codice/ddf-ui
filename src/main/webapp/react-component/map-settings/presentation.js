import { __makeTemplateObject } from "tslib";
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
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import ExampleCoordinates from './example-coordinates';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  min-width: ", ";\n  padding: ", ";\n"], ["\n  overflow: auto;\n  min-width: ", ";\n  padding: ", ";\n"])), function (props) { return props.theme.minimumScreenSize; }, function (props) { return props.theme.minimumSpacing; });
var coordinateFormatOptions = [
    { label: 'Degrees, Minutes, Seconds', value: 'degrees' },
    { label: 'Decimal', value: 'decimal' },
    { label: 'MGRS', value: 'mgrs' },
    { label: 'UTM/UPS', value: 'utm' },
    { label: 'Well Known Text', value: 'wkt' },
];
var render = function (_a) {
    var coordFormat = _a.coordFormat, updateCoordFormat = _a.updateCoordFormat, autoPan = _a.autoPan, updateAutoPan = _a.updateAutoPan;
    return (React.createElement(Root, null,
        React.createElement(FormGroup, { row: true },
            React.createElement(FormControlLabel, { control: React.createElement(Checkbox, { id: "auto-pan-checkbox", autoFocus: true, onKeyPress: function (e) {
                        if (e.key === 'Enter') {
                            updateAutoPan(e, !autoPan);
                        }
                    }, checked: autoPan, onChange: updateAutoPan, color: "primary", name: "autoPan" }), label: React.createElement(Typography, { variant: "body2" }, "Auto-Pan"), labelPlacement: "start", style: { paddingLeft: '10px' } })),
        React.createElement("div", { style: { padding: '0 10px' } },
            React.createElement(Typography, { variant: "body2" }, "Coordinate Format"),
            React.createElement(Select, { id: "coordinate-format-select", onChange: function (event) {
                    updateCoordFormat(event.target.value);
                }, value: coordFormat, variant: "outlined", margin: "dense", fullWidth: true, MenuProps: {
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                    },
                    transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                    },
                } }, coordinateFormatOptions.map(function (option) {
                return (React.createElement(MenuItem, { key: option.value, value: option.value },
                    React.createElement(Typography, { variant: "subtitle2" }, option.label)));
            }))),
        React.createElement(ExampleCoordinates, { selected: coordFormat })));
};
export default hot(module)(render);
export var testComponent = render;
var templateObject_1;
//# sourceMappingURL=presentation.js.map