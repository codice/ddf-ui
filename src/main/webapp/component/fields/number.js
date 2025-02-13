import { __assign, __read } from "tslib";
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
    return (React.createElement(TextField, __assign({ fullWidth: true, size: "small", variant: "outlined", value: localValue, type: "number", onChange: function (e) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvbnVtYmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxTQUE2QixNQUFNLHlCQUF5QixDQUFBO0FBQ25FLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBYXZFLElBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQTtBQUV0QixTQUFTLFVBQVUsQ0FBQyxLQUFhLEVBQUUsSUFBbUI7SUFDcEQsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFBO0lBQzlCLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUN0QixXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzlCO1NBQU07UUFDTCxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ2hDO0lBQ0QsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDdEIsT0FBTyxZQUFZLENBQUE7S0FDcEI7U0FBTTtRQUNMLE9BQU8sV0FBVyxDQUFBO0tBQ25CO0FBQ0gsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBTWY7UUFMTixLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixJQUFJLFVBQUEsRUFDSixrQkFBdUIsRUFBdkIsVUFBVSxtQkFBRyxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksS0FBQSxFQUN2QixzQkFBbUUsRUFBbkUsY0FBYyxtQkFBRyxrREFBa0QsS0FBQTtJQUU3RCxJQUFBLEtBQUEsT0FBOEIsS0FBSyxDQUFDLFFBQVEsQ0FDaEQsVUFBVSxDQUFDLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQy9CLElBQUEsRUFGTSxVQUFVLFFBQUEsRUFBRSxhQUFhLFFBRS9CLENBQUE7SUFDSyxJQUFBLEtBQUEsT0FBZ0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUFwRSxtQkFBbUIsUUFBQSxFQUFFLHNCQUFzQixRQUF5QixDQUFBO0lBQ3JFLElBQUEsS0FBQSxPQUNKLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUEsRUFEYix5QkFBeUIsUUFBQSxFQUFFLDRCQUE0QixRQUMxQyxDQUFBO0lBRXBCLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUNFLFFBQVE7WUFDUixPQUFPLFVBQVUsS0FBSyxRQUFRO1lBQzlCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNsQixVQUFVLENBQUMsVUFBVSxDQUFDLEVBQ3RCO1lBQ0Esc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDN0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ3JCO2FBQU07WUFDTCw0QkFBNEIsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLENBQUE7WUFDcEQsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDN0I7SUFDSCxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUN2QixPQUFPO1FBQ0wsVUFBVSxZQUFBO1FBQ1YsYUFBYSxlQUFBO1FBQ2IsbUJBQW1CLHFCQUFBO1FBQ25CLHlCQUF5QiwyQkFBQTtLQUMxQixDQUFBO0FBQ0gsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxVQUFDLEVBT3BCO1FBTk4sS0FBSyxXQUFBLEVBQ0wsUUFBUSxjQUFBLEVBQ1IsSUFBSSxVQUFBLEVBQ0osVUFBVSxnQkFBQSxFQUNWLGNBQWMsb0JBQUEsRUFDZCxjQUFjLG9CQUFBO0lBRVIsSUFBQSxLQUtGLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLFFBQVEsVUFBQSxFQUFFLElBQUksTUFBQSxFQUFFLFVBQVUsWUFBQSxFQUFFLGNBQWMsZ0JBQUEsRUFBRSxDQUFDLEVBSnRFLFVBQVUsZ0JBQUEsRUFDVixhQUFhLG1CQUFBLEVBQ2IsbUJBQW1CLHlCQUFBLEVBQ25CLHlCQUF5QiwrQkFDNkMsQ0FBQTtJQUN4RSxPQUFPLENBQ0wsb0JBQUMsU0FBUyxhQUNSLFNBQVMsUUFDVCxJQUFJLEVBQUMsT0FBTyxFQUNaLE9BQU8sRUFBQyxVQUFVLEVBQ2xCLEtBQUssRUFBRSxVQUFVLEVBQ2pCLElBQUksRUFBQyxRQUFRLEVBQ2IsUUFBUSxFQUFFLFVBQUMsQ0FBQztZQUNWLElBQUksUUFBUSxFQUFFO2dCQUNaLElBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFBO2dCQUNqQyxJQUFJLFVBQVUsS0FBSyxFQUFFLElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRTtvQkFDM0MsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2lCQUMxQjtxQkFBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQzdCLGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtpQkFDcEM7cUJBQU07b0JBQ0wsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO2lCQUN0QzthQUNGO1FBQ0gsQ0FBQyxFQUNELFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFDaEUsbUJBQW1CLEVBQUU7WUFDbkIsS0FBSyxFQUFFLElBQUk7U0FDWixJQUNHLGNBQWMsRUFDZCxtQkFBbUIsRUFDdkIsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgVGV4dEZpZWxkLCB7IFRleHRGaWVsZFByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgeyBFbnRlcktleVN1Ym1pdFByb3BzIH0gZnJvbSAnLi4vY3VzdG9tLWV2ZW50cy9lbnRlci1rZXktc3VibWl0J1xuXG50eXBlIExvY2FsVmFsdWVUeXBlID0gbnVtYmVyIHwgJycgfCAnLSdcblxudHlwZSBQcm9wcyA9IHtcbiAgdmFsdWU/OiBzdHJpbmdcbiAgb25DaGFuZ2U/OiAodmFsOiBudW1iZXIpID0+IHZvaWRcbiAgdHlwZTogJ2ludGVnZXInIHwgJ2Zsb2F0J1xuICBUZXh0RmllbGRQcm9wcz86IFRleHRGaWVsZFByb3BzXG4gIHZhbGlkYXRpb24/OiAodmFsOiBudW1iZXIpID0+IGJvb2xlYW5cbiAgdmFsaWRhdGlvblRleHQ/OiBzdHJpbmdcbn1cblxuY29uc3QgZGVmYXVsdFZhbHVlID0gMVxuXG5mdW5jdGlvbiBwYXJzZVZhbHVlKHZhbHVlOiBzdHJpbmcsIHR5cGU6IFByb3BzWyd0eXBlJ10pIHtcbiAgbGV0IHBhcnNlZFZhbHVlID0gZGVmYXVsdFZhbHVlXG4gIGlmICh0eXBlID09PSAnaW50ZWdlcicpIHtcbiAgICBwYXJzZWRWYWx1ZSA9IHBhcnNlSW50KHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIHBhcnNlZFZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSlcbiAgfVxuICBpZiAoaXNOYU4ocGFyc2VkVmFsdWUpKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXJzZWRWYWx1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIHVzZUxvY2FsVmFsdWUoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIHR5cGUsXG4gIHZhbGlkYXRpb24gPSAoKSA9PiB0cnVlLFxuICB2YWxpZGF0aW9uVGV4dCA9ICdNdXN0IGJlIGEgdmFsaWQgbnVtYmVyLCB1c2luZyBwcmV2aW91cyB2YWx1ZSBvZiAnLFxufTogUHJvcHMpIHtcbiAgY29uc3QgW2xvY2FsVmFsdWUsIHNldExvY2FsVmFsdWVdID0gUmVhY3QudXNlU3RhdGU8TG9jYWxWYWx1ZVR5cGU+KFxuICAgIHBhcnNlVmFsdWUodmFsdWUgfHwgJzEnLCB0eXBlKVxuICApXG4gIGNvbnN0IFtoYXNWYWxpZGF0aW9uSXNzdWVzLCBzZXRIYXNWYWxpZGF0aW9uSXNzdWVzXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCwgc2V0Q29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlKCcnKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKFxuICAgICAgb25DaGFuZ2UgJiZcbiAgICAgIHR5cGVvZiBsb2NhbFZhbHVlID09PSAnbnVtYmVyJyAmJlxuICAgICAgIWlzTmFOKGxvY2FsVmFsdWUpICYmXG4gICAgICB2YWxpZGF0aW9uKGxvY2FsVmFsdWUpXG4gICAgKSB7XG4gICAgICBzZXRIYXNWYWxpZGF0aW9uSXNzdWVzKGZhbHNlKVxuICAgICAgb25DaGFuZ2UobG9jYWxWYWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0Q29uc3RydWN0ZWRWYWxpZGF0aW9uVGV4dCh2YWxpZGF0aW9uVGV4dCArIHZhbHVlKVxuICAgICAgc2V0SGFzVmFsaWRhdGlvbklzc3Vlcyh0cnVlKVxuICAgIH1cbiAgfSwgW2xvY2FsVmFsdWUsIHZhbHVlXSlcbiAgcmV0dXJuIHtcbiAgICBsb2NhbFZhbHVlLFxuICAgIHNldExvY2FsVmFsdWUsXG4gICAgaGFzVmFsaWRhdGlvbklzc3VlcyxcbiAgICBjb25zdHJ1Y3RlZFZhbGlkYXRpb25UZXh0LFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBOdW1iZXJGaWVsZCA9ICh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbiAgdHlwZSxcbiAgdmFsaWRhdGlvbixcbiAgdmFsaWRhdGlvblRleHQsXG4gIFRleHRGaWVsZFByb3BzLFxufTogUHJvcHMpID0+IHtcbiAgY29uc3Qge1xuICAgIGxvY2FsVmFsdWUsXG4gICAgc2V0TG9jYWxWYWx1ZSxcbiAgICBoYXNWYWxpZGF0aW9uSXNzdWVzLFxuICAgIGNvbnN0cnVjdGVkVmFsaWRhdGlvblRleHQsXG4gIH0gPSB1c2VMb2NhbFZhbHVlKHsgdmFsdWUsIG9uQ2hhbmdlLCB0eXBlLCB2YWxpZGF0aW9uLCB2YWxpZGF0aW9uVGV4dCB9KVxuICByZXR1cm4gKFxuICAgIDxUZXh0RmllbGRcbiAgICAgIGZ1bGxXaWR0aFxuICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICB2YWx1ZT17bG9jYWxWYWx1ZX1cbiAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgIGNvbnN0IGlucHV0VmFsdWUgPSBlLnRhcmdldC52YWx1ZVxuICAgICAgICAgIGlmIChpbnB1dFZhbHVlID09PSAnJyB8fCBpbnB1dFZhbHVlID09PSAnLScpIHtcbiAgICAgICAgICAgIHNldExvY2FsVmFsdWUoaW5wdXRWYWx1ZSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdpbnRlZ2VyJykge1xuICAgICAgICAgICAgc2V0TG9jYWxWYWx1ZShwYXJzZUludChpbnB1dFZhbHVlKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0TG9jYWxWYWx1ZShwYXJzZUZsb2F0KGlucHV0VmFsdWUpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfX1cbiAgICAgIGhlbHBlclRleHQ9e2hhc1ZhbGlkYXRpb25Jc3N1ZXMgPyBjb25zdHJ1Y3RlZFZhbGlkYXRpb25UZXh0IDogJyd9XG4gICAgICBGb3JtSGVscGVyVGV4dFByb3BzPXt7XG4gICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgfX1cbiAgICAgIHsuLi5UZXh0RmllbGRQcm9wc31cbiAgICAgIHsuLi5FbnRlcktleVN1Ym1pdFByb3BzfVxuICAgIC8+XG4gIClcbn1cbiJdfQ==