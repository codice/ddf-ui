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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F6ZXR0ZWVyLWF1dG9jb21wbGV0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvYXV0by1jb21wbGV0ZS9nYXpldHRlZXItYXV0b2NvbXBsZXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUMvRCxPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUV2QyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLGdCQUFnQixNQUFNLGdDQUFnQyxDQUFBO0FBQzdELE9BQU8sU0FBNkIsTUFBTSx5QkFBeUIsQ0FBQTtBQUNuRSxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvQyxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQTtBQWFsRCxJQUFNLHFCQUFxQixHQUFHLFVBQUMsRUFPdkI7SUFOTixJQUFBLFNBQVMsZUFBQSxFQUNULGdCQUFjLEVBQWQsUUFBUSxtQkFBRyxHQUFHLEtBQUEsRUFDZCwwQkFBc0IsRUFBdEIsa0JBQWtCLG1CQUFHLENBQUMsS0FBQSxFQUN0QixPQUFPLGFBQUEsRUFDUCxLQUFLLFdBQUEsRUFDRixLQUFLLGNBTnFCLG1FQU85QixDQURTO0lBRUYsSUFBQSxLQUFBLE9BQTBCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBOUMsUUFBUSxRQUFBLEVBQUUsV0FBVyxRQUF5QixDQUFBO0lBQy9DLElBQUEsS0FBQSxPQUFvQixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBbEMsS0FBSyxRQUFBLEVBQUUsUUFBUSxRQUFtQixDQUFBO0lB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LEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBeEIsQ0FBd0IsRUFDekMsVUFBVSx3QkFDTCxNQUFNLENBQUMsVUFBVSxLQUNwQixZQUFZLEVBQUUsQ0FDWjtvQkFDRyxPQUFPLElBQUksb0JBQUMsZ0JBQWdCLElBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUUsRUFBRSxHQUFJO29CQUN6RCxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FDOUIsQ0FDSixPQUVILENBQ0gsRUFwQndCLENBb0J4QixHQUNELENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUscUJBQXFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBfZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJ1xuaW1wb3J0IHsgU3VnZ2VzdGlvbiB9IGZyb20gJy4uL2xvY2F0aW9uL2dhemV0dGVlcidcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgQ2lyY3VsYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0NpcmN1bGFyUHJvZ3Jlc3MnXG5pbXBvcnQgVGV4dEZpZWxkLCB7IFRleHRGaWVsZFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IENoaXAgZnJvbSAnQG11aS9tYXRlcmlhbC9DaGlwJ1xuaW1wb3J0IFJvb21JY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUm9vbSdcbmltcG9ydCBEZWxldGVJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2xlYXInXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHN1Z2dlc3RlcjogKGlucHV0OiBzdHJpbmcpID0+IFByb21pc2U8U3VnZ2VzdGlvbltdPlxuICBvbkNoYW5nZTogKHN1Z2dlc3Rpb24/OiBTdWdnZXN0aW9uKSA9PiBQcm9taXNlPHZvaWQ+XG4gIGRlYm91bmNlPzogbnVtYmVyXG4gIG1pbmltdW1JbnB1dExlbmd0aD86IG51bWJlclxuICBvbkVycm9yPzogYW55XG4gIHZhbHVlOiBhbnlcbiAgcGxhY2Vob2xkZXI/OiBzdHJpbmdcbiAgdmFyaWFudD86IFRleHRGaWVsZFByb3BzWyd2YXJpYW50J11cbn1cblxuY29uc3QgR2F6ZXR0ZWVyQXV0b0NvbXBsZXRlID0gKHtcbiAgc3VnZ2VzdGVyLFxuICBkZWJvdW5jZSA9IDM1MCxcbiAgbWluaW11bUlucHV0TGVuZ3RoID0gMyxcbiAgb25FcnJvcixcbiAgdmFsdWUsXG4gIC4uLnByb3BzXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IFJlYWN0LnVzZVN0YXRlKHZhbHVlKVxuICBjb25zdCBbaW5wdXQsIHNldElucHV0XSA9IHVzZVN0YXRlKHZhbHVlKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3N1Z2dlc3Rpb25zLCBzZXRTdWdnZXN0aW9uc10gPSB1c2VTdGF0ZTxTdWdnZXN0aW9uW10+KFtdKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG5cbiAgY29uc3QgZmV0Y2hTdWdnZXN0aW9uc0Z1bmMgPSBhc3luYyAoaW5wdXQ6IHN0cmluZykgPT4ge1xuICAgIGlmICghKGlucHV0Lmxlbmd0aCA8IG1pbmltdW1JbnB1dExlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0gYXdhaXQgc3VnZ2VzdGVyKGlucHV0KVxuICAgICAgICBzZXRTdWdnZXN0aW9ucyhzdWdnZXN0aW9ucylcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgICAgc2V0RXJyb3IoJ0VuZHBvaW50IHVuYXZhaWxhYmxlJylcbiAgICAgICAgaWYgKHR5cGVvZiBvbkVycm9yID09PSAnZnVuY3Rpb24nKSBvbkVycm9yKGUpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZmV0Y2hTdWdnZXN0aW9ucyA9IHVzZUNhbGxiYWNrKFxuICAgIF9kZWJvdW5jZShmZXRjaFN1Z2dlc3Rpb25zRnVuYywgZGVib3VuY2UpLFxuICAgIFtdXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGZldGNoU3VnZ2VzdGlvbnMoaW5wdXQpXG4gIH0sIFtpbnB1dF0pXG5cbiAgY29uc3Qgb25DaGFuZ2UgPSAoaW5wdXQ6IHN0cmluZykgPT4ge1xuICAgIHNldElucHV0KGlucHV0KVxuICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRTdWdnZXN0aW9ucyhbXSlcbiAgICBzZXRFcnJvcihudWxsKVxuICB9XG5cbiAgY29uc3Qgb25WYWx1ZVNlbGVjdCA9IChcbiAgICBfZXZlbnQ6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgIHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb25cbiAgKSA9PiB7XG4gICAgaWYgKHN1Z2dlc3Rpb24pIHtcbiAgICAgIHByb3BzLm9uQ2hhbmdlKHN1Z2dlc3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldElucHV0KCcnKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHBsYWNlaG9sZGVyID1cbiAgICBpbnB1dC5sZW5ndGggPCBtaW5pbXVtSW5wdXRMZW5ndGhcbiAgICAgID8gYFBsZWFzZSBlbnRlciAke21pbmltdW1JbnB1dExlbmd0aH0gb3IgbW9yZSBjaGFyYWN0ZXJzYFxuICAgICAgOiB1bmRlZmluZWRcblxuICBjb25zdCBnZXROb09wdGlvbnNUZXh0ID0gKCkgPT4ge1xuICAgIGlmICghaW5wdXQpIHtcbiAgICAgIHJldHVybiAnU3RhcnQgdHlwaW5nIHRvIHNlZSBzdWdnZXN0aW9ucydcbiAgICB9IGVsc2UgaWYgKGlucHV0Lmxlbmd0aCA8IG1pbmltdW1JbnB1dExlbmd0aCkge1xuICAgICAgY29uc3QgY2hhcmFjdGVyc1RvVHlwZSA9IG1pbmltdW1JbnB1dExlbmd0aCAtIGlucHV0Lmxlbmd0aFxuICAgICAgY29uc3QgcGx1cmFsQ2hhcmFjdGVyID0gY2hhcmFjdGVyc1RvVHlwZSA9PT0gMSA/ICcnIDogJ3MnXG4gICAgICByZXR1cm4gYFR5cGUgJHtjaGFyYWN0ZXJzVG9UeXBlfSBtb3JlIGNoYXJhY3RlciR7cGx1cmFsQ2hhcmFjdGVyfSB0byBzZWUgc3VnZ2VzdGlvbnNgXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlcnJvciB8fCAnTm8gcmVzdWx0cyBmb3VuZCdcbiAgICB9XG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRTZWxlY3RlZChCb29sZWFuKHZhbHVlKSlcbiAgfSwgW3ZhbHVlXSlcblxuICBpZiAoc2VsZWN0ZWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPENoaXBcbiAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTIganVzdGlmeS1zdGFydCByb3VuZGVkXCJcbiAgICAgICAgc3R5bGU9e3sgaGVpZ2h0OiAnNDJweCcgfX1cbiAgICAgICAgYXZhdGFyPXs8Um9vbUljb24gLz59XG4gICAgICAgIGxhYmVsPXtcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1yb3cgZmxleC1ub3dyYXAgaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNocmluayB3LWZ1bGwgdHJ1bmNhdGVcIj57dmFsdWV9PC9kaXY+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNocmluay0wXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHByb3BzLm9uQ2hhbmdlKHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPERlbGV0ZUljb24gLz5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICB9XG4gICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAvPlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEF1dG9jb21wbGV0ZVxuICAgICAgZGF0YS1pZD1cImF1dG9jb21wbGV0ZVwiXG4gICAgICBnZXRPcHRpb25MYWJlbD17KHN1Z2dlc3Rpb246IFN1Z2dlc3Rpb24pID0+IHN1Z2dlc3Rpb24ubmFtZX1cbiAgICAgIG9wdGlvbnM9e3N1Z2dlc3Rpb25zfVxuICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgIGxvYWRpbmdUZXh0PVwiU2VhcmNoaW5nLi4uXCJcbiAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICBvbkNoYW5nZT17b25WYWx1ZVNlbGVjdH1cbiAgICAgIG9uQmx1cj17KCkgPT4gc2V0SW5wdXQoJycpfVxuICAgICAgbm9PcHRpb25zVGV4dD17Z2V0Tm9PcHRpb25zVGV4dCgpfVxuICAgICAgYXV0b0hpZ2hsaWdodFxuICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgdmFyaWFudD17cHJvcHMudmFyaWFudCB8fCAnb3V0bGluZWQnfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm15LTBcIlxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgdmFsdWU9e2lucHV0fVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXtwcm9wcy5wbGFjZWhvbGRlciB8fCBwbGFjZWhvbGRlcn1cbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IG9uQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBJbnB1dFByb3BzPXt7XG4gICAgICAgICAgICAuLi5wYXJhbXMuSW5wdXRQcm9wcyxcbiAgICAgICAgICAgIGVuZEFkb3JubWVudDogKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIHtsb2FkaW5nICYmIDxDaXJjdWxhclByb2dyZXNzIGNvbG9yPVwiaW5oZXJpdFwiIHNpemU9ezIwfSAvPn1cbiAgICAgICAgICAgICAgICB7cGFyYW1zLklucHV0UHJvcHMuZW5kQWRvcm5tZW50fVxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICksXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYXpldHRlZXJBdXRvQ29tcGxldGVcbiJdfQ==