import { __assign, __read } from "tslib";
/**
 * Adapted from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/customization/color/ColorTool.js
 */
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { rgbToHex, useTheme } from '@mui/material/styles';
import colors from './typed-colors';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import _ from 'lodash';
import CheckIcon from '@mui/icons-material/Check';
import Slider from '@mui/material/Slider';
import user from '../../component/singletons/user-instance';
import { capitalize } from '@mui/material/utils';
var shades = [
    900,
    800,
    700,
    600,
    500,
    400,
    300,
    200,
    100,
    50,
    'A700',
    'A400',
    'A200',
    'A100',
];
var containsShades = function (color, shades) {
    return shades.every(function (shade) { return Object.keys(color).includes(shade.toString()); });
};
var getHues = function () {
    var hues = Object.keys(colors).filter(function (hue) {
        return containsShades(colors[hue], shades);
    });
    return hues.slice(1, 17);
};
var hues = getHues();
/**
 * Costly to update, so let them settle on a color first
 */
var updateTheme = _.debounce(function (state) {
    user.get('user').get('preferences').get('theme').set({
        primary: state.primary,
        secondary: state.secondary,
    });
}, 0);
var getDefaults = function () {
    return __assign({ primary: '#2196f3', secondary: '#f50057' }, user.get('user').get('preferences').get('theme').toJSON());
};
function ColorTool(props) {
    var classes = props.classes;
    var theme = useTheme();
    var defaults = getDefaults();
    var _a = __read(React.useState({
        primary: defaults.primary,
        secondary: defaults.secondary,
        primaryInput: defaults.primary,
        secondaryInput: defaults.secondary,
        primaryHue: 'blue',
        secondaryHue: 'pink',
        primaryShade: 4,
        secondaryShade: 11,
    }), 2), state = _a[0], setState = _a[1];
    var handleChangeColor = function (name) { return function (event) {
        var isRgb = function (string) {
            return /rgb\([0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\)/i.test(string);
        };
        var isHex = function (string) {
            return /^#?([0-9a-f]{3})$|^#?([0-9a-f]){6}$/i.test(string);
        };
        var color = event.target.value;
        setState(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a["".concat(name, "Input")] = color, _a)));
        });
        var isValidColor = false;
        if (isRgb(color)) {
            isValidColor = true;
        }
        else if (isHex(color)) {
            isValidColor = true;
            if (color.indexOf('#') === -1) {
                color = "#".concat(color);
            }
        }
        if (isValidColor) {
            setState(function (prevState) {
                var _a;
                return (__assign(__assign({}, prevState), (_a = {}, _a[name] = color, _a)));
            });
        }
    }; };
    var handleChangeHue = function (name) { return function (event) {
        var _a;
        var hue = event.target.value;
        var shade = state["".concat(name, "Shade")];
        // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
        var color = colors[hue][shades[shade]];
        if (color) {
            setState(__assign(__assign({}, state), (_a = {}, _a["".concat(name, "Hue")] = hue, _a[name] = color, _a["".concat(name, "Input")] = color, _a)));
        }
    }; };
    var handleChangeShade = function (name) { return function (_event, shade) {
        var _a;
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        var color = colors[state["".concat(name, "Hue")]][shades[shade]];
        setState(__assign(__assign({}, state), (_a = {}, _a["".concat(name, "Shade")] = shade, _a[name] = color, _a["".concat(name, "Input")] = color, _a)));
    }; };
    React.useEffect(function () {
        updateTheme(state);
    }, [state]);
    var colorBar = function (color, intent) {
        var background = theme.palette.augmentColor({
            color: {
                main: color,
            },
        });
        return (React.createElement(Grid, { container: true, sx: { marginTop: theme.spacing(2) } }, ['dark', 'main', 'light'].map(function (key) {
            var backgroundColor = background[key];
            return (React.createElement(Tooltip, { placement: "right", title: (function () {
                    switch (key) {
                        case 'dark':
                            return 'Go darker';
                        case 'light':
                            return 'Go lighter';
                        default:
                            return 'Current shade';
                    }
                })(), key: key },
                React.createElement(Button, { sx: {
                        width: 64,
                        height: 64,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: backgroundColor,
                    }, onClick: function () {
                        var _a;
                        setState(__assign(__assign({}, state), (_a = {}, _a[intent] = rgbToHex(backgroundColor), _a["".concat(intent, "Input")] = rgbToHex(backgroundColor), _a)));
                    } },
                    React.createElement(Typography, { variant: "caption", style: {
                            color: theme.palette.getContrastText(backgroundColor),
                        } }, rgbToHex(backgroundColor)))));
        })));
    };
    var colorPicker = function (intent) {
        var intentInput = state["".concat(intent, "Input")];
        var intentShade = state["".concat(intent, "Shade")];
        var color = state["".concat(intent)];
        return (React.createElement(Grid, { item: true, xs: 12, sm: 6, md: 4, className: "min-w-104" },
            React.createElement(Typography, { component: "label", gutterBottom: true, htmlFor: intent, variant: "h6" }, capitalize(intent)),
            React.createElement(Input, { id: intent, value: intentInput, onChange: handleChangeColor(intent), fullWidth: true }),
            React.createElement("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: theme.spacing(2),
                    marginBottom: theme.spacing(2),
                } },
                React.createElement(Typography, { id: "".concat(intent, "ShadeSliderLabel") }, "Shade:"),
                React.createElement(Slider, { sx: {
                        width: 'calc(100% - 80px)',
                        marginLeft: theme.spacing(3),
                        marginRight: theme.spacing(3),
                    }, value: intentShade, min: 0, max: 13, step: 1, onChange: handleChangeShade(intent), "aria-labelledby": "".concat(intent, "ShadeSliderLabel") }),
                React.createElement(Typography, null, shades[intentShade])),
            React.createElement("div", { style: { width: 192 } }, hues.map(function (hue) {
                var shade = intent === 'primary'
                    ? shades[state.primaryShade]
                    : shades[state.secondaryShade];
                // @ts-expect-error ts-migrate(7015) FIXME: Element implicitly has an 'any' type because index... Remove this comment to see the full error message
                var backgroundColor = colors[hue][shade];
                return (React.createElement(Tooltip, { placement: "right", title: hue, key: hue },
                    React.createElement(Radio, { sx: { padding: 0 }, color: "default", checked: state[intent] === backgroundColor, onChange: handleChangeHue(intent), value: hue, name: intent, "aria-labelledby": "tooltip-".concat(intent, "-").concat(hue), icon: React.createElement("div", { style: {
                                backgroundColor: backgroundColor,
                                width: 48,
                                height: 48,
                            } }), checkedIcon: React.createElement("div", { style: {
                                backgroundColor: backgroundColor,
                                width: 48,
                                height: 48,
                                border: '1px solid white',
                                color: theme.palette.common.white,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            } },
                            React.createElement(CheckIcon, { style: { fontSize: 30 } })) })));
            })),
            colorBar(color, intent)));
    };
    return (React.createElement(Grid, { container: true, spacing: 5, className: classes === null || classes === void 0 ? void 0 : classes.root },
        colorPicker('primary'),
        colorPicker('secondary')));
}
export default hot(module)(ColorTool);
//# sourceMappingURL=color-tool.js.map