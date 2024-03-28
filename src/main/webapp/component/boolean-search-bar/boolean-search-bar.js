import { __assign, __read, __rest } from "tslib";
/* Copyright (c) Connexta, LLC */
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions, } from '@mui/material/Autocomplete';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useState } from 'react';
import useBooleanSearchError from './useBooleanSearchError';
import ValidationIndicator from './validation-indicator';
import { fetchCql, fetchSuggestions, getRandomId, } from './boolean-search-utils';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useUpdateEffect } from 'react-use';
import { dispatchEnterKeySubmitEvent } from '../custom-events/enter-key-submit';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
var defaultFilterOptions = createFilterOptions();
var WILD_CARD = '*';
var defaultValue = {
    text: '',
    cql: '',
    error: false,
};
var validateShape = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    if (value.text === undefined ||
        value.cql === undefined ||
        value.error === undefined) {
        onChange(defaultValue);
    }
};
var ShapeValidator = function (props) {
    React.useEffect(function () {
        validateShape(props);
    });
    if (props.value.text !== undefined) {
        return React.createElement(BooleanSearchBar, __assign({}, props));
    }
    return null;
};
/**
 * We want to take in a value, and onChange update it.  That would then flow a new value
 * back down.
 */
var BooleanSearchBar = function (_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.property, property = _b === void 0 ? 'anyText' : _b, placeholder = _a.placeholder, disableClearable = _a.disableClearable, props = __rest(_a, ["value", "onChange", "property", "placeholder", "disableClearable"]);
    var config = useConfiguration().config;
    if (placeholder === undefined) {
        placeholder = "Search ".concat(config === null || config === void 0 ? void 0 : config.customBranding, " ").concat(config === null || config === void 0 ? void 0 : config.product);
    }
    var _c = __read(React.useState(false), 2), isOpen = _c[0], setIsOpen = _c[1];
    var errorMessage = useBooleanSearchError(value).errorMessage;
    var _d = __read(React.useState(false), 2), loading = _d[0], setLoading = _d[1];
    var _f = __read(React.useState(''), 2), suggestion = _f[0], setSuggestion = _f[1];
    var _g = __read(React.useState(getRandomId()), 1), id = _g[0];
    var _h = __read(React.useState(0), 2), cursorLocation = _h[0], setCursorLocation = _h[1];
    var _j = __read(React.useState([]), 2), tokens = _j[0], setTokens = _j[1];
    var inputRef = React.useRef();
    var optionToValue = function (option) { return option.token; };
    var _k = __read(useState([]), 2), options = _k[0], setOptions = _k[1];
    var isValidBeginningToken = function (query) {
        var trimmedToken = query.trim().toLowerCase();
        if (trimmedToken === 'not' ||
            trimmedToken === 'and' ||
            trimmedToken === 'or') {
            return false;
        }
        return true;
    };
    useUpdateEffect(function () {
        var controller = new AbortController();
        setLoading(true);
        // when empty, interpret as wildcard
        var searchVal = value.text === '' ? WILD_CARD : value.text;
        if (searchVal && isValidBeginningToken(value.text)) {
            fetchCql({
                searchText: searchVal,
                searchProperty: property,
                callback: function (_a) {
                    var _b = _a.cql, cql = _b === void 0 ? '' : _b, error = _a.error, errorMessage = _a.errorMessage;
                    onChange(__assign(__assign({}, value), { cql: cql, error: !!error, errorMessage: errorMessage }));
                    setLoading(false);
                },
                signal: controller.signal,
            });
        }
        else {
            setLoading(false);
            onChange(__assign(__assign({}, value), { cql: '', error: true }));
        }
        return function () {
            controller.abort();
        };
    }, [value.text, property]);
    React.useEffect(function () {
        var controller = new AbortController();
        if (value.text !== null && isValidBeginningToken(value.text)) {
            fetchSuggestions({
                text: value.text,
                callback: function (_a) {
                    var options = _a.options;
                    setOptions(options);
                },
                signal: controller.signal,
            });
        }
        else {
            setOptions([]);
        }
        return function () {
            controller.abort();
        };
    }, [value.text]);
    React.useEffect(function () {
        var rawTokens = value.text.split(/[ ())]+/);
        var joinTokens = [];
        for (var i = 0; i < rawTokens.length; i++) {
            joinTokens.push(rawTokens.slice(i, rawTokens.length).join(' ').trim());
        }
        setTokens(joinTokens);
    }, [value.text]);
    var getOptionLabel = function (option) {
        if (!option || !option.token)
            return '';
        if (option.length === 0)
            return '';
        return option.token;
    };
    var handleSubmit = function (e) {
        if (!value.error && (!isOpen || currentOptions.length === 0)) {
            dispatchEnterKeySubmitEvent(e);
        }
    };
    // Used to determine what we can go for next in context the the previous.
    var filterOptions = React.useCallback(function (optionsToFilter) {
        var lastToken = tokens[tokens.length - 1];
        if (lastToken === undefined) {
            return [];
        }
        else if (lastToken === '') {
            return optionsToFilter;
        }
        else {
            var strippedOptions = optionsToFilter.map(function (o) { return ({
                token: o.token,
            }); });
            var filteredOptions = defaultFilterOptions(strippedOptions, {
                inputValue: lastToken,
                getOptionLabel: getOptionLabel,
            });
            var flatFilteredOptions_1 = filteredOptions.map(function (o) { return o.token; });
            var reconstructedOptions = optionsToFilter.filter(function (o) {
                return flatFilteredOptions_1.includes(o.token);
            });
            return reconstructedOptions;
        }
    }, [tokens]);
    React.useEffect(function () {
        var _a;
        if (value.text) {
            if (suggestion === 'AND' || suggestion === 'OR') {
                (_a = inputRef === null || inputRef === void 0 ? void 0 : inputRef.current) === null || _a === void 0 ? void 0 : _a.setSelectionRange(cursorLocation, cursorLocation);
                setSuggestion('');
            }
        }
    }, [value.text]);
    var handleTextChange = function (e) {
        onChange(__assign(__assign({}, value), { text: e.target.value }));
    };
    var handleTextClear = function () {
        onChange(__assign(__assign({}, defaultValue), { text: '' }));
    };
    var getLogicalOperators = function (options) {
        return options.filter(function (option) { return option.type === 'logical'; });
    };
    var getTokenToRemove = function (suggestion) {
        var tokenToRemove = '';
        for (var i = 0; i < tokens.length; i++) {
            var match = suggestion.token
                .toLowerCase()
                .match(tokens[i].toLowerCase());
            if (match && match[0]) {
                tokenToRemove = tokens[i];
                break;
            }
        }
        return tokenToRemove;
    };
    var currentOptions = filterOptions(getLogicalOperators(options)).sort(function (o1) { return ((o1 === null || o1 === void 0 ? void 0 : o1.type) === 'mandatory' ? -1 : 1); });
    return (React.createElement(FormControl, __assign({ fullWidth: true }, props.FormControlProps),
        React.createElement(Autocomplete, __assign({ filterOptions: function (optionsToFilter) { return optionsToFilter; }, onOpen: function () {
                setIsOpen(true);
            }, open: isOpen, onClose: function () {
                setIsOpen(false);
            }, options: currentOptions, includeInputInList: true, onChange: function (_e, suggestion) {
                var _a;
                if (suggestion &&
                    suggestion.token &&
                    suggestion.token !== value.text) {
                    var selectedSuggestion = optionToValue(suggestion).toUpperCase();
                    if (selectedSuggestion === 'NOT') {
                        selectedSuggestion = 'NOT ()';
                    }
                    setSuggestion(selectedSuggestion);
                    var cursor = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.selectionStart;
                    var tokenToRemove = getTokenToRemove(suggestion);
                    var newInputValue = value.text;
                    if (tokenToRemove !== '' && cursor && cursor < value.text.length) {
                        var postText = value.text.substr(cursor, value.text.length);
                        var preText = value.text.slice(0, (tokenToRemove.length + postText.length) * -1);
                        onChange(__assign(__assign({}, value), { text: "".concat(preText).concat(selectedSuggestion).concat(postText) }));
                        var str = "".concat(preText).concat(selectedSuggestion);
                        setCursorLocation(str.length);
                    }
                    else if (tokenToRemove !== '') {
                        newInputValue = value.text.slice(0, tokenToRemove.length * -1);
                    }
                    else if (cursor && cursor < value.text.length) {
                        var preText = value.text.substr(0, cursor).trim();
                        var postText = value.text.substr(cursor, value.text.length);
                        onChange(__assign(__assign({}, value), { text: "".concat(preText, " ").concat(selectedSuggestion).concat(postText) }));
                        var str = "".concat(preText, " ").concat(selectedSuggestion);
                        setCursorLocation(str.length);
                    }
                    if (cursor && cursor >= value.text.length) {
                        var newInput = "".concat(newInputValue).concat(selectedSuggestion, " ");
                        onChange(__assign(__assign({}, value), { text: newInput }));
                        setCursorLocation(newInput.length + 1);
                    }
                }
            }, inputValue: value.text, getOptionLabel: getOptionLabel, multiple: false, disableClearable: true, disableCloseOnSelect: true, freeSolo: true, id: id, renderOption: function (option) { return (React.createElement(Typography, { noWrap: true }, optionToValue(option))); }, renderInput: function (params) {
                return (React.createElement(TextField, __assign({ "data-id": "search-input" }, params, { onKeyUp: function (e) {
                        if (e.key === 'Enter') {
                            handleSubmit(e);
                            setIsOpen(false);
                        }
                    }, placeholder: placeholder, inputRef: inputRef, size: 'small', variant: "outlined", onChange: handleTextChange, value: value.text, helperText: value.error ? React.createElement(React.Fragment, null, errorMessage) : '', InputProps: __assign(__assign(__assign({}, params.InputProps), { startAdornment: (React.createElement(React.Fragment, null, loading ? (React.createElement(CircularProgress, { size: 20, style: { marginRight: 13, marginLeft: 2 } })) : (React.createElement(ValidationIndicator, { helperMessage: value.error ? errorMessage : 'Valid', error: value.error })))), endAdornment: (React.createElement(React.Fragment, null,
                            !disableClearable && !!value.text && (React.createElement(IconButton, { onClick: handleTextClear, style: { padding: '2px' }, size: "large" },
                                React.createElement(ClearIcon, { fontSize: "small" }))),
                            React.createElement(IconButton, { onClick: function (e) {
                                    setIsOpen(false);
                                    handleSubmit(e);
                                }, disabled: value.error, style: { padding: '2px' }, size: "large" },
                                React.createElement(SearchIcon, { fontSize: "small" })))) }), props.InputProps) }, props.TextFieldProps)));
            } }, props.AutocompleteProps))));
};
export default hot(module)(ShapeValidator);
//# sourceMappingURL=boolean-search-bar.js.map