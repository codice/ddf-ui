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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi1zZWFyY2gtYmFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9ib29sZWFuLXNlYXJjaC1iYXIvYm9vbGVhbi1zZWFyY2gtYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUNBQWlDO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sZ0JBQWdCLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0QsT0FBTyxXQUFpQyxNQUFNLDJCQUEyQixDQUFBO0FBQ3pFLE9BQU8sU0FBNkIsTUFBTSx5QkFBeUIsQ0FBQTtBQUNuRSxPQUFPLFlBQVksRUFBRSxFQUVuQixtQkFBbUIsR0FDcEIsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuQyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUVoQyxPQUFPLHFCQUFxQixNQUFNLHlCQUF5QixDQUFBO0FBQzNELE9BQU8sbUJBQW1CLE1BQU0sd0JBQXdCLENBQUE7QUFDeEQsT0FBTyxFQUNMLFFBQVEsRUFDUixnQkFBZ0IsRUFDaEIsV0FBVyxHQUVaLE1BQU0sd0JBQXdCLENBQUE7QUFDL0IsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFFakQsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxVQUFVLE1BQU0sNEJBQTRCLENBQUE7QUFDbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUMvRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxJQUFNLG9CQUFvQixHQUFHLG1C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Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIENvcHlyaWdodCAoYykgQ29ubmV4dGEsIExMQyAqL1xuaW1wb3J0IFR5cG9ncmFwaHkgZnJvbSAnQG11aS9tYXRlcmlhbC9UeXBvZ3JhcGh5J1xuaW1wb3J0IENpcmN1bGFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9DaXJjdWxhclByb2dyZXNzJ1xuaW1wb3J0IEZvcm1Db250cm9sLCB7IEZvcm1Db250cm9sUHJvcHMgfSBmcm9tICdAbXVpL21hdGVyaWFsL0Zvcm1Db250cm9sJ1xuaW1wb3J0IFRleHRGaWVsZCwgeyBUZXh0RmllbGRQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSwge1xuICBBdXRvY29tcGxldGVQcm9wcyxcbiAgY3JlYXRlRmlsdGVyT3B0aW9ucyxcbn0gZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQm9vbGVhblRleHRUeXBlIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB1c2VCb29sZWFuU2VhcmNoRXJyb3IgZnJvbSAnLi91c2VCb29sZWFuU2VhcmNoRXJyb3InXG5pbXBvcnQgVmFsaWRhdGlvbkluZGljYXRvciBmcm9tICcuL3ZhbGlkYXRpb24taW5kaWNhdG9yJ1xuaW1wb3J0IHtcbiAgZmV0Y2hDcWwsXG4gIGZldGNoU3VnZ2VzdGlvbnMsXG4gIGdldFJhbmRvbUlkLFxuICBPcHRpb24sXG59IGZyb20gJy4vYm9vbGVhbi1zZWFyY2gtdXRpbHMnXG5pbXBvcnQgSWNvbkJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0ljb25CdXR0b24nXG5pbXBvcnQgeyBJbnB1dFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9JbnB1dCdcbmltcG9ydCBDbGVhckljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DbGVhcidcbmltcG9ydCBTZWFyY2hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvU2VhcmNoJ1xuaW1wb3J0IHsgdXNlVXBkYXRlRWZmZWN0IH0gZnJvbSAncmVhY3QtdXNlJ1xuaW1wb3J0IHsgZGlzcGF0Y2hFbnRlcktleVN1Ym1pdEV2ZW50IH0gZnJvbSAnLi4vY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcbmNvbnN0IGRlZmF1bHRGaWx0ZXJPcHRpb25zID0gY3JlYXRlRmlsdGVyT3B0aW9ucygpXG50eXBlIFByb3BzID0ge1xuICB2YWx1ZTogQm9vbGVhblRleHRUeXBlXG4gIG9uQ2hhbmdlOiAodmFsdWU6IEJvb2xlYW5UZXh0VHlwZSkgPT4gdm9pZFxuICBwcm9wZXJ0eT86IHN0cmluZ1xuICBkaXNhYmxlQ2xlYXJhYmxlPzogYm9vbGVhblxuICBwbGFjZWhvbGRlcj86IFRleHRGaWVsZFByb3BzWydwbGFjZWhvbGRlciddXG4gIEZvcm1Db250cm9sUHJvcHM/OiBGb3JtQ29udHJvbFByb3BzXG4gIFRleHRGaWVsZFByb3BzPzogUGFydGlhbDxUZXh0RmllbGRQcm9wcz5cbiAgQXV0b2NvbXBsZXRlUHJvcHM/OiBBdXRvY29tcGxldGVQcm9wczxPcHRpb24sIGZhbHNlLCB0cnVlLCB0cnVlPlxuICBJbnB1dFByb3BzPzogSW5wdXRQcm9wc1xufVxuY29uc3QgV0lMRF9DQVJEID0gJyonXG5jb25zdCBkZWZhdWx0VmFsdWU6IEJvb2xlYW5UZXh0VHlwZSA9IHtcbiAgdGV4dDogJycsXG4gIGNxbDogJycsXG4gIGVycm9yOiBmYWxzZSxcbn1cbmNvbnN0IHZhbGlkYXRlU2hhcGUgPSAoeyB2YWx1ZSwgb25DaGFuZ2UgfTogUHJvcHMpID0+IHtcbiAgaWYgKFxuICAgIHZhbHVlLnRleHQgPT09IHVuZGVmaW5lZCB8fFxuICAgIHZhbHVlLmNxbCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgdmFsdWUuZXJyb3IgPT09IHVuZGVmaW5lZFxuICApIHtcbiAgICBvbkNoYW5nZShkZWZhdWx0VmFsdWUpXG4gIH1cbn1cbmNvbnN0IFNoYXBlVmFsaWRhdG9yID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHZhbGlkYXRlU2hhcGUocHJvcHMpXG4gIH0pXG4gIGlmIChwcm9wcy52YWx1ZS50ZXh0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gPEJvb2xlYW5TZWFyY2hCYXIgey4uLnByb3BzfSAvPlxuICB9XG4gIHJldHVybiBudWxsXG59XG4vKipcbiAqIFdlIHdhbnQgdG8gdGFrZSBpbiBhIHZhbHVlLCBhbmQgb25DaGFuZ2UgdXBkYXRlIGl0LiAgVGhhdCB3b3VsZCB0aGVuIGZsb3cgYSBuZXcgdmFsdWVcbiAqIGJhY2sgZG93bi5cbiAqL1xuY29uc3QgQm9vbGVhblNlYXJjaEJhciA9ICh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgcHJvcGVydHkgPSAnYW55VGV4dCcsXG4gIHBsYWNlaG9sZGVyLFxuICBkaXNhYmxlQ2xlYXJhYmxlLFxuICAuLi5wcm9wc1xufTogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBjb25maWcgfSA9IHVzZUNvbmZpZ3VyYXRpb24oKVxuICBpZiAocGxhY2Vob2xkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIHBsYWNlaG9sZGVyID0gYFNlYXJjaCAke2NvbmZpZz8uY3VzdG9tQnJhbmRpbmd9ICR7Y29uZmlnPy5wcm9kdWN0fWBcbiAgfVxuICBjb25zdCBbaXNPcGVuLCBzZXRJc09wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHsgZXJyb3JNZXNzYWdlIH0gPSB1c2VCb29sZWFuU2VhcmNoRXJyb3IodmFsdWUpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc3VnZ2VzdGlvbiwgc2V0U3VnZ2VzdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW2lkXSA9IFJlYWN0LnVzZVN0YXRlKGdldFJhbmRvbUlkKCkpXG4gIGNvbnN0IFtjdXJzb3JMb2NhdGlvbiwgc2V0Q3Vyc29yTG9jYXRpb25dID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW3Rva2Vucywgc2V0VG9rZW5zXSA9IFJlYWN0LnVzZVN0YXRlPHN0cmluZ1tdPihbXSlcbiAgY29uc3QgaW5wdXRSZWYgPSBSZWFjdC51c2VSZWY8SFRNTElucHV0RWxlbWVudD4oKVxuICBjb25zdCBvcHRpb25Ub1ZhbHVlID0gKG9wdGlvbjogYW55KSA9PiBvcHRpb24udG9rZW5cbiAgY29uc3QgW29wdGlvbnMsIHNldE9wdGlvbnNdID0gdXNlU3RhdGU8T3B0aW9uW10+KFtdKVxuICBjb25zdCBpc1ZhbGlkQmVnaW5uaW5nVG9rZW4gPSAocXVlcnk6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHRyaW1tZWRUb2tlbiA9IHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKFxuICAgICAgdHJpbW1lZFRva2VuID09PSAnbm90JyB8fFxuICAgICAgdHJpbW1lZFRva2VuID09PSAnYW5kJyB8fFxuICAgICAgdHJpbW1lZFRva2VuID09PSAnb3InXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICB1c2VVcGRhdGVFZmZlY3QoKCkgPT4ge1xuICAgIHZhciBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpXG4gICAgc2V0TG9hZGluZyh0cnVlKVxuICAgIC8vIHdoZW4gZW1wdHksIGludGVycHJldCBhcyB3aWxkY2FyZFxuICAgIGNvbnN0IHNlYXJjaFZhbCA9IHZhbHVlLnRleHQgPT09ICcnID8gV0lMRF9DQVJEIDogdmFsdWUudGV4dFxuICAgIGlmIChzZWFyY2hWYWwgJiYgaXNWYWxpZEJlZ2lubmluZ1Rva2VuKHZhbHVlLnRleHQpKSB7XG4gICAgICBmZXRjaENxbCh7XG4gICAgICAgIHNlYXJjaFRleHQ6IHNlYXJjaFZhbCxcbiAgICAgICAgc2VhcmNoUHJvcGVydHk6IHByb3BlcnR5LFxuICAgICAgICBjYWxsYmFjazogKHsgY3FsID0gJycsIGVycm9yLCBlcnJvck1lc3NhZ2UgfSkgPT4ge1xuICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgY3FsLFxuICAgICAgICAgICAgZXJyb3I6ICEhZXJyb3IsXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgICB9LFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgLi4udmFsdWUsXG4gICAgICAgIGNxbDogJycsXG4gICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNvbnRyb2xsZXIuYWJvcnQoKVxuICAgIH1cbiAgfSwgW3ZhbHVlLnRleHQsIHByb3BlcnR5XSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB2YXIgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKVxuICAgIGlmICh2YWx1ZS50ZXh0ICE9PSBudWxsICYmIGlzVmFsaWRCZWdpbm5pbmdUb2tlbih2YWx1ZS50ZXh0KSkge1xuICAgICAgZmV0Y2hTdWdnZXN0aW9ucyh7XG4gICAgICAgIHRleHQ6IHZhbHVlLnRleHQsXG4gICAgICAgIGNhbGxiYWNrOiAoeyBvcHRpb25zIH0pID0+IHtcbiAgICAgICAgICBzZXRPcHRpb25zKG9wdGlvbnMpXG4gICAgICAgIH0sXG4gICAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRPcHRpb25zKFtdKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29udHJvbGxlci5hYm9ydCgpXG4gICAgfVxuICB9LCBbdmFsdWUudGV4dF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcmF3VG9rZW5zID0gdmFsdWUudGV4dC5zcGxpdCgvWyAoKSldKy8pXG4gICAgbGV0IGpvaW5Ub2tlbnMgPSBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmF3VG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBqb2luVG9rZW5zLnB1c2gocmF3VG9rZW5zLnNsaWNlKGksIHJhd1Rva2Vucy5sZW5ndGgpLmpvaW4oJyAnKS50cmltKCkpXG4gICAgfVxuICAgIHNldFRva2Vucyhqb2luVG9rZW5zKVxuICB9LCBbdmFsdWUudGV4dF0pXG4gIGNvbnN0IGdldE9wdGlvbkxhYmVsID0gKG9wdGlvbjogYW55KSA9PiB7XG4gICAgaWYgKCFvcHRpb24gfHwgIW9wdGlvbi50b2tlbikgcmV0dXJuICcnXG4gICAgaWYgKG9wdGlvbi5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIHJldHVybiBvcHRpb24udG9rZW5cbiAgfVxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSAoZTogUmVhY3QuU3ludGhldGljRXZlbnQpID0+IHtcbiAgICBpZiAoIXZhbHVlLmVycm9yICYmICghaXNPcGVuIHx8IGN1cnJlbnRPcHRpb25zLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgIGRpc3BhdGNoRW50ZXJLZXlTdWJtaXRFdmVudChlKVxuICAgIH1cbiAgfVxuICAvLyBVc2VkIHRvIGRldGVybWluZSB3aGF0IHdlIGNhbiBnbyBmb3IgbmV4dCBpbiBjb250ZXh0IHRoZSB0aGUgcHJldmlvdXMuXG4gIGNvbnN0IGZpbHRlck9wdGlvbnMgPSBSZWFjdC51c2VDYWxsYmFjayhcbiAgICAob3B0aW9uc1RvRmlsdGVyOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1cbiAgICAgIGlmIChsYXN0VG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH0gZWxzZSBpZiAobGFzdFRva2VuID09PSAnJykge1xuICAgICAgICByZXR1cm4gb3B0aW9uc1RvRmlsdGVyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzdHJpcHBlZE9wdGlvbnMgPSBvcHRpb25zVG9GaWx0ZXIubWFwKChvOiBhbnkpID0+ICh7XG4gICAgICAgICAgdG9rZW46IG8udG9rZW4sXG4gICAgICAgIH0pKVxuICAgICAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSBkZWZhdWx0RmlsdGVyT3B0aW9ucyhzdHJpcHBlZE9wdGlvbnMsIHtcbiAgICAgICAgICBpbnB1dFZhbHVlOiBsYXN0VG9rZW4sXG4gICAgICAgICAgZ2V0T3B0aW9uTGFiZWwsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGZsYXRGaWx0ZXJlZE9wdGlvbnMgPSBmaWx0ZXJlZE9wdGlvbnMubWFwKChvKSA9PiAobyBhcyBhbnkpLnRva2VuKVxuICAgICAgICBjb25zdCByZWNvbnN0cnVjdGVkT3B0aW9ucyA9IG9wdGlvbnNUb0ZpbHRlci5maWx0ZXIoKG86IGFueSkgPT5cbiAgICAgICAgICBmbGF0RmlsdGVyZWRPcHRpb25zLmluY2x1ZGVzKG8udG9rZW4pXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuIHJlY29uc3RydWN0ZWRPcHRpb25zXG4gICAgICB9XG4gICAgfSxcbiAgICBbdG9rZW5zXVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHZhbHVlLnRleHQpIHtcbiAgICAgIGlmIChzdWdnZXN0aW9uID09PSAnQU5EJyB8fCBzdWdnZXN0aW9uID09PSAnT1InKSB7XG4gICAgICAgIGlucHV0UmVmPy5jdXJyZW50Py5zZXRTZWxlY3Rpb25SYW5nZShjdXJzb3JMb2NhdGlvbiwgY3Vyc29yTG9jYXRpb24pXG4gICAgICAgIHNldFN1Z2dlc3Rpb24oJycpXG4gICAgICB9XG4gICAgfVxuICB9LCBbdmFsdWUudGV4dF0pXG4gIGNvbnN0IGhhbmRsZVRleHRDaGFuZ2UgPSAoZTogYW55KSA9PiB7XG4gICAgb25DaGFuZ2Uoe1xuICAgICAgLi4udmFsdWUsXG4gICAgICB0ZXh0OiBlLnRhcmdldC52YWx1ZSxcbiAgICB9KVxuICB9XG4gIGNvbnN0IGhhbmRsZVRleHRDbGVhciA9ICgpID0+IHtcbiAgICBvbkNoYW5nZSh7IC4uLmRlZmF1bHRWYWx1ZSwgdGV4dDogJycgfSlcbiAgfVxuICBjb25zdCBnZXRMb2dpY2FsT3BlcmF0b3JzID0gKG9wdGlvbnM6IGFueSkgPT4ge1xuICAgIHJldHVybiBvcHRpb25zLmZpbHRlcigob3B0aW9uOiBhbnkpID0+IG9wdGlvbi50eXBlID09PSAnbG9naWNhbCcpXG4gIH1cbiAgY29uc3QgZ2V0VG9rZW5Ub1JlbW92ZSA9IChzdWdnZXN0aW9uOiBPcHRpb24pID0+IHtcbiAgICBsZXQgdG9rZW5Ub1JlbW92ZSA9ICcnXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gc3VnZ2VzdGlvbi50b2tlblxuICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAubWF0Y2godG9rZW5zW2ldLnRvTG93ZXJDYXNlKCkpXG4gICAgICBpZiAobWF0Y2ggJiYgbWF0Y2hbMF0pIHtcbiAgICAgICAgdG9rZW5Ub1JlbW92ZSA9IHRva2Vuc1tpXVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG9rZW5Ub1JlbW92ZVxuICB9XG4gIGNvbnN0IGN1cnJlbnRPcHRpb25zID0gZmlsdGVyT3B0aW9ucyhnZXRMb2dpY2FsT3BlcmF0b3JzKG9wdGlvbnMpKS5zb3J0KFxuICAgIChvMTogYW55KSA9PiAobzE/LnR5cGUgPT09ICdtYW5kYXRvcnknID8gLTEgOiAxKVxuICApXG4gIHJldHVybiAoXG4gICAgPEZvcm1Db250cm9sIGZ1bGxXaWR0aCB7Li4ucHJvcHMuRm9ybUNvbnRyb2xQcm9wc30+XG4gICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgIGZpbHRlck9wdGlvbnM9eyhvcHRpb25zVG9GaWx0ZXIpID0+IG9wdGlvbnNUb0ZpbHRlcn1cbiAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNPcGVuKHRydWUpXG4gICAgICAgIH19XG4gICAgICAgIG9wZW49e2lzT3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4ge1xuICAgICAgICAgIHNldElzT3BlbihmYWxzZSlcbiAgICAgICAgfX1cbiAgICAgICAgb3B0aW9ucz17Y3VycmVudE9wdGlvbnN9XG4gICAgICAgIGluY2x1ZGVJbnB1dEluTGlzdD17dHJ1ZX1cbiAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBzdWdnZXN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBzdWdnZXN0aW9uICYmXG4gICAgICAgICAgICBzdWdnZXN0aW9uLnRva2VuICYmXG4gICAgICAgICAgICBzdWdnZXN0aW9uLnRva2VuICE9PSB2YWx1ZS50ZXh0XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWRTdWdnZXN0aW9uID0gb3B0aW9uVG9WYWx1ZShzdWdnZXN0aW9uKS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRTdWdnZXN0aW9uID09PSAnTk9UJykge1xuICAgICAgICAgICAgICBzZWxlY3RlZFN1Z2dlc3Rpb24gPSAnTk9UICgpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0U3VnZ2VzdGlvbihzZWxlY3RlZFN1Z2dlc3Rpb24pXG4gICAgICAgICAgICBjb25zdCBjdXJzb3IgPSBpbnB1dFJlZi5jdXJyZW50Py5zZWxlY3Rpb25TdGFydFxuICAgICAgICAgICAgY29uc3QgdG9rZW5Ub1JlbW92ZSA9IGdldFRva2VuVG9SZW1vdmUoc3VnZ2VzdGlvbilcbiAgICAgICAgICAgIGxldCBuZXdJbnB1dFZhbHVlID0gdmFsdWUudGV4dFxuICAgICAgICAgICAgaWYgKHRva2VuVG9SZW1vdmUgIT09ICcnICYmIGN1cnNvciAmJiBjdXJzb3IgPCB2YWx1ZS50ZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICBjb25zdCBwb3N0VGV4dCA9IHZhbHVlLnRleHQuc3Vic3RyKGN1cnNvciwgdmFsdWUudGV4dC5sZW5ndGgpXG4gICAgICAgICAgICAgIGNvbnN0IHByZVRleHQgPSB2YWx1ZS50ZXh0LnNsaWNlKFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgKHRva2VuVG9SZW1vdmUubGVuZ3RoICsgcG9zdFRleHQubGVuZ3RoKSAqIC0xXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3ByZVRleHR9JHtzZWxlY3RlZFN1Z2dlc3Rpb259JHtwb3N0VGV4dH1gLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBjb25zdCBzdHIgPSBgJHtwcmVUZXh0fSR7c2VsZWN0ZWRTdWdnZXN0aW9ufWBcbiAgICAgICAgICAgICAgc2V0Q3Vyc29yTG9jYXRpb24oc3RyLmxlbmd0aClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9rZW5Ub1JlbW92ZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgbmV3SW5wdXRWYWx1ZSA9IHZhbHVlLnRleHQuc2xpY2UoMCwgdG9rZW5Ub1JlbW92ZS5sZW5ndGggKiAtMSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3Vyc29yICYmIGN1cnNvciA8IHZhbHVlLnRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHByZVRleHQgPSB2YWx1ZS50ZXh0LnN1YnN0cigwLCBjdXJzb3IpLnRyaW0oKVxuICAgICAgICAgICAgICBjb25zdCBwb3N0VGV4dCA9IHZhbHVlLnRleHQuc3Vic3RyKGN1cnNvciwgdmFsdWUudGV4dC5sZW5ndGgpXG4gICAgICAgICAgICAgIG9uQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAuLi52YWx1ZSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBgJHtwcmVUZXh0fSAke3NlbGVjdGVkU3VnZ2VzdGlvbn0ke3Bvc3RUZXh0fWAsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGNvbnN0IHN0ciA9IGAke3ByZVRleHR9ICR7c2VsZWN0ZWRTdWdnZXN0aW9ufWBcbiAgICAgICAgICAgICAgc2V0Q3Vyc29yTG9jYXRpb24oc3RyLmxlbmd0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yID49IHZhbHVlLnRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGxldCBuZXdJbnB1dCA9IGAke25ld0lucHV0VmFsdWV9JHtzZWxlY3RlZFN1Z2dlc3Rpb259IGBcbiAgICAgICAgICAgICAgb25DaGFuZ2Uoe1xuICAgICAgICAgICAgICAgIC4uLnZhbHVlLFxuICAgICAgICAgICAgICAgIHRleHQ6IG5ld0lucHV0LFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzZXRDdXJzb3JMb2NhdGlvbihuZXdJbnB1dC5sZW5ndGggKyAxKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgICAgaW5wdXRWYWx1ZT17dmFsdWUudGV4dH1cbiAgICAgICAgZ2V0T3B0aW9uTGFiZWw9e2dldE9wdGlvbkxhYmVsfVxuICAgICAgICBtdWx0aXBsZT17ZmFsc2V9XG4gICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgZGlzYWJsZUNsb3NlT25TZWxlY3RcbiAgICAgICAgZnJlZVNvbG9cbiAgICAgICAgaWQ9e2lkfVxuICAgICAgICByZW5kZXJPcHRpb249eyhvcHRpb24pID0+IChcbiAgICAgICAgICA8VHlwb2dyYXBoeSBub1dyYXA+e29wdGlvblRvVmFsdWUob3B0aW9uKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICl9XG4gICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgZGF0YS1pZD1cInNlYXJjaC1pbnB1dFwiXG4gICAgICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgICAgIG9uS2V5VXA9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICAgICAgICBoYW5kbGVTdWJtaXQoZSlcbiAgICAgICAgICAgICAgICAgIHNldElzT3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtwbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgaW5wdXRSZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICBzaXplPXsnc21hbGwnfVxuICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlVGV4dENoYW5nZX1cbiAgICAgICAgICAgICAgdmFsdWU9e3ZhbHVlLnRleHR9XG4gICAgICAgICAgICAgIGhlbHBlclRleHQ9e3ZhbHVlLmVycm9yID8gPD57ZXJyb3JNZXNzYWdlfTwvPiA6ICcnfVxuICAgICAgICAgICAgICBJbnB1dFByb3BzPXt7XG4gICAgICAgICAgICAgICAgLi4ucGFyYW1zLklucHV0UHJvcHMsXG4gICAgICAgICAgICAgICAgc3RhcnRBZG9ybm1lbnQ6IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIHtsb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxDaXJjdWxhclByb2dyZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPXsyMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpblJpZ2h0OiAxMywgbWFyZ2luTGVmdDogMiB9fVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPFZhbGlkYXRpb25JbmRpY2F0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlck1lc3NhZ2U9e3ZhbHVlLmVycm9yID8gZXJyb3JNZXNzYWdlIDogJ1ZhbGlkJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yPXt2YWx1ZS5lcnJvcn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBlbmRBZG9ybm1lbnQ6IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIHshZGlzYWJsZUNsZWFyYWJsZSAmJiAhIXZhbHVlLnRleHQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVUZXh0Q2xlYXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAnMnB4JyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT1cImxhcmdlXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Q2xlYXJJY29uIGZvbnRTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPEljb25CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0SXNPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlU3VibWl0KGUpXG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dmFsdWUuZXJyb3J9XG4gICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzJweCcgfX1cbiAgICAgICAgICAgICAgICAgICAgICBzaXplPVwibGFyZ2VcIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPFNlYXJjaEljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICksXG5cbiAgICAgICAgICAgICAgICAuLi5wcm9wcy5JbnB1dFByb3BzLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICB7Li4ucHJvcHMuVGV4dEZpZWxkUHJvcHN9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIClcbiAgICAgICAgfX1cbiAgICAgICAgey4uLnByb3BzLkF1dG9jb21wbGV0ZVByb3BzfVxuICAgICAgLz5cbiAgICA8L0Zvcm1Db250cm9sPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShTaGFwZVZhbGlkYXRvcilcbiJdfQ==