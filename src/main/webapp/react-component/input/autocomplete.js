import { __assign, __rest } from "tslib";
import * as React from 'react';
import clsx from 'clsx';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import CreateableSelect from 'react-select/creatable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import AsyncCreateableSelect from 'react-select/async-creatable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import AsyncSelect from 'react-select/async';
import { emphasize, makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import _debounce from 'lodash.debounce';
var useStyles = makeStyles(function (theme) { return ({
    input: {
        display: 'flex',
        padding: 0,
        height: 'auto'
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflowX: 'scroll',
        overflowY: 'hidden',
        '&::-webkit-scrollbar': {
            display: 'none'
        },
        scrollbarWidth: 'none'
    },
    chip: {
        margin: theme.spacing(0.5, 0.25)
    },
    chipFocused: {
        backgroundColor: emphasize(theme.palette.type === 'light'
            ? theme.palette.grey[300]
            : theme.palette.grey[700], 0.08)
    },
    noOptionsMessage: {
        padding: theme.spacing(1, 2)
    },
    singleValue: {
        fontSize: 16
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        bottom: 6,
        fontSize: 16
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        left: 0,
        right: 0
    },
    divider: {
        height: theme.spacing(2)
    }
}); });
function NoOptionsMessage(props) {
    return (React.createElement(Typography, __assign({ color: "textSecondary", className: props.selectProps.classes.noOptionsMessage }, props.innerProps), props.children));
}
function inputComponent(_a) {
    var inputRef = _a.inputRef, props = __rest(_a, ["inputRef"]);
    return React.createElement("div", __assign({ ref: inputRef }, props));
}
function Control(props) {
    var children = props.children, innerProps = props.innerProps, innerRef = props.innerRef, _a = props.selectProps, classes = _a.classes, TextFieldProps = _a.TextFieldProps;
    return (React.createElement(TextField, __assign({ fullWidth: true, InputProps: {
            inputComponent: inputComponent,
            inputProps: __assign({ className: classes.input, ref: innerRef, children: children }, innerProps)
        } }, TextFieldProps)));
}
function Option(props) {
    return (React.createElement(MenuItem, __assign({ ref: props.innerRef, selected: props.isFocused, component: "div", style: {
            fontWeight: props.isSelected ? 500 : 400
        } }, props.innerProps), props.children));
}
function Placeholder(props) {
    var selectProps = props.selectProps, _a = props.innerProps, innerProps = _a === void 0 ? {} : _a, children = props.children;
    return (React.createElement(Typography, __assign({ color: "textSecondary", className: selectProps.classes.placeholder }, innerProps), children));
}
function SingleValue(props) {
    return (React.createElement(Typography, __assign({ className: props.selectProps.classes.singleValue }, props.innerProps), props.children));
}
function ValueContainer(props) {
    return (React.createElement("div", { className: props.selectProps.classes.valueContainer }, props.children));
}
function MultiValue(props) {
    var _a;
    return (React.createElement(Chip, { tabIndex: -1, label: props.children, className: clsx(props.selectProps.classes.chip, (_a = {},
            _a[props.selectProps.classes.chipFocused] = props.isFocused,
            _a)), onDelete: props.removeProps.onClick, deleteIcon: React.createElement(CancelIcon, __assign({}, props.removeProps)) }));
}
function Menu(props) {
    return (React.createElement(Paper, __assign({ square: true, className: props.selectProps.classes.paper }, props.innerProps), props.children));
}
var components = {
    Control: Control,
    Menu: Menu,
    MultiValue: MultiValue,
    NoOptionsMessage: NoOptionsMessage,
    Option: Option,
    Placeholder: Placeholder,
    SingleValue: SingleValue,
    ValueContainer: ValueContainer
};
/**
 * Very important note when using async options: Because `onInputChange` for some reason is an 'interceptor' rather than a handler that ignores
 * the callback's return value (https://github.com/JedWatson/react-select/issues/1760), if you inline the method like
 * <CreatableSelect onInputChange={(value) => handleValue(value)}
 * and handleValue is an asynchronous function, it will attempt to alter the input value with the return value of handleValue, which will
 * immediately be a promise, causing CreatableSelect to throw an error (in my case `str.replace is not a function`)
 *
 * TLDR: You must not use the shorthand arrow syntax to auto return.
 * <CreatableSelect onInputChange={(value) => {handleValue(value)}} would work without issues.
 */
export var WrappedCreatableSelect = function (props) {
    var classes = useStyles();
    var theme = useTheme();
    var selectStyles = {
        input: function (base) { return (__assign(__assign({}, base), { color: theme.palette.text.primary, '& input': {
                font: 'inherit'
            }, overflowX: 'scroll' })); }
    };
    var label = props.label, styles = props.styles, baseProps = __rest(props, ["label", "styles"]);
    return (React.createElement(CreateableSelect, __assign({ components: components, classes: classes, styles: selectStyles, TextFieldProps: {
            label: label,
            InputLabelProps: {
                htmlFor: 'react-select-multiple',
                shrink: true
            }
        } }, baseProps)));
};
export var WrappedAsyncCreatableSelect = function (props) {
    var classes = useStyles();
    var theme = useTheme();
    var selectStyles = {
        input: function (base) { return (__assign(__assign({}, base), { color: theme.palette.text.primary, '& input': {
                font: 'inherit'
            } })); }
    };
    var label = props.label, styles = props.styles, loadOptions = props.loadOptions, _a = props.debounce, debounce = _a === void 0 ? 0 : _a, baseProps = __rest(props, ["label", "styles", "loadOptions", "debounce"]);
    var debouncedLoadOptions = _debounce(loadOptions, debounce);
    return (React.createElement(AsyncCreateableSelect, __assign({ loadOptions: debouncedLoadOptions, components: components, classes: classes, styles: __assign({}, selectStyles), TextFieldProps: {
            label: label,
            InputLabelProps: {
                htmlFor: 'react-select-multiple',
                shrink: true
            }
        } }, baseProps)));
};
export var WrappedAsyncSelect = function (props) {
    var classes = useStyles();
    var theme = useTheme();
    var selectStyles = {
        input: function (base) { return (__assign(__assign({}, base), { color: theme.palette.text.primary, '& input': {
                font: 'inherit'
            } })); }
    };
    var label = props.label, styles = props.styles, debounce = props.debounce, loadOptions = props.loadOptions, customComponents = props.components, baseProps = __rest(props, ["label", "styles", "debounce", "loadOptions", "components"]);
    var debouncedLoadOptions = _debounce(loadOptions, debounce);
    return (React.createElement(AsyncSelect, __assign({ loadOptions: debouncedLoadOptions, components: __assign(__assign({}, components), customComponents), classes: classes, styles: __assign({}, selectStyles), TextFieldProps: {
            label: label,
            InputLabelProps: {
                htmlFor: 'react-select',
                shrink: true
            }
        } }, baseProps)));
};
//# sourceMappingURL=autocomplete.js.map