import { __assign } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx("div", { className: "p-2 w-full h-full overflow-auto", children: _jsxs("div", { className: "editor-properties", children: [_jsx("div", { children: _jsx(Autocomplete, { size: "small", options: keepNotificationsOptions, onChange: function (_e, newValue) {
                            onPersistenceChange(newValue.value);
                        }, isOptionEqualToValue: function (option) { return option.value === persistence; }, getOptionLabel: function (option) {
                            return option.label;
                        }, disableClearable: true, value: keepNotificationsOptions.find(function (choice) { return choice.value === persistence; }), renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "Keep notifications after logging out", variant: "outlined" }))); } }) }), _jsx("div", { className: "pt-2", children: persistence ? (_jsx(Autocomplete, { size: "small", options: expireOptions, onChange: function (_e, newValue) {
                            onExpirationChange(newValue.value);
                        }, isOptionEqualToValue: function (option) { return option.value === expiration; }, getOptionLabel: function (option) {
                            return option.label;
                        }, disableClearable: true, value: expireOptions.find(function (choice) { return choice.value === expiration; }), renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "Expire after", variant: "outlined" }))); } })) : null })] }) }));
};
export default render;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9hbGVydC1zZXR0aW5ncy9wcmVzZW50YXRpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBUS9DLElBQU0saUJBQWlCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQzdDLElBQU0sYUFBYSxHQUFHO0lBQ3BCO1FBQ0UsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsaUJBQWlCO0tBQ3pCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsUUFBUTtRQUNmLEtBQUssRUFBRSxDQUFDLEdBQUcsaUJBQWlCO0tBQzdCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsU0FBUztRQUNoQixLQUFLLEVBQUUsRUFBRSxHQUFHLGlCQUFpQjtLQUM5QjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFNBQVM7UUFDaEIsS0FBSyxFQUFFLEVBQUUsR0FBRyxpQkFBaUI7S0FDOUI7SUFDRDtRQUNFLEtBQUssRUFBRSxVQUFVO1FBQ2pCLEtBQUssRUFBRSxFQUFFLEdBQUcsaUJBQWlCO0tBQzlCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsVUFBVTtRQUNqQixLQUFLLEVBQUUsR0FBRyxHQUFHLGlCQUFpQjtLQUMvQjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFVBQVU7UUFDakIsS0FBSyxFQUFFLEdBQUcsR0FBRyxpQkFBaUI7S0FDL0I7SUFDRDtRQUNFLEtBQUssRUFBRSxRQUFRO1FBQ2YsS0FBSyxFQUFFLEdBQUcsR0FBRyxpQkFBaUI7S0FDL0I7Q0FDb0MsQ0FBQTtBQUV2QyxJQUFNLHdCQUF3QixHQUFHO0lBQy9CO1FBQ0UsS0FBSyxFQUFFLEtBQUs7UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsSUFBSTtRQUNYLEtBQUssRUFBRSxLQUFLO0tBQ2I7Q0FDcUMsQ0FBQTtBQUV4QyxJQUFNLE1BQU0sR0FBRyxVQUFDLEtBQVk7SUFDbEIsSUFBQSxXQUFXLEdBQ2pCLEtBQUssWUFEWSxFQUFFLFVBQVUsR0FDN0IsS0FBSyxXQUR3QixFQUFFLGtCQUFrQixHQUNqRCxLQUFLLG1CQUQ0QyxFQUFFLG1CQUFtQixHQUN0RSxLQUFLLG9CQURpRSxDQUNqRTtJQUVQLE9BQU8sQ0FDTCxjQUFLLFNBQVMsRUFBQyxpQ0FBaUMsWUFDOUMsZUFBSyxTQUFTLEVBQUMsbUJBQW1CLGFBQ2hDLHdCQUNFLEtBQUMsWUFBWSxJQUNYLElBQUksRUFBQyxPQUFPLEVBQ1osT0FBTyxFQUFFLHdCQUF3QixFQUNqQyxRQUFRLEVBQUUsVUFBQyxFQUFPLEVBQUUsUUFBUTs0QkFDMUIsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUNyQyxDQUFDLEVBQ0Qsb0JBQW9CLEVBQUUsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBNUIsQ0FBNEIsRUFDOUQsY0FBYyxFQUFFLFVBQUMsTUFBTTs0QkFDckIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFBO3dCQUNyQixDQUFDLEVBQ0QsZ0JBQWdCLFFBQ2hCLEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxJQUFJLENBQ2xDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQTVCLENBQTRCLENBQ3pDLEVBQ0QsV0FBVyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsQ0FDdkIsS0FBQyxTQUFTLGVBQ0osTUFBTSxJQUNWLEtBQUssRUFBQyxzQ0FBc0MsRUFDNUMsT0FBTyxFQUFDLFVBQVUsSUFDbEIsQ0FDSCxFQU53QixDQU14QixHQUNELEdBQ0UsRUFDTixjQUFLLFNBQVMsRUFBQyxNQUFNLFlBQ2xCLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FDYixLQUFDLFlBQVksSUFDWCxJQUFJLEVBQUMsT0FBTyxFQUNaLE9BQU8sRUFBRSxhQUFhLEVBQ3RCLFFBQVEsRUFBRSxVQUFDLEVBQU8sRUFBRSxRQUFROzRCQUMxQixrQkFBa0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQ3BDLENBQUMsRUFDRCxvQkFBb0IsRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUEzQixDQUEyQixFQUM3RCxjQUFjLEVBQUUsVUFBQyxNQUFNOzRCQUNyQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUE7d0JBQ3JCLENBQUMsRUFDRCxnQkFBZ0IsUUFDaEIsS0FBSyxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQ3ZCLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxVQUFVLEVBQTNCLENBQTJCLENBQ3hDLEVBQ0QsV0FBVyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsQ0FDdkIsS0FBQyxTQUFTLGVBQ0osTUFBTSxJQUNWLEtBQUssRUFBQyxjQUFjLEVBQ3BCLE9BQU8sRUFBQyxVQUFVLElBQ2xCLENBQ0gsRUFOd0IsQ0FNeEIsR0FDRCxDQUNILENBQUMsQ0FBQyxDQUFDLElBQUksR0FDSixJQUNGLEdBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxNQUFNLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHBlcnNpc3RlbmNlOiBib29sZWFuXG4gIGV4cGlyYXRpb246IG51bWJlclxuICBvbkV4cGlyYXRpb25DaGFuZ2U6ICh2OiBudW1iZXIpID0+IGFueVxuICBvblBlcnNpc3RlbmNlQ2hhbmdlOiAodjogYm9vbGVhbikgPT4gYW55XG59XG5jb25zdCBtaWxsaXNlY29uZHNJbkRheSA9IDI0ICogNjAgKiA2MCAqIDEwMDBcbmNvbnN0IGV4cGlyZU9wdGlvbnMgPSBbXG4gIHtcbiAgICBsYWJlbDogJzEgRGF5JyxcbiAgICB2YWx1ZTogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzIgRGF5cycsXG4gICAgdmFsdWU6IDIgKiBtaWxsaXNlY29uZHNJbkRheSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnNCBEYXlzJyxcbiAgICB2YWx1ZTogNCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICcxIFdlZWsnLFxuICAgIHZhbHVlOiA3ICogbWlsbGlzZWNvbmRzSW5EYXksXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJzIgV2Vla3MnLFxuICAgIHZhbHVlOiAxNCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICcxIE1vbnRoJyxcbiAgICB2YWx1ZTogMzAgKiBtaWxsaXNlY29uZHNJbkRheSxcbiAgfSxcbiAge1xuICAgIGxhYmVsOiAnMiBNb250aHMnLFxuICAgIHZhbHVlOiA2MCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICc0IE1vbnRocycsXG4gICAgdmFsdWU6IDEyMCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICc2IE1vbnRocycsXG4gICAgdmFsdWU6IDE4MCAqIG1pbGxpc2Vjb25kc0luRGF5LFxuICB9LFxuICB7XG4gICAgbGFiZWw6ICcxIFllYXInLFxuICAgIHZhbHVlOiAzNjUgKiBtaWxsaXNlY29uZHNJbkRheSxcbiAgfSxcbl0gYXMgeyBsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyIH1bXVxuXG5jb25zdCBrZWVwTm90aWZpY2F0aW9uc09wdGlvbnMgPSBbXG4gIHtcbiAgICBsYWJlbDogJ1llcycsXG4gICAgdmFsdWU6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBsYWJlbDogJ05vJyxcbiAgICB2YWx1ZTogZmFsc2UsXG4gIH0sXG5dIGFzIHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IGJvb2xlYW4gfVtdXG5cbmNvbnN0IHJlbmRlciA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBwZXJzaXN0ZW5jZSwgZXhwaXJhdGlvbiwgb25FeHBpcmF0aW9uQ2hhbmdlLCBvblBlcnNpc3RlbmNlQ2hhbmdlIH0gPVxuICAgIHByb3BzXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMiB3LWZ1bGwgaC1mdWxsIG92ZXJmbG93LWF1dG9cIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZWRpdG9yLXByb3BlcnRpZXNcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgb3B0aW9ucz17a2VlcE5vdGlmaWNhdGlvbnNPcHRpb25zfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICBvblBlcnNpc3RlbmNlQ2hhbmdlKG5ld1ZhbHVlLnZhbHVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHBlcnNpc3RlbmNlfVxuICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgIHZhbHVlPXtrZWVwTm90aWZpY2F0aW9uc09wdGlvbnMuZmluZChcbiAgICAgICAgICAgICAgKGNob2ljZSkgPT4gY2hvaWNlLnZhbHVlID09PSBwZXJzaXN0ZW5jZVxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICB7Li4ucGFyYW1zfVxuICAgICAgICAgICAgICAgIGxhYmVsPVwiS2VlcCBub3RpZmljYXRpb25zIGFmdGVyIGxvZ2dpbmcgb3V0XCJcbiAgICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAge3BlcnNpc3RlbmNlID8gKFxuICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICBvcHRpb25zPXtleHBpcmVPcHRpb25zfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgb25FeHBpcmF0aW9uQ2hhbmdlKG5ld1ZhbHVlLnZhbHVlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBleHBpcmF0aW9ufVxuICAgICAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgICB2YWx1ZT17ZXhwaXJlT3B0aW9ucy5maW5kKFxuICAgICAgICAgICAgICAgIChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwaXJhdGlvblxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIkV4cGlyZSBhZnRlclwiXG4gICAgICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlbmRlclxuIl19