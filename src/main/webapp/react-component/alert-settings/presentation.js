import { __assign } from "tslib";
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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
var millisecondsInDay = 24 * 60 * 60 * 1000;
var expireOptions = [
    {
        label: '1 Day',
        value: millisecondsInDay,
    },
    {
        label: '2 Days',
        value: 2 * millisecondsInDay,
    },
    {
        label: '4 Days',
        value: 4 * millisecondsInDay,
    },
    {
        label: '1 Week',
        value: 7 * millisecondsInDay,
    },
    {
        label: '2 Weeks',
        value: 14 * millisecondsInDay,
    },
    {
        label: '1 Month',
        value: 30 * millisecondsInDay,
    },
    {
        label: '2 Months',
        value: 60 * millisecondsInDay,
    },
    {
        label: '4 Months',
        value: 120 * millisecondsInDay,
    },
    {
        label: '6 Months',
        value: 180 * millisecondsInDay,
    },
    {
        label: '1 Year',
        value: 365 * millisecondsInDay,
    },
];
var keepNotificationsOptions = [
    {
        label: 'Yes',
        value: true,
    },
    {
        label: 'No',
        value: false,
    },
];
var render = function (props) {
    var persistence = props.persistence, expiration = props.expiration, onExpirationChange = props.onExpirationChange, onPersistenceChange = props.onPersistenceChange;
    return (React.createElement("div", { className: "p-2 w-full h-full overflow-auto" },
        React.createElement("div", { className: "editor-properties" },
            React.createElement("div", null,
                React.createElement(Autocomplete, { size: "small", options: keepNotificationsOptions, onChange: function (_e, newValue) {
                        onPersistenceChange(newValue.value);
                    }, isOptionEqualToValue: function (option) { return option.value === persistence; }, getOptionLabel: function (option) {
                        return option.label;
                    }, disableClearable: true, value: keepNotificationsOptions.find(function (choice) { return choice.value === persistence; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Keep notifications after logging out", variant: "outlined" }))); } })),
            React.createElement("div", { className: "pt-2" }, persistence ? (React.createElement(Autocomplete, { size: "small", options: expireOptions, onChange: function (_e, newValue) {
                    onExpirationChange(newValue.value);
                }, isOptionEqualToValue: function (option) { return option.value === expiration; }, getOptionLabel: function (option) {
                    return option.label;
                }, disableClearable: true, value: expireOptions.find(function (choice) { return choice.value === expiration; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Expire after", variant: "outlined" }))); } })) : null))));
};
export default hot(module)(render);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9hbGVydC1zZXR0aW5ncy9wcmVzZW50YXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBUS9DLElBQU0saUJBQWlCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQzdDLElBQU0sYUFBYSxHQUFHO0lBQ3BCO1FBQ0UsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsaUJBQWlCO0tBQ3pCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsU0FBUztRQUNoQixLQUFLLEVBQUUsRUFBRSxHQUFHLGlCQUFpQjtLQUM5QjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFNBQVM7UUFDaEIsS0FBSyxFQUFFLEVBQUUsR0FBRyxpQkFBaUI7S0FDOUI7SUFDRDtRQUNFLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEtBQUssRUFBRSxFQUFFLEdBQUcsaUJBQWlCO0tBQzlCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsVUFBVTtRQUNqQixLQUFLLEVBQUUs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KiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcblxudHlwZSBQcm9wcyA9IHtcbiAgcGVyc2lzdGVuY2U6IGJvb2xlYW5cbiAgZXhwaXJhdGlvbjogbnVtYmVyXG4gIG9uRXhwaXJhdGlvbkNoYW5nZTogKHY6IG51bWJlcikgPT4gYW55XG4gIG9uUGVyc2lzdGVuY2VDaGFuZ2U6ICh2OiBib29sZWFuKSA9PiBhbnlcbn1cbmNvbnN0IG1pbGxpc2Vjb25kc0luRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMFxuY29uc3QgZXhwaXJlT3B0aW9ucyA9IFtcbiAge1xuICAgIGxhYmVsOiAnMSBEYXknLFxuICAgIHZhbHVlOiBtaWxsaXNlY29uZHNJbkRheSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnMiBEYXlzJyxcbiAgICB2YWx1ZTogMiAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICc0IERheXMnLFxuICAgIHZhbHVlOiA0ICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzEgV2VlaycsXG4gICAgdmFsdWU6IDcgKiBtaWxsaXNlY29uZHNJbkRheSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnMiBXZWVrcycsXG4gICAgdmFsdWU6IDE0ICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzEgTW9udGgnLFxuICAgIHZhbHVlOiAzMCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICcyIE1vbnRocycsXG4gICAgdmFsdWU6IDYwICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzQgTW9udGhzJyxcbiAgICB2YWx1ZTogMTIwICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzYgTW9udGhzJyxcbiAgICB2YWx1ZTogMTgwICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzEgWWVhcicsXG4gICAgdmFsdWU6IDM2NSAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuXSBhcyB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXIgfVtdXG5cbmNvbnN0IGtlZXBOb3RpZmljYXRpb25zT3B0aW9ucyA9IFtcbiAge1xuICAgIGxhYmVsOiAnWWVzJyxcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnTm8nLFxuICAgIHZhbHVlOiBmYWxzZSxcbiAgfSxcbl0gYXMgeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogYm9vbGVhbiB9W11cblxuY29uc3QgcmVuZGVyID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7IHBlcnNpc3RlbmNlLCBleHBpcmF0aW9uLCBvbkV4cGlyYXRpb25DaGFuZ2UsIG9uUGVyc2lzdGVuY2VDaGFuZ2UgfSA9XG4gICAgcHJvcHNcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yIHctZnVsbCBoLWZ1bGwgb3ZlcmZsb3ctYXV0b1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJlZGl0b3ItcHJvcGVydGllc1wiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICBvcHRpb25zPXtrZWVwTm90aWZpY2F0aW9uc09wdGlvbnN9XG4gICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIG9uUGVyc2lzdGVuY2VDaGFuZ2UobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgaXNPcHRpb25FcXVhbFRvVmFsdWU9eyhvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gcGVyc2lzdGVuY2V9XG4gICAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uLmxhYmVsXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgdmFsdWU9e2tlZXBOb3RpZmljYXRpb25zT3B0aW9ucy5maW5kKFxuICAgICAgICAgICAgICAoY2hvaWNlKSA9PiBjaG9pY2UudmFsdWUgPT09IHBlcnNpc3RlbmNlXG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgICAgICAgbGFiZWw9XCJLZWVwIG5vdGlmaWNhdGlvbnMgYWZ0ZXIgbG9nZ2luZyBvdXRcIlxuICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICB7cGVyc2lzdGVuY2UgPyAoXG4gICAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgIG9wdGlvbnM9e2V4cGlyZU9wdGlvbnN9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2U6IGFueSwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBvbkV4cGlyYXRpb25DaGFuZ2UobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGV4cGlyYXRpb259XG4gICAgICAgICAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBkaXNhYmxlQ2xlYXJhYmxlXG4gICAgICAgICAgICAgIHZhbHVlPXtleHBpcmVPcHRpb25zLmZpbmQoXG4gICAgICAgICAgICAgICAgKGNob2ljZSkgPT4gY2hvaWNlLnZhbHVlID09PSBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgey4uLnBhcmFtc31cbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiRXhwaXJlIGFmdGVyXCJcbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkocmVuZGVyKVxuIl19