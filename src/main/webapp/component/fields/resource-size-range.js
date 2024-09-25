/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import { __assign } from "tslib";
import * as React from 'react';
import { ResourceSizeRangeFilterClass, sizeUnits, isResourceSizeRangeFilterClass, } from '../filter-builder/filter.structure';
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit';
import { NumberField } from './number';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
var defaultValue = {
    start: 0,
    end: 1,
    startUnits: 'B',
    endUnits: 'B',
};
function castAndParseFilterValue(value) {
    var castedValue = value;
    try {
        return {
            start: castAndParseValue(castedValue.start, defaultValue.start),
            end: castAndParseValue(castedValue.end, defaultValue.end),
        };
    }
    catch (e) {
        return {
            start: defaultValue.start,
            end: defaultValue.end,
        };
    }
}
function parseFilterContext(context) {
    var castedContext = context;
    try {
        return {
            startUnits: castAndParseUnit(castedContext.startUnits, defaultValue.startUnits),
            endUnits: castAndParseUnit(castedContext.endUnits, defaultValue.endUnits),
        };
    }
    catch (e) {
        return {
            startUnits: defaultValue.startUnits,
            endUnits: defaultValue.endUnits,
        };
    }
}
export function castAndParseValue(value, defaultValue) {
    try {
        var castedValue = value;
        if (typeof castedValue === 'number' && !isNaN(castedValue)) {
            return castedValue;
        }
    }
    catch (e) {
        // If casting fails, fall through to default
    }
    return defaultValue;
}
export function castAndParseUnit(unit, defaultValue) {
    try {
        var castedUnit = unit;
        if (sizeUnits.includes(castedUnit)) {
            return castedUnit;
        }
    }
    catch (e) {
        // If casting fails, fall through to default
    }
    return defaultValue;
}
function parseFilter(props) {
    var filter = props.filter;
    var newValue = castAndParseFilterValue(filter.value);
    var newContext = parseFilterContext(filter.context);
    return new ResourceSizeRangeFilterClass(__assign(__assign({}, filter), { value: {
            start: newValue.start,
            end: newValue.end,
        }, context: {
            startUnits: newContext.startUnits,
            endUnits: newContext.endUnits,
        } }));
}
var ResourceSizeRangeFieldWrapper = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter;
    React.useEffect(function () {
        var timeoutId = window.setTimeout(function () {
            if (!isResourceSizeRangeFilterClass(filter)) {
                setFilter(parseFilter({ filter: filter, setFilter: setFilter }));
            }
        }, 250);
        return function () {
            window.clearTimeout(timeoutId);
        };
    }, [filter]);
    if (!isResourceSizeRangeFilterClass(filter)) {
        return React.createElement(LinearProgress, null);
    }
    return React.createElement(ResourceSizeRangeField, { filter: filter, setFilter: setFilter });
};
var ResourceSizeRangeField = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter;
    return (React.createElement("div", { className: "flex flex-col space-y-4" },
        React.createElement("div", { className: "flex flex-row items-start" },
            React.createElement(NumberField, __assign({ value: filter.value.start.toString(), TextFieldProps: { label: 'From' }, type: "float", onChange: function (val) {
                    setFilter(new ResourceSizeRangeFilterClass(__assign(__assign({}, filter), { value: { start: val, end: filter.value.end } })));
                } }, EnterKeySubmitProps)),
            React.createElement(Autocomplete, { value: filter.context.startUnits, onChange: function (_, newValue) {
                    return setFilter(new ResourceSizeRangeFilterClass(__assign(__assign({}, filter), { context: {
                            startUnits: newValue || 'B',
                            endUnits: filter.context.endUnits,
                        } })));
                }, className: "min-w-24 ml-2", options: sizeUnits, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { size: "small" })); }, fullWidth: true })),
        React.createElement("div", { className: "flex flex-row items-start" },
            React.createElement(NumberField, __assign({ value: filter.value.end.toString(), TextFieldProps: { label: 'To' }, type: "float", onChange: function (val) {
                    setFilter(new ResourceSizeRangeFilterClass(__assign(__assign({}, filter), { value: { start: filter.value.start, end: val } })));
                } }, EnterKeySubmitProps)),
            React.createElement(Autocomplete, { value: filter.context.endUnits, className: "min-w-24 ml-2", onChange: function (_, newValue) {
                    setFilter(new ResourceSizeRangeFilterClass(__assign(__assign({}, filter), { context: {
                            startUnits: filter.context.startUnits,
                            endUnits: newValue || 'B',
                        } })));
                }, options: sizeUnits, renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { size: "small" })); }, fullWidth: true }))));
};
export { ResourceSizeRangeFieldWrapper as ResourceSizeRangeField };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2Utc2l6ZS1yYW5nZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZmllbGRzL3Jlc291cmNlLXNpemUtcmFuZ2UudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7O0FBRUosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUNMLDRCQUE0QixFQUU1QixTQUFTLEVBQ1QsOEJBQThCLEdBQy9CLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFDdkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUN0QyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQVl6RCxJQUFNLFlBQVksR0FBRztJQUNuQixLQUFLLEVBQUUsQ0FBQztJQUNSLEdBQUcsRUFBRSxDQUFDO0lBQ04sVUFBVSxFQUFFLEdBQUc7SUFDZixRQUFRLEVBQUUsR0FBRztDQUNkLENBQUE7QUFFRCxTQUFTLHVCQUF1QixDQUM5QixLQUFjO0lBRWQsSUFBTSxXQUFXLEdBQUcsS0FBOEMsQ0FBQTtJQUNsRSxJQUFJO1FBQ0YsT0FBTztZQUNMLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFDL0QsR0FBRyxFQUFFLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQztTQUMxRCxDQUFBO0tBQ0Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU87WUFDTCxLQUFLLEVBQUUsWUFBWSxDQUFDLEtBQUs7WUFDekIsR0FBRyxF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KlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyxcbiAgRmlsdGVyQ2xhc3MsXG4gIHNpemVVbml0cyxcbiAgaXNSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzLFxufSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgRW50ZXJLZXlTdWJtaXRQcm9wcyB9IGZyb20gJy4uL2N1c3RvbS1ldmVudHMvZW50ZXIta2V5LXN1Ym1pdCdcbmltcG9ydCB7IE51bWJlckZpZWxkIH0gZnJvbSAnLi9udW1iZXInXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuXG50eXBlIEdlbmVyaWNGaWx0ZXJUeXBlID0ge1xuICBmaWx0ZXI6IEZpbHRlckNsYXNzXG4gIHNldEZpbHRlcjogKGZpbHRlcjogRmlsdGVyQ2xhc3MpID0+IHZvaWRcbn1cblxudHlwZSBSZXNvdXJjZVNpemVSYW5nZUZpZWxkUHJvcHMgPSB7XG4gIGZpbHRlcjogUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1xuICBzZXRGaWx0ZXI6IChmaWx0ZXI6IFJlc291cmNlU2l6ZVJhbmdlRmlsdGVyQ2xhc3MpID0+IHZvaWRcbn1cblxuY29uc3QgZGVmYXVsdFZhbHVlID0ge1xuICBzdGFydDogMCxcbiAgZW5kOiAxLFxuICBzdGFydFVuaXRzOiAnQicsXG4gIGVuZFVuaXRzOiAnQicsXG59XG5cbmZ1bmN0aW9uIGNhc3RBbmRQYXJzZUZpbHRlclZhbHVlKFxuICB2YWx1ZTogdW5rbm93blxuKTogUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1sndmFsdWUnXSB7XG4gIGNvbnN0IGNhc3RlZFZhbHVlID0gdmFsdWUgYXMgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1sndmFsdWUnXVxuICB0cnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogY2FzdEFuZFBhcnNlVmFsdWUoY2FzdGVkVmFsdWUuc3RhcnQsIGRlZmF1bHRWYWx1ZS5zdGFydCksXG4gICAgICBlbmQ6IGNhc3RBbmRQYXJzZVZhbHVlKGNhc3RlZFZhbHVlLmVuZCwgZGVmYXVsdFZhbHVlLmVuZCksXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBkZWZhdWx0VmFsdWUuc3RhcnQsXG4gICAgICBlbmQ6IGRlZmF1bHRWYWx1ZS5lbmQsXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlRmlsdGVyQ29udGV4dChcbiAgY29udGV4dDogdW5rbm93blxuKTogUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1snY29udGV4dCddIHtcbiAgY29uc3QgY2FzdGVkQ29udGV4dCA9IGNvbnRleHQgYXMgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzc1snY29udGV4dCddXG4gIHRyeSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0VW5pdHM6IGNhc3RBbmRQYXJzZVVuaXQoXG4gICAgICAgIGNhc3RlZENvbnRleHQuc3RhcnRVbml0cyxcbiAgICAgICAgZGVmYXVsdFZhbHVlLnN0YXJ0VW5pdHNcbiAgICAgICksXG4gICAgICBlbmRVbml0czogY2FzdEFuZFBhcnNlVW5pdChjYXN0ZWRDb250ZXh0LmVuZFVuaXRzLCBkZWZhdWx0VmFsdWUuZW5kVW5pdHMpLFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydFVuaXRzOiBkZWZhdWx0VmFsdWUuc3RhcnRVbml0cyxcbiAgICAgIGVuZFVuaXRzOiBkZWZhdWx0VmFsdWUuZW5kVW5pdHMsXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXN0QW5kUGFyc2VWYWx1ZShcbiAgdmFsdWU6IHVua25vd24sXG4gIGRlZmF1bHRWYWx1ZTogbnVtYmVyXG4pOiBudW1iZXIge1xuICB0cnkge1xuICAgIGNvbnN0IGNhc3RlZFZhbHVlID0gdmFsdWUgYXMgbnVtYmVyXG4gICAgaWYgKHR5cGVvZiBjYXN0ZWRWYWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKGNhc3RlZFZhbHVlKSkge1xuICAgICAgcmV0dXJuIGNhc3RlZFZhbHVlXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgY2FzdGluZyBmYWlscywgZmFsbCB0aHJvdWdoIHRvIGRlZmF1bHRcbiAgfVxuICByZXR1cm4gZGVmYXVsdFZhbHVlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXN0QW5kUGFyc2VVbml0KHVuaXQ6IHVua25vd24sIGRlZmF1bHRWYWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjYXN0ZWRVbml0ID0gdW5pdCBhcyBzdHJpbmdcbiAgICBpZiAoc2l6ZVVuaXRzLmluY2x1ZGVzKGNhc3RlZFVuaXQpKSB7XG4gICAgICByZXR1cm4gY2FzdGVkVW5pdFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIGNhc3RpbmcgZmFpbHMsIGZhbGwgdGhyb3VnaCB0byBkZWZhdWx0XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxufVxuXG5mdW5jdGlvbiBwYXJzZUZpbHRlcihwcm9wczogR2VuZXJpY0ZpbHRlclR5cGUpOiBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzIHtcbiAgY29uc3QgeyBmaWx0ZXIgfSA9IHByb3BzXG4gIGxldCBuZXdWYWx1ZSA9IGNhc3RBbmRQYXJzZUZpbHRlclZhbHVlKGZpbHRlci52YWx1ZSlcbiAgbGV0IG5ld0NvbnRleHQgPSBwYXJzZUZpbHRlckNvbnRleHQoZmlsdGVyLmNvbnRleHQpXG5cbiAgcmV0dXJuIG5ldyBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzKHtcbiAgICAuLi5maWx0ZXIsXG4gICAgdmFsdWU6IHtcbiAgICAgIHN0YXJ0OiBuZXdWYWx1ZS5zdGFydCxcbiAgICAgIGVuZDogbmV3VmFsdWUuZW5kLFxuICAgIH0sXG4gICAgY29udGV4dDoge1xuICAgICAgc3RhcnRVbml0czogbmV3Q29udGV4dC5zdGFydFVuaXRzLFxuICAgICAgZW5kVW5pdHM6IG5ld0NvbnRleHQuZW5kVW5pdHMsXG4gICAgfSxcbiAgfSlcbn1cblxuY29uc3QgUmVzb3VyY2VTaXplUmFuZ2VGaWVsZFdyYXBwZXI6IFJlYWN0LkZDPEdlbmVyaWNGaWx0ZXJUeXBlPiA9ICh7XG4gIGZpbHRlcixcbiAgc2V0RmlsdGVyLFxufSkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICghaXNSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzKGZpbHRlcikpIHtcbiAgICAgICAgc2V0RmlsdGVyKHBhcnNlRmlsdGVyKHsgZmlsdGVyLCBzZXRGaWx0ZXIgfSkpXG4gICAgICB9XG4gICAgfSwgMjUwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICB9XG4gIH0sIFtmaWx0ZXJdKVxuXG4gIGlmICghaXNSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzKGZpbHRlcikpIHtcbiAgICByZXR1cm4gPExpbmVhclByb2dyZXNzIC8+XG4gIH1cblxuICByZXR1cm4gPFJlc291cmNlU2l6ZVJhbmdlRmllbGQgZmlsdGVyPXtmaWx0ZXJ9IHNldEZpbHRlcj17c2V0RmlsdGVyfSAvPlxufVxuXG5jb25zdCBSZXNvdXJjZVNpemVSYW5nZUZpZWxkOiBSZWFjdC5GQzxSZXNvdXJjZVNpemVSYW5nZUZpZWxkUHJvcHM+ID0gKHtcbiAgZmlsdGVyLFxuICBzZXRGaWx0ZXIsXG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIHNwYWNlLXktNFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IGl0ZW1zLXN0YXJ0XCI+XG4gICAgICAgIDxOdW1iZXJGaWVsZFxuICAgICAgICAgIHZhbHVlPXtmaWx0ZXIudmFsdWUuc3RhcnQudG9TdHJpbmcoKX1cbiAgICAgICAgICBUZXh0RmllbGRQcm9wcz17eyBsYWJlbDogJ0Zyb20nIH19XG4gICAgICAgICAgdHlwZT1cImZsb2F0XCJcbiAgICAgICAgICBvbkNoYW5nZT17KHZhbCkgPT4ge1xuICAgICAgICAgICAgc2V0RmlsdGVyKFxuICAgICAgICAgICAgICBuZXcgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgLi4uZmlsdGVyLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHN0YXJ0OiB2YWwsIGVuZDogZmlsdGVyLnZhbHVlLmVuZCB9LFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH19XG4gICAgICAgICAgey4uLkVudGVyS2V5U3VibWl0UHJvcHN9XG4gICAgICAgIC8+XG4gICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICB2YWx1ZT17ZmlsdGVyLmNvbnRleHQuc3RhcnRVbml0c31cbiAgICAgICAgICBvbkNoYW5nZT17KF8sIG5ld1ZhbHVlKSA9PlxuICAgICAgICAgICAgc2V0RmlsdGVyKFxuICAgICAgICAgICAgICBuZXcgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgLi4uZmlsdGVyLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICAgIHN0YXJ0VW5pdHM6IG5ld1ZhbHVlIHx8ICdCJyxcbiAgICAgICAgICAgICAgICAgIGVuZFVuaXRzOiBmaWx0ZXIuY29udGV4dC5lbmRVbml0cyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJtaW4tdy0yNCBtbC0yXCJcbiAgICAgICAgICBvcHRpb25zPXtzaXplVW5pdHN9XG4gICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IDxUZXh0RmllbGQgey4uLnBhcmFtc30gc2l6ZT1cInNtYWxsXCIgLz59XG4gICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBpdGVtcy1zdGFydFwiPlxuICAgICAgICA8TnVtYmVyRmllbGRcbiAgICAgICAgICB2YWx1ZT17ZmlsdGVyLnZhbHVlLmVuZC50b1N0cmluZygpfVxuICAgICAgICAgIFRleHRGaWVsZFByb3BzPXt7IGxhYmVsOiAnVG8nIH19XG4gICAgICAgICAgdHlwZT1cImZsb2F0XCJcbiAgICAgICAgICBvbkNoYW5nZT17KHZhbCkgPT4ge1xuICAgICAgICAgICAgc2V0RmlsdGVyKFxuICAgICAgICAgICAgICBuZXcgUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgLi4uZmlsdGVyLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IHN0YXJ0OiBmaWx0ZXIudmFsdWUuc3RhcnQsIGVuZDogdmFsIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgfX1cbiAgICAgICAgICB7Li4uRW50ZXJLZXlTdWJtaXRQcm9wc31cbiAgICAgICAgLz5cbiAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgIHZhbHVlPXtmaWx0ZXIuY29udGV4dC5lbmRVbml0c31cbiAgICAgICAgICBjbGFzc05hbWU9XCJtaW4tdy0yNCBtbC0yXCJcbiAgICAgICAgICBvbkNoYW5nZT17KF8sIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICBzZXRGaWx0ZXIoXG4gICAgICAgICAgICAgIG5ldyBSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAuLi5maWx0ZXIsXG4gICAgICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgICAgc3RhcnRVbml0czogZmlsdGVyLmNvbnRleHQuc3RhcnRVbml0cyxcbiAgICAgICAgICAgICAgICAgIGVuZFVuaXRzOiBuZXdWYWx1ZSB8fCAnQicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9fVxuICAgICAgICAgIG9wdGlvbnM9e3NpemVVbml0c31cbiAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBzaXplPVwic21hbGxcIiAvPn1cbiAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCB7IFJlc291cmNlU2l6ZVJhbmdlRmllbGRXcmFwcGVyIGFzIFJlc291cmNlU2l6ZVJhbmdlRmllbGQgfVxuIl19