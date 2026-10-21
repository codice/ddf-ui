import { __assign, __read, __rest } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* Copyright (c) Connexta, LLC */
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions, } from '@mui/material/Autocomplete';
import * as React from 'react';
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
        return _jsx(BooleanSearchBar, __assign({}, props));
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
    var inputRef = React.useRef(null);
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
    return (_jsx(FormControl, __assign({ fullWidth: true }, props.FormControlProps, { children: _jsx(Autocomplete, __assign({ filterOptions: function (optionsToFilter) { return optionsToFilter; }, onOpen: function () {
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
            }, inputValue: value.text, getOptionLabel: getOptionLabel, multiple: false, disableClearable: true, disableCloseOnSelect: true, freeSolo: true, id: id, renderOption: function (option) { return (_jsx(Typography, { noWrap: true, children: optionToValue(option) })); }, renderInput: function (params) {
                return (_jsx(TextField, __assign({ "data-id": "search-input" }, params, { onKeyUp: function (e) {
                        if (e.key === 'Enter') {
                            handleSubmit(e);
                            setIsOpen(false);
                        }
                    }, placeholder: placeholder, inputRef: inputRef, size: 'small', variant: "outlined", onChange: handleTextChange, value: value.text, helperText: value.error ? _jsx(_Fragment, { children: errorMessage }) : '', InputProps: __assign(__assign(__assign({}, params.InputProps), { startAdornment: (_jsx(_Fragment, { children: loading ? (_jsx(CircularProgress, { size: 20, style: { marginRight: 13, marginLeft: 2 } })) : (_jsx(ValidationIndicator, { helperMessage: value.error ? errorMessage : 'Valid', error: value.error })) })), endAdornment: (_jsxs(_Fragment, { children: [!disableClearable && !!value.text && (_jsx(IconButton, { onClick: handleTextClear, style: { padding: '2px' }, size: "large", children: _jsx(ClearIcon, { fontSize: "small" }) })), _jsx(IconButton, { onClick: function (e) {
                                        setIsOpen(false);
                                        handleSubmit(e);
                                    }, disabled: value.error, style: { padding: '2px' }, size: "large", children: _jsx(SearchIcon, { fontSize: "small" }) })] })) }), props.InputProps) }, props.TextFieldProps)));
            } }, props.AutocompleteProps)) })));
};
export default ShapeValidator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi1zZWFyY2gtYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9ib29sZWFuLXNlYXJjaC1iYXIvYm9vbGVhbi1zZWFyY2gtYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQyxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNqRCxPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFBO0FBQzdELE9BQU8sV0FBaUMsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6RSxPQUFPLFNBQTZCLE1BQU0seUJBQXlCLENBQUE7QUFDbkUsT0FBTyxZQUFZLEVBQUUsRUFFbkIsbUJBQW1CLEdBQ3BCLE1BQU0sNEJBQTRCLENBQUE7QUFDbkMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUVoQyxPQUFPLHFCQUFxQixNQUFNLHlCQUF5QixDQUFBO0FBQzNELE9BQU8sbUJBQW1CLE1BQU0sd0JBQXdCLENBQUE7QUFDeEQsT0FBTyxFQUNMLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsV0FBVyxHQUVaLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFFakQsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxVQUFVLE1BQU0sNEJBQTRCLENBQUE7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxJQUFNLG9CQUFvQixHQUFHLG1CQUFtQixFQUFFLENBQUE7QUFZbEQsSUFBTSxTQUFTLEdBQUcsR0FBRyxD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T0FBTyxHQUFHLEdBQ3BCLElBQ1osQ0FDSixLQUVFLEtBQUssQ0FBQyxVQUFVLEtBRWpCLEtBQUssQ0FBQyxjQUFjLEVBQ3hCLENBQ0gsQ0FBQTtZQUNILENBQUMsSUFDRyxLQUFLLENBQUMsaUJBQWlCLEVBQzNCLElBQ1UsQ0FDZixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxjQUFjLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDb3B5cmlnaHQgKGMpIENvbm5leHRhLCBMTEMgKi9cbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBDaXJjdWxhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2lyY3VsYXJQcm9ncmVzcydcbmltcG9ydCBGb3JtQ29udHJvbCwgeyBGb3JtQ29udHJvbFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9Gb3JtQ29udHJvbCdcbmltcG9ydCBUZXh0RmllbGQsIHsgVGV4dEZpZWxkUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBBdXRvY29tcGxldGUsIHtcbiAgQXV0b2NvbXBsZXRlUHJvcHMsXG4gIGNyZWF0ZUZpbHRlck9wdGlvbnMsXG59IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm9vbGVhblRleHRUeXBlIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB1c2VCb29sZWFuU2VhcmNoRXJyb3IgZnJvbSAnLi91c2VCb29sZWFuU2VhcmNoRXJyb3InXG5pbXBvcnQgVmFsaWRhdGlvbkluZGljYXRvciBmcm9tICcuL3ZhbGlkYXRpb24taW5kaWNhdG9yJ1xuaW1wb3J0IHtcbiAgZmV0Y2hDcWwsXG4gIGZldGNoU3VnZ2VzdGlvbnMsXG4gIGdldFJhbmRvbUlkLFxuICBPcHRpb24sXG59IGZyb20gJy4vYm9vbGVhbi1zZWFyY2gtdXRpbHMnXG5pbXBvcnQgSWNvbkJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0ljb25CdXR0b24nXG5pbXBvcnQgeyBJbnB1dFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9JbnB1dCdcbmltcG9ydCBDbGVhckljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DbGVhcidcbmltcG9ydCBTZWFyY2hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvU2VhcmNoJ1xuaW1wb3J0IHsgdXNlVXBkYXRlRWZmZWN0IH0gZnJvbSAncmVhY3QtdXNlJ1xuaW1wb3J0IHsgZGlzcGF0Y2hFbnRlcktleVN1Ym1pdEV2ZW50IH0gZnJvbSAnLi4vY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcbmNvbnN0IGRlZmF1bHRGaWx0ZXJPcHRpb25zID0gY3JlYXRlRmlsdGVyT3B0aW9ucygpXG50eXBlIFByb3BzID0ge1xuICB2YWx1ZTogQm9vbGVhblRleHRUeXBlXG4gIG9uQ2hhbmdlOiAodmFsdWU6IEJvb2xlYW5UZXh0VHlwZSkgPT4gdm9pZFxuICBwcm9wZXJ0eT86IHN0cmluZ1xuICBkaXNhYmxlQ2xlYXJhYmxlPzogYm9vbGVhblxuICBwbGFjZWhvbGRlcj86IFRleHRGaWVsZFByb3BzWydwbGFjZWhvbGRlciddXG4gIEZvcm1Db250cm9sUHJvcHM/OiBGb3JtQ29udHJvbFByb3BzXG4gIFRleHRGaWVsZFByb3BzPzogUGFydGlhbDxUZXh0RmllbGRQcm9wcz5cbiAgQXV0b2NvbXBsZXRlUHJvcHM/OiBBdXRvY29tcGxldGVQcm9wczxPcHRpb24sIGZhbHNlLCB0cnVlLCB0cnVlPlxuICBJbnB1dFByb3BzPzogSW5wdXRQcm9wc1xufVxuY29uc3QgV0lMRF9DQVJEID0gJyonXG5jb25zdCBkZWZhdWx0VmFsdWU6IEJvb2xlYW5UZXh0VHlwZSA9IHtcbiAgdGV4dDogJycsXG4gIGNxbDogJycsXG4gIGVycm9yOiBmYWxzZSxcbn1cbmNvbnN0IHZhbGlkYXRlU2hhcGUgPSAoeyB2YWx1ZSwgb25DaGFuZ2UgfTogUHJvcHMpID0+IHtcbiAgaWYgKFxuICAgIHZhbHVlLnRleHQgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbHVlLmNxbCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUuZXJyb3IgPT09IHVuZGVmaW5lZFxuICApIHtcbiAgICBvbkNoYW5nZShkZWZhdWx0VmFsdWUpXG4gIH1cbn1cbmNvbnN0IFNoYXBlVmFsaWRhdG9yID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZhbGlkYXRlU2hhcGUocHJvcHMpXG4gIH0pXG4gIGlmIChwcm9wcy52YWx1ZS50ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gPEJvb2xlYW5TZWFyY2hCYXIgey4uLnByb3BzfSAvPlxuICB9XG4gIHJldHVybiBudWxsXG59XG4vKipcbiAqIFdlIHdhbnQgdG8gdGFrZSBpbiBhIHZhbHVlLCBhbmQgb25DaGFuZ2UgdXBkYXRlIGl0LiAgVGhhdCB3b3VsZCB0aGVuIGZsb3cgYSBuZXcgdmFsdWVcbiAqIGJhY2sgZG93bi5cbiAqL1xuY29uc3QgQm9vbGVhblNlYXJjaEJhciA9ICh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgcHJvcGVydHkgPSAnYW55VGV4dCcsXG4gIHBsYWNlaG9sZGVyLFxuICBkaXNhYmxlQ2xlYXJhYmxlLFxuICAuLi5wcm9wc1xufTogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBjb25maWcgfSA9IHVzZUNvbmZpZ3VyYXRpb24oKVxuICBpZiAocGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIHBsYWNlaG9sZGVyID0gYFNlYXJjaCAke2NvbmZpZz8uY3VzdG9tQnJhbmRpbmd9ICR7Y29uZmlnPy5wcm9kdWN0fWBcbiAgfVxuICBjb25zdCBbaXNPcGVuLCBzZXRJc09wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgZXJyb3JNZXNzYWdlIH0gPSB1c2VCb29sZWFuU2VhcmNoRXJyb3IodmFsdWUpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc3VnZ2VzdGlvbiwgc2V0U3VnZ2VzdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW2lkXSA9IFJlYWN0LnVzZVN0YXRlKGdldFJhbmRvbUlkKCkpXG4gIGNvbnN0IFtjdXJzb3JMb2NhdGlvbiwgc2V0Q3Vyc29yTG9jYXRpb25dID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW3Rva2Vucywgc2V0VG9rZW5zXSA9IFJlYWN0LnVzZVN0YXRlPHN0cmluZ1tdPihbXSlcbiAgY29uc3QgaW5wdXRSZWYgPSBSZWFjdC51c2VSZWY8SFRNTElucHV0RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IG9wdGlvblRvVmFsdWUgPSAob3B0aW9uOiBhbnkpID0+IG9wdGlvbi50b2tlblxuICBjb25zdCBbb3B0aW9ucywgc2V0T3B0aW9uc10gPSB1c2VTdGF0ZTxPcHRpb25bXT4oW10pXG4gIGNvbnN0IGlzVmFsaWRCZWdpbm5pbmdUb2tlbiA9IChxdWVyeTogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgdHJpbW1lZFRva2VuID0gcXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoXG4gICAgICB0cmltbWVkVG9rZW4gPT09ICdub3QnIHx8XG4gICAgICB0cmltbWVkVG9rZW4gPT09ICdhbmQnIHx8XG4gICAgICB0cmltbWVkVG9rZW4gPT09ICdvcidcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHVzZVVwZGF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKClcbiAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgLy8gd2hlbiBlbXB0eSwgaW50ZXJwcmV0IGFzIHdpbGRjYXJkXG4gICAgY29uc3Qgc2VhcmNoVmFsID0gdmFsdWUudGV4dCA9PT0gJycgPyBXSUxEX0NBUkQgOiB2YWx1ZS50ZXh0XG4gICAgaWYgKHNlYXJjaFZhbCAmJiBpc1ZhbGlkQmVnaW5uaW5nVG9rZW4odmFsdWUudGV4dCkpIHtcbiAgICAgIGZldGNoQ3FsKHtcbiAgICAgICAgc2VhcmNoVGV4dDogc2VhcmNoVmFsLFxuICAgICAgICBzZWFyY2hQcm9wZXJ0eTogcHJvcGVydHksXG4gICAgICAgIGNhbGxiYWNrOiAoeyBjcWwgPSAnJywgZXJyb3IsIGVycm9yTWVzc2FnZSB9KSA9PiB7XG4gICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgLi4udmFsdWUsXG4gICAgICAgICAgICBjcWwsXG4gICAgICAgICAgICBlcnJvcjogISFlcnJvcixcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZSxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICAgIH0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgY3FsOiAnJyxcbiAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29udHJvbGxlci5hYm9ydCgpXG4gICAgfVxuICB9LCBbdmFsdWUudGV4dCwgcHJvcGVydHldKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpXG4gICAgaWYgKHZhbHVlLnRleHQgIT09IG51bGwgJiYgaXNWYWxpZEJlZ2lubmluZ1Rva2VuKHZhbHVlLnRleHQpKSB7XG4gICAgICBmZXRjaFN1Z2dlc3Rpb25zKHtcbiAgICAgICAgdGV4dDogdmFsdWUudGV4dCxcbiAgICAgICAgY2FsbGJhY2s6ICh7IG9wdGlvbnMgfSkgPT4ge1xuICAgICAgICAgIHNldE9wdGlvbnMob3B0aW9ucylcbiAgICAgICAgfSxcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldE9wdGlvbnMoW10pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb250cm9sbGVyLmFib3J0KClcbiAgICB9XG4gIH0sIFt2YWx1ZS50ZXh0XSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByYXdUb2tlbnMgPSB2YWx1ZS50ZXh0LnNwbGl0KC9bICgpKV0rLylcbiAgICBsZXQgam9pblRva2VucyA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYXdUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGpvaW5Ub2tlbnMucHVzaChyYXdUb2tlbnMuc2xpY2UoaSwgcmF3VG9rZW5zLmxlbmd0aCkuam9pbignICcpLnRyaW0oKSlcbiAgICB9XG4gICAgc2V0VG9rZW5zKGpvaW5Ub2tlbnMpXG4gIH0sIFt2YWx1ZS50ZXh0XSlcbiAgY29uc3QgZ2V0T3B0aW9uTGFiZWwgPSAob3B0aW9uOiBhbnkpID0+IHtcbiAgICBpZiAoIW9wdGlvbiB8fCAhb3B0aW9uLnRva2VuKSByZXR1cm4gJydcbiAgICBpZiAob3B0aW9uLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgcmV0dXJuIG9wdGlvbi50b2tlblxuICB9XG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IChlOiBSZWFjdC5TeW50aGV0aWNFdmVudCkgPT4ge1xuICAgIGlmICghdmFsdWUuZXJyb3IgJiYgKCFpc09wZW4gfHwgY3VycmVudE9wdGlvbnMubGVuZ3RoID09PSAwKSkge1xuICAgICAgZGlzcGF0Y2hFbnRlcktleVN1Ym1pdEV2ZW50KGUpXG4gICAgfVxuICB9XG4gIC8vIFVzZWQgdG8gZGV0ZXJtaW5lIHdoYXQgd2UgY2FuIGdvIGZvciBuZXh0IGluIGNvbnRleHQgdGhlIHRoZSBwcmV2aW91cy5cbiAgY29uc3QgZmlsdGVyT3B0aW9ucyA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgIChvcHRpb25zVG9GaWx0ZXI6IGFueSkgPT4ge1xuICAgICAgY29uc3QgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXVxuICAgICAgaWYgKGxhc3RUb2tlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfSBlbHNlIGlmIChsYXN0VG9rZW4gPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zVG9GaWx0ZXJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHN0cmlwcGVkT3B0aW9ucyA9IG9wdGlvbnNUb0ZpbHRlci5tYXAoKG86IGFueSkgPT4gKHtcbiAgICAgICAgICB0b2tlbjogby50b2tlbixcbiAgICAgICAgfSkpXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkT3B0aW9ucyA9IGRlZmF1bHRGaWx0ZXJPcHRpb25zKHN0cmlwcGVkT3B0aW9ucywge1xuICAgICAgICAgIGlucHV0VmFsdWU6IGxhc3RUb2tlbixcbiAgICAgICAgICBnZXRPcHRpb25MYWJlbCxcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgZmxhdEZpbHRlcmVkT3B0aW9ucyA9IGZpbHRlcmVkT3B0aW9ucy5tYXAoKG8pID0+IChvIGFzIGFueSkudG9rZW4pXG4gICAgICAgIGNvbnN0IHJlY29uc3RydWN0ZWRPcHRpb25zID0gb3B0aW9uc1RvRmlsdGVyLmZpbHRlcigobzogYW55KSA9PlxuICAgICAgICAgIGZsYXRGaWx0ZXJlZE9wdGlvbnMuaW5jbHVkZXMoby50b2tlbilcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3RlZE9wdGlvbnNcbiAgICAgIH1cbiAgICB9LFxuICAgIFt0b2tlbnNdXG4gIClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodmFsdWUudGV4dCkge1xuICAgICAgaWYgKHN1Z2dlc3Rpb24gPT09ICdBTkQnIHx8IHN1Z2dlc3Rpb24gPT09ICdPUicpIHtcbiAgICAgICAgaW5wdXRSZWY/LmN1cnJlbnQ/LnNldFNlbGVjdGlvblJhbmdlKGN1cnNvckxvY2F0aW9uLCBjdXJzb3JMb2NhdGlvbilcbiAgICAgICAgc2V0U3VnZ2VzdGlvbignJylcbiAgICAgIH1cbiAgICB9XG4gIH0sIFt2YWx1ZS50ZXh0XSlcbiAgY29uc3QgaGFuZGxlVGV4dENoYW5nZSA9IChlOiBhbnkpID0+IHtcbiAgICBvbkNoYW5nZSh7XG4gICAgICAuLi52YWx1ZSxcbiAgICAgIHRleHQ6IGUudGFyZ2V0LnZhbHVlLFxuICAgIH0pXG4gIH1cbiAgY29uc3QgaGFuZGxlVGV4dENsZWFyID0gKCkgPT4ge1xuICAgIG9uQ2hhbmdlKHsgLi4uZGVmYXVsdFZhbHVlLCB0ZXh0OiAnJyB9KVxuICB9XG4gIGNvbnN0IGdldExvZ2ljYWxPcGVyYXRvcnMgPSAob3B0aW9uczogYW55KSA9PiB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZmlsdGVyKChvcHRpb246IGFueSkgPT4gb3B0aW9uLnR5cGUgPT09ICdsb2dpY2FsJylcbiAgfVxuICBjb25zdCBnZXRUb2tlblRvUmVtb3ZlID0gKHN1Z2dlc3Rpb246IE9wdGlvbikgPT4ge1xuICAgIGxldCB0b2tlblRvUmVtb3ZlID0gJydcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWF0Y2ggPSBzdWdnZXN0aW9uLnRva2VuXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5tYXRjaCh0b2tlbnNbaV0udG9Mb3dlckNhc2UoKSlcbiAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFswXSkge1xuICAgICAgICB0b2tlblRvUmVtb3ZlID0gdG9rZW5zW2ldXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b2tlblRvUmVtb3ZlXG4gIH1cbiAgY29uc3QgY3VycmVudE9wdGlvbnMgPSBmaWx0ZXJPcHRpb25zKGdldExvZ2ljYWxPcGVyYXRvcnMob3B0aW9ucykpLnNvcnQoXG4gICAgKG8xOiBhbnkpID0+IChvMT8udHlwZSA9PT0gJ21hbmRhdG9yeScgPyAtMSA6IDEpXG4gIClcbiAgcmV0dXJuIChcbiAgICA8Rm9ybUNvbnRyb2wgZnVsbFdpZHRoIHsuLi5wcm9wcy5Gb3JtQ29udHJvbFByb3BzfT5cbiAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgZmlsdGVyT3B0aW9ucz17KG9wdGlvbnNUb0ZpbHRlcikgPT4gb3B0aW9uc1RvRmlsdGVyfVxuICAgICAgICBvbk9wZW49eygpID0+IHtcbiAgICAgICAgICBzZXRJc09wZW4odHJ1ZSlcbiAgICAgICAgfX1cbiAgICAgICAgb3Blbj17aXNPcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNPcGVuKGZhbHNlKVxuICAgICAgICB9fVxuICAgICAgICBvcHRpb25zPXtjdXJyZW50T3B0aW9uc31cbiAgICAgICAgaW5jbHVkZUlucHV0SW5MaXN0PXt0cnVlfVxuICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIHN1Z2dlc3Rpb246IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHN1Z2dlc3Rpb24gJiZcbiAgICAgICAgICAgIHN1Z2dlc3Rpb24udG9rZW4gJiZcbiAgICAgICAgICAgIHN1Z2dlc3Rpb24udG9rZW4gIT09IHZhbHVlLnRleHRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFN1Z2dlc3Rpb24gPSBvcHRpb25Ub1ZhbHVlKHN1Z2dlc3Rpb24pLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFN1Z2dlc3Rpb24gPT09ICdOT1QnKSB7XG4gICAgICAgICAgICAgIHNlbGVjdGVkU3VnZ2VzdGlvbiA9ICdOT1QgKCknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRTdWdnZXN0aW9uKHNlbGVjdGVkU3VnZ2VzdGlvbilcbiAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGlucHV0UmVmLmN1cnJlbnQ/LnNlbGVjdGlvblN0YXJ0XG4gICAgICAgICAgICBjb25zdCB0b2tlblRvUmVtb3ZlID0gZ2V0VG9rZW5Ub1JlbW92ZShzdWdnZXN0aW9uKVxuICAgICAgICAgICAgbGV0IG5ld0lucHV0VmFsdWUgPSB2YWx1ZS50ZXh0XG4gICAgICAgICAgICBpZiAodG9rZW5Ub1JlbW92ZSAhPT0gJycgJiYgY3Vyc29yICYmIGN1cnNvciA8IHZhbHVlLnRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBvc3RUZXh0ID0gdmFsdWUudGV4dC5zdWJzdHIoY3Vyc29yLCB2YWx1ZS50ZXh0Lmxlbmd0aClcbiAgICAgICAgICAgICAgY29uc3QgcHJlVGV4dCA9IHZhbHVlLnRleHQuc2xpY2UoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAodG9rZW5Ub1JlbW92ZS5sZW5ndGggKyBwb3N0VGV4dC5sZW5ndGgpICogLTFcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgICAgLi4udmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dDogYCR7cHJlVGV4dH0ke3NlbGVjdGVkU3VnZ2VzdGlvbn0ke3Bvc3RUZXh0fWAsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGNvbnN0IHN0ciA9IGAke3ByZVRleHR9JHtzZWxlY3RlZFN1Z2dlc3Rpb259YFxuICAgICAgICAgICAgICBzZXRDdXJzb3JMb2NhdGlvbihzdHIubGVuZ3RoKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0b2tlblRvUmVtb3ZlICE9PSAnJykge1xuICAgICAgICAgICAgICBuZXdJbnB1dFZhbHVlID0gdmFsdWUudGV4dC5zbGljZSgwLCB0b2tlblRvUmVtb3ZlLmxlbmd0aCAqIC0xKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJzb3IgJiYgY3Vyc29yIDwgdmFsdWUudGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY29uc3QgcHJlVGV4dCA9IHZhbHVlLnRleHQuc3Vic3RyKDAsIGN1cnNvcikudHJpbSgpXG4gICAgICAgICAgICAgIGNvbnN0IHBvc3RUZXh0ID0gdmFsdWUudGV4dC5zdWJzdHIoY3Vyc29yLCB2YWx1ZS50ZXh0Lmxlbmd0aClcbiAgICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3ByZVRleHR9ICR7c2VsZWN0ZWRTdWdnZXN0aW9ufSR7cG9zdFRleHR9YCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgY29uc3Qgc3RyID0gYCR7cHJlVGV4dH0gJHtzZWxlY3RlZFN1Z2dlc3Rpb259YFxuICAgICAgICAgICAgICBzZXRDdXJzb3JMb2NhdGlvbihzdHIubGVuZ3RoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IgPj0gdmFsdWUudGV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgbGV0IG5ld0lucHV0ID0gYCR7bmV3SW5wdXRWYWx1ZX0ke3NlbGVjdGVkU3VnZ2VzdGlvbn0gYFxuICAgICAgICAgICAgICBvbkNoYW5nZSh7XG4gICAgICAgICAgICAgICAgLi4udmFsdWUsXG4gICAgICAgICAgICAgICAgdGV4dDogbmV3SW5wdXQsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHNldEN1cnNvckxvY2F0aW9uKG5ld0lucHV0Lmxlbmd0aCArIDEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgICBpbnB1dFZhbHVlPXt2YWx1ZS50ZXh0fVxuICAgICAgICBnZXRPcHRpb25MYWJlbD17Z2V0T3B0aW9uTGFiZWx9XG4gICAgICAgIG11bHRpcGxlPXtmYWxzZX1cbiAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICBkaXNhYmxlQ2xvc2VPblNlbGVjdFxuICAgICAgICBmcmVlU29sb1xuICAgICAgICBpZD17aWR9XG4gICAgICAgIHJlbmRlck9wdGlvbj17KG9wdGlvbikgPT4gKFxuICAgICAgICAgIDxUeXBvZ3JhcGh5IG5vV3JhcD57b3B0aW9uVG9WYWx1ZShvcHRpb24pfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgKX1cbiAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICBkYXRhLWlkPVwic2VhcmNoLWlucHV0XCJcbiAgICAgICAgICAgICAgey4uLnBhcmFtc31cbiAgICAgICAgICAgICAgb25LZXlVcD17KGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgIGhhbmRsZVN1Ym1pdChlKVxuICAgICAgICAgICAgICAgICAgc2V0SXNPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3BsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICBpbnB1dFJlZj17aW5wdXRSZWZ9XG4gICAgICAgICAgICAgIHNpemU9eydzbWFsbCd9XG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVUZXh0Q2hhbmdlfVxuICAgICAgICAgICAgICB2YWx1ZT17dmFsdWUudGV4dH1cbiAgICAgICAgICAgICAgaGVscGVyVGV4dD17dmFsdWUuZXJyb3IgPyA8PntlcnJvck1lc3NhZ2V9PC8+IDogJyd9XG4gICAgICAgICAgICAgIElucHV0UHJvcHM9e3tcbiAgICAgICAgICAgICAgICAuLi5wYXJhbXMuSW5wdXRQcm9wcyxcbiAgICAgICAgICAgICAgICBzdGFydEFkb3JubWVudDogKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAge2xvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPENpcmN1bGFyUHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9ezIwfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luUmlnaHQ6IDEzLCBtYXJnaW5MZWZ0OiAyIH19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8VmFsaWRhdGlvbkluZGljYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVscGVyTWVzc2FnZT17dmFsdWUuZXJyb3IgPyBlcnJvck1lc3NhZ2UgOiAnVmFsaWQnfVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I9e3ZhbHVlLmVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGVuZEFkb3JubWVudDogKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgeyFkaXNhYmxlQ2xlYXJhYmxlICYmICEhdmFsdWUudGV4dCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEljb25CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVRleHRDbGVhcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICcycHgnIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxDbGVhckljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8SWNvbkJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRJc09wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVTdWJtaXQoZSlcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt2YWx1ZS5lcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAnMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJsYXJnZVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8U2VhcmNoSWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSxcblxuICAgICAgICAgICAgICAgIC4uLnByb3BzLklucHV0UHJvcHMsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHsuLi5wcm9wcy5UZXh0RmllbGRQcm9wc31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICB7Li4ucHJvcHMuQXV0b2NvbXBsZXRlUHJvcHN9XG4gICAgICAvPlxuICAgIDwvRm9ybUNvbnRyb2w+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IFNoYXBlVmFsaWRhdG9yXG4iXX0=