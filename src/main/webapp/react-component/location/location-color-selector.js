import { __makeTemplateObject } from "tslib";
/* Copyright (c) Connexta, LLC */
import * as React from 'react';
import styled from 'styled-components';
import { Grid } from '@mui/material';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { transparentize } from 'polished';
var ColorSwatch = styled.button(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: 1.5rem;\n  width: 1.5rem;\n  min-width: 1.5rem;\n  margin: 0.2rem;\n  border-radius: 4px;\n  background-color: ", ";\n"], ["\n  height: 1.5rem;\n  width: 1.5rem;\n  min-width: 1.5rem;\n  margin: 0.2rem;\n  border-radius: 4px;\n  background-color: ", ";\n"])), function (props) { return props.color; });
export var ColorSquare = styled(ColorSwatch)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  height: ", ";\n  width: ", ";\n  min-width: ", ";\n  background-clip: padding-box;\n  &:enabled {\n    border: 0.12rem solid\n      ", ";\n  }\n  &:enabled:hover {\n    border: 0.15rem solid\n      ", ";\n  }\n"], ["\n  height: ", ";\n  width: ", ";\n  min-width: ", ";\n  background-clip: padding-box;\n  &:enabled {\n    border: 0.12rem solid\n      ", ";\n  }\n  &:enabled:hover {\n    border: 0.15rem solid\n      ", ";\n  }\n"])), function (props) { return props.size; }, function (props) { return props.size; }, function (props) { return props.size; }, function (props) { return transparentize(0.5, props.palette.text.primary); }, function (props) { return transparentize(0.1, props.palette.text.primary); });
var ColorGrid = styled(Grid)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  padding: 0.5rem;\n"], ["\n  padding: 0.5rem;\n"])));
var ColorPaletteItem = function (_a) {
    var title = _a.title, colorValue = _a.colorValue, setColor = _a.setColor;
    return (React.createElement(Tooltip, { title: title || '', disableInteractive: true },
        React.createElement(ColorSwatch, { color: colorValue, onClick: function () { return setColor(colorValue); } })));
};
export var locationColors = {
    purple: '#8E79DD',
    yellow: '#EECC66',
    cyan: '#33BBEE',
    red: '#961E00',
    green: '#117733',
    blue: '#0022FF',
    violet: '#AA4499',
    orange: '#EE7733',
    teal: '#44AA99',
    grey: '#BBBBBB',
    black: '#000000',
    white: '#FFFFFF',
};
// a color that is not similar looking to the ones above
export var contrastingColor = '#996600';
export var LocationColorSelector = function (_a) {
    var setColor = _a.setColor;
    return (React.createElement(ColorGrid, { container: true, direction: "column", justifyContent: "center", alignItems: "flex-start" },
        React.createElement(Grid, { item: true },
            React.createElement(ColorPaletteItem, { title: 'White', colorValue: locationColors.white, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Grey', colorValue: locationColors.grey, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Black', colorValue: locationColors.black, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Yellow', colorValue: locationColors.yellow, setColor: setColor })),
        React.createElement(Grid, { item: true },
            React.createElement(ColorPaletteItem, { title: 'Red', colorValue: locationColors.red, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Green', colorValue: locationColors.green, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Blue', colorValue: locationColors.blue, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Orange', colorValue: locationColors.orange, setColor: setColor })),
        React.createElement(Grid, { item: true },
            React.createElement(ColorPaletteItem, { title: 'Cyan', colorValue: locationColors.cyan, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Violet', colorValue: locationColors.violet, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Teal', colorValue: locationColors.teal, setColor: setColor }),
            React.createElement(ColorPaletteItem, { title: 'Purple', colorValue: locationColors.purple, setColor: setColor }))));
};
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=location-color-selector.js.map