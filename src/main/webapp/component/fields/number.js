import { __assign, __read } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import TextField from '@mui/material/TextField';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
var defaultValue = 1;
function parseValue(value, type) {
    var parsedValue = defaultValue;
    if (type === 'integer') {
        parsedValue = parseInt(value);
    }
    else {
        parsedValue = parseFloat(value);
    }
    if (isNaN(parsedValue)) {
        return defaultValue;
    }
    else {
        return parsedValue;
    }
}
function useLocalValue(_a) {
    var value = _a.value, onChange = _a.onChange, type = _a.type, _b = _a.validation, validation = _b === void 0 ? function () { return true; } : _b, _c = _a.validationText, validationText = _c === void 0 ? 'Must be a valid number, using previous value of ' : _c;
    var _d = __read(React.useState(parseValue(value || '1', type)), 2), localValue = _d[0], setLocalValue = _d[1];
    var _e = __read(React.useState(false), 2), hasValidationIssues = _e[0], setHasValidationIssues = _e[1];
    var _f = __read(React.useState(''), 2), constructedValidationText = _f[0], setConstructedValidationText = _f[1];
    React.useEffect(function () {
        if (onChange &&
            typeof localValue === 'number' &&
            !isNaN(localValue) &&
            validation(localValue)) {
            setHasValidationIssues(false);
            onChange(localValue);
        }
        else {
            setConstructedValidationText(validationText + value);
            setHasValidationIssues(true);
        }
    }, [localValue, value]);
    return {
        localValue: localValue,
        setLocalValue: setLocalValue,
        hasValidationIssues: hasValidationIssues,
        constructedValidationText: constructedValidationText,
    };
}
export var NumberField = function (_a) {
    var value = _a.value, onChange = _a.onChange, type = _a.type, validation = _a.validation, validationText = _a.validationText, TextFieldProps = _a.TextFieldProps;
    var _b = useLocalValue({ value: value, onChange: onChange, type: type, validation: validation, validationText: validationText }), localValue = _b.localValue, setLocalValue = _b.setLocalValue, hasValidationIssues = _b.hasValidationIssues, constructedValidationText = _b.constructedValidationText;
    return (_jsx(TextField, __assign({ fullWidth: true, size: "small", variant: "outlined", value: localValue, type: "number", onChange: function (e) {
            if (onChange) {
                var inputValue = e.target.value;
                if (inputValue === '' || inputValue === '-') {
                    setLocalValue(inputValue);
                }
                else if (type === 'integer') {
                    setLocalValue(parseInt(inputValue));
                }
                else {
                    setLocalValue(parseFloat(inputValue));
                }
            }
        }, helperText: hasValidationIssues ? constructedValidationText : '', FormHelperTextProps: {
            error: true,
        } }, TextFieldProps, EnterKeySubmitProps)));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvbnVtYmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sU0FBNkIsTUFBTSx5QkFBeUIsQ0FBQTtBQUNuRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQWF2RSxJQUFNLFlBQVksR0FBRyxDQUFDLENBQUE7QUFFdEIsU0FBUyxVQUFVLENBQUMsS0FBYSxFQUFFLElBQW1CO0lBQ3BELElBQUksV0FBVyxHQUFHLFlBQVksQ0FBQTtJQUM5QixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN2QixXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQy9CLENBQUM7U0FBTSxDQUFDO1FBQ04sV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNqQyxDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUN2QixPQUFPLFlBQVksQ0FBQTtJQUNyQixDQUFDO1NBQU0sQ0FBQztRQUNOLE9BQU8sV0FBVyxDQUFBO0lBQ3BCLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsRUFNZjtRQUxOLEtBQUssV0FBQSxFQUNMLFFBQVEsY0FBQSxFQUNSLElBQUksVUFBQSxFQUNKLGtCQUF1QixFQUF2QixVQUFVLG1CQUFHLGNBQU0sT0FBQSxJQUFJLEVBQUosQ0FBSSxLQUFBLEVBQ3ZCLHNCQUFtRSxFQUFuRSxjQUFjLG1CQUFHLGtEQUFrRCxLQUFBO0lBRTdELElBQUEsS0FBQSxPQUE4QixLQUFLLENBQUMsUUFBUSxDQUNoRCxVQUFVLENBQUMsS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FDL0IsSUFBQSxFQUZNLFVBQVUsUUFBQSxFQUFFLGFBQWEsUUFFL0IsQ0FBQTtJQUNLLElBQUEsS0FBQSxPQUFnRCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQXBFLG1CQUFtQixRQUFBLEVBQUUsc0JBQXNCLFFBQXlCLENBQUE7SUFDckUsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSxFQURiLHlCQUF5QixRQUFBLEVBQUUsNEJBQTRCLFFBQzFDLENBQUE7SUFFcEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQ0UsUUFBUTtZQUNSLE9BQU8sVUFBVSxLQUFLLFFBQVE7WUFDOUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ2xCLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFDdEIsQ0FBQztZQUNELHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzdCLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN0QixDQUFDO2FBQU0sQ0FBQztZQUNOLDRCQUE0QixDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsQ0FBQTtZQUNwRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QixDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDdkIsT0FBTztRQUNMLFVBQVUsWUFBQTtRQUNWLGFBQWEsZUFBQTtRQUNiLG1CQUFtQixxQkFBQTtRQUNuQix5QkFBeUIsMkJBQUE7S0FDMUIsQ0FBQTtBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFBQyxFQU9wQjtRQU5OLEtBQUssV0FBQSxFQUNMLFFBQVEsY0FBQSxFQUNSLElBQUksVUFBQSxFQUNKLFVBQVUsZ0JBQUEsRUFDVixjQUFjLG9CQUFBLEVBQ2QsY0FBYyxvQkFBQTtJQUVSLElBQUEsS0FLRixhQUFhLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxRQUFRLFVBQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxVQUFVLFlBQUEsRUFBRSxjQUFjLGdCQUFBLEVBQUUsQ0FBQyxFQUp0RSxVQUFVLGdCQUFBLEVBQ1YsYUFBYSxtQkFBQSxFQUNiLG1CQUFtQix5QkFBQSxFQUNuQix5QkFBeUIsK0JBQzZDLENBQUE7SUFDeEUsT0FBTyxDQUNMLEtBQUMsU0FBUyxhQUNSLFNBQVMsUUFDVCxJQUFJLEVBQUMsT0FBTyxFQUNaLE9BQU8sRUFBQyxVQUFVLEVBQ2xCLEtBQUssRUFBRSxVQUFVLEVBQ2pCLElBQUksRUFBQyxRQUFRLEVBQ2IsUUFBUSxFQUFFLFVBQUMsQ0FBQztZQUNWLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ2IsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUE7Z0JBQ2pDLElBQUksVUFBVSxLQUFLLEVBQUUsSUFBSSxVQUFVLEtBQUssR0FBRyxFQUFFLENBQUM7b0JBQzVDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDM0IsQ0FBQztxQkFBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUUsQ0FBQztvQkFDOUIsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO2dCQUNyQyxDQUFDO3FCQUFNLENBQUM7b0JBQ04sYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO2dCQUN2QyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsRUFDRCxVQUFVLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ2hFLG1CQUFtQixFQUFFO1lBQ25CLEtBQUssRUFBRSxJQUFJO1NBQ1osSUFDRyxjQUFjLEVBQ2QsbUJBQW1CLEVBQ3ZCLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFRleHRGaWVsZCwgeyBUZXh0RmllbGRQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHsgRW50ZXJLZXlTdWJtaXRQcm9wcyB9IGZyb20gJy4uL2N1c3RvbS1ldmVudHMvZW50ZXIta2V5LXN1Ym1pdCdcblxudHlwZSBMb2NhbFZhbHVlVHlwZSA9IG51bWJlciB8ICcnIHwgJy0nXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHZhbHVlPzogc3RyaW5nXG4gIG9uQ2hhbmdlPzogKHZhbDogbnVtYmVyKSA9PiB2b2lkXG4gIHR5cGU6ICdpbnRlZ2VyJyB8ICdmbG9hdCdcbiAgVGV4dEZpZWxkUHJvcHM/OiBUZXh0RmllbGRQcm9wc1xuICB2YWxpZGF0aW9uPzogKHZhbDogbnVtYmVyKSA9PiBib29sZWFuXG4gIHZhbGlkYXRpb25UZXh0Pzogc3RyaW5nXG59XG5cbmNvbnN0IGRlZmF1bHRWYWx1ZSA9IDFcblxuZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWx1ZTogc3RyaW5nLCB0eXBlOiBQcm9wc1sndHlwZSddKSB7XG4gIGxldCBwYXJzZWRWYWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICBpZiAodHlwZSA9PT0gJ2ludGVnZXInKSB7XG4gICAgcGFyc2VkVmFsdWUgPSBwYXJzZUludCh2YWx1ZSlcbiAgfSBlbHNlIHtcbiAgICBwYXJzZWRWYWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpXG4gIH1cbiAgaWYgKGlzTmFOKHBhcnNlZFZhbHVlKSkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcGFyc2VkVmFsdWVcbiAgfVxufVxuXG5mdW5jdGlvbiB1c2VMb2NhbFZhbHVlKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxuICB0eXBlLFxuICB2YWxpZGF0aW9uID0gKCkgPT4gdHJ1ZSxcbiAgdmFsaWRhdGlvblRleHQgPSAnTXVzdCBiZSBhIHZhbGlkIG51bWJlciwgdXNpbmcgcHJldmlvdXMgdmFsdWUgb2YgJyxcbn06IFByb3BzKSB7XG4gIGNvbnN0IFtsb2NhbFZhbHVlLCBzZXRMb2NhbFZhbHVlXSA9IFJlYWN0LnVzZVN0YXRlPExvY2FsVmFsdWVUeXBlPihcbiAgICBwYXJzZVZhbHVlKHZhbHVlIHx8ICcxJywgdHlwZSlcbiAgKVxuICBjb25zdCBbaGFzVmFsaWRhdGlvbklzc3Vlcywgc2V0SGFzVmFsaWRhdGlvbklzc3Vlc10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvbnN0cnVjdGVkVmFsaWRhdGlvblRleHQsIHNldENvbnN0cnVjdGVkVmFsaWRhdGlvblRleHRdID1cbiAgICBSZWFjdC51c2VTdGF0ZSgnJylcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIG9uQ2hhbmdlICYmXG4gICAgICB0eXBlb2YgbG9jYWxWYWx1ZSA9PT0gJ251bWJlcicgJiZcbiAgICAgICFpc05hTihsb2NhbFZhbHVlKSAmJlxuICAgICAgdmFsaWRhdGlvbihsb2NhbFZhbHVlKVxuICAgICkge1xuICAgICAgc2V0SGFzVmFsaWRhdGlvbklzc3VlcyhmYWxzZSlcbiAgICAgIG9uQ2hhbmdlKGxvY2FsVmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldENvbnN0cnVjdGVkVmFsaWRhdGlvblRleHQodmFsaWRhdGlvblRleHQgKyB2YWx1ZSlcbiAgICAgIHNldEhhc1ZhbGlkYXRpb25Jc3N1ZXModHJ1ZSlcbiAgICB9XG4gIH0sIFtsb2NhbFZhbHVlLCB2YWx1ZV0pXG4gIHJldHVybiB7XG4gICAgbG9jYWxWYWx1ZSxcbiAgICBzZXRMb2NhbFZhbHVlLFxuICAgIGhhc1ZhbGlkYXRpb25Jc3N1ZXMsXG4gICAgY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCxcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTnVtYmVyRmllbGQgPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIHR5cGUsXG4gIHZhbGlkYXRpb24sXG4gIHZhbGlkYXRpb25UZXh0LFxuICBUZXh0RmllbGRQcm9wcyxcbn06IFByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBsb2NhbFZhbHVlLFxuICAgIHNldExvY2FsVmFsdWUsXG4gICAgaGFzVmFsaWRhdGlvbklzc3VlcyxcbiAgICBjb25zdHJ1Y3RlZFZhbGlkYXRpb25UZXh0LFxuICB9ID0gdXNlTG9jYWxWYWx1ZSh7IHZhbHVlLCBvbkNoYW5nZSwgdHlwZSwgdmFsaWRhdGlvbiwgdmFsaWRhdGlvblRleHQgfSlcbiAgcmV0dXJuIChcbiAgICA8VGV4dEZpZWxkXG4gICAgICBmdWxsV2lkdGhcbiAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgdmFsdWU9e2xvY2FsVmFsdWV9XG4gICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICBjb25zdCBpbnB1dFZhbHVlID0gZS50YXJnZXQudmFsdWVcbiAgICAgICAgICBpZiAoaW5wdXRWYWx1ZSA9PT0gJycgfHwgaW5wdXRWYWx1ZSA9PT0gJy0nKSB7XG4gICAgICAgICAgICBzZXRMb2NhbFZhbHVlKGlucHV0VmFsdWUpXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnaW50ZWdlcicpIHtcbiAgICAgICAgICAgIHNldExvY2FsVmFsdWUocGFyc2VJbnQoaW5wdXRWYWx1ZSkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldExvY2FsVmFsdWUocGFyc2VGbG9hdChpbnB1dFZhbHVlKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH19XG4gICAgICBoZWxwZXJUZXh0PXtoYXNWYWxpZGF0aW9uSXNzdWVzID8gY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCA6ICcnfVxuICAgICAgRm9ybUhlbHBlclRleHRQcm9wcz17e1xuICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgIH19XG4gICAgICB7Li4uVGV4dEZpZWxkUHJvcHN9XG4gICAgICB7Li4uRW50ZXJLZXlTdWJtaXRQcm9wc31cbiAgICAvPlxuICApXG59XG4iXX0=