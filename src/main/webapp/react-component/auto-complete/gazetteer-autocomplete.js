import { __assign, __awaiter, __generator, __read, __rest } from "tslib";
import React, { useCallback, useEffect, useState } from 'react';
import _debounce from 'lodash/debounce';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import RoomIcon from '@mui/icons-material/Room';
import DeleteIcon from '@mui/icons-material/Clear';
var GazetteerAutoComplete = function (_a) {
    var suggester = _a.suggester, _b = _a.debounce, debounce = _b === void 0 ? 350 : _b, _c = _a.minimumInputLength, minimumInputLength = _c === void 0 ? 3 : _c, onError = _a.onError, value = _a.value, props = __rest(_a, ["suggester", "debounce", "minimumInputLength", "onError", "value"]);
    var _d = __read(React.useState(value), 2), selected = _d[0], setSelected = _d[1];
    var _e = __read(useState(value), 2), input = _e[0], setInput = _e[1];
    var _f = __read(useState(false), 2), loading = _f[0], setLoading = _f[1];
    var _g = __read(useState([]), 2), suggestions = _g[0], setSuggestions = _g[1];
    var _h = __read(useState(null), 2), error = _h[0], setError = _h[1];
    var fetchSuggestionsFunc = function (input) { return __awaiter(void 0, void 0, void 0, function () {
        var suggestions_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!(input.length < minimumInputLength)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, suggester(input)];
                case 2:
                    suggestions_1 = _a.sent();
                    setSuggestions(suggestions_1);
                    setLoading(false);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    setLoading(false);
                    setError('Endpoint unavailable');
                    if (typeof onError === 'function')
                        onError(e_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var fetchSuggestions = useCallback(_debounce(fetchSuggestionsFunc, debounce), []);
    useEffect(function () {
        fetchSuggestions(input);
    }, [input]);
    var onChange = function (input) {
        setInput(input);
        setLoading(true);
        setSuggestions([]);
        setError(null);
    };
    var onValueSelect = function (_event, suggestion) {
        if (suggestion) {
            props.onChange(suggestion);
        }
        else {
            setInput('');
        }
    };
    var placeholder = input.length < minimumInputLength
        ? "Please enter ".concat(minimumInputLength, " or more characters")
        : undefined;
    var getNoOptionsText = function () {
        if (!input) {
            return 'Start typing to see suggestions';
        }
        else if (input.length < minimumInputLength) {
            var charactersToType = minimumInputLength - input.length;
            var pluralCharacter = charactersToType === 1 ? '' : 's';
            return "Type ".concat(charactersToType, " more character").concat(pluralCharacter, " to see suggestions");
        }
        else {
            return error || 'No results found';
        }
    };
    React.useEffect(function () {
        setSelected(Boolean(value));
    }, [value]);
    if (selected) {
        return (React.createElement(Chip, { className: "w-full px-2 justify-start rounded", style: { height: '42px' }, avatar: React.createElement(RoomIcon, null), label: React.createElement("div", { className: "flex flex-row flex-nowrap items-center" },
                React.createElement("div", { className: "shrink w-full truncate" }, value),
                React.createElement(Button, { color: "primary", className: "shrink-0", onClick: function () {
                        props.onChange(undefined);
                    } },
                    React.createElement(DeleteIcon, null))), variant: "outlined" }));
    }
    return (React.createElement(Autocomplete, { "data-id": "autocomplete", getOptionLabel: function (suggestion) { return suggestion.name; }, options: suggestions, loading: loading, loadingText: "Searching...", size: "small", onChange: onValueSelect, onBlur: function () { return setInput(''); }, noOptionsText: getNoOptionsText(), autoHighlight: true, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: props.variant || 'outlined', className: "my-0", size: "small", autoFocus: true, value: input, placeholder: props.placeholder || placeholder, onChange: function (e) { return onChange(e.target.value); }, InputProps: __assign(__assign({}, params.InputProps), { endAdornment: (React.createElement(React.Fragment, null,
                    loading && React.createElement(CircularProgress, { color: "inherit", size: 20 }),
                    params.InputProps.endAdornment)) }) }))); } }));
};
export default GazetteerAutoComplete;
//# sourceMappingURL=gazetteer-autocomplete.js.map