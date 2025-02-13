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
import React from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '../text-field';
import { Zone, Hemisphere } from './common';
var UtmupsTextfield = function (_a) {
    var point = _a.point, setPoint = _a.setPoint, deletePoint = _a.deletePoint;
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex flex-row items-center flex-nowrap" },
            React.createElement("div", { className: "flex flex-col space-y-2 flex-nowrap shrink w-full" },
                React.createElement(TextField, { label: "Easting", 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
                    value: point.easting, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { easting: value }));
                    }, addon: "m" }),
                React.createElement(TextField, { label: "Northing", 
                    // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
                    value: point.northing, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { northing: value }));
                    }, addon: "m" }),
                React.createElement(Zone, { value: point.zoneNumber, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { zoneNumber: value }));
                    } }),
                React.createElement(Hemisphere, { value: point.hemisphere, onChange: function (value) {
                        setPoint(__assign(__assign({}, point), { hemisphere: value }));
                    } })),
            React.createElement("div", { className: "shrink-0 grow-0" },
                React.createElement(IconButton, { onClick: deletePoint, size: "large" },
                    React.createElement(CloseIcon, null))))));
};
export default UtmupsTextfield;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRtdXBzLXRleHRmaWVsZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbG9jYXRpb24vdXRtdXBzLXRleHRmaWVsZC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxTQUFTLE1BQU0sZUFBZSxDQUFBO0FBQ3JDLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBUzNDLElBQU0sZUFBZSxHQUFHLFVBQUMsRUFReEI7UUFQQyxLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixXQUFXLGlCQUFBO0lBTVgsT0FBTyxDQUNMO1FBQ0UsNkJBQUssU0FBUyxFQUFDLHdDQUF3QztZQUNyRCw2QkFBSyxTQUFTLEVBQUMsbURBQW1EO2dCQUNoRSxvQkFBQyxTQUFTLElBQ1IsS0FBSyxFQUFDLFNBQVM7b0JBQ2YsbUpBQW1KO29CQUNuSixLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFDcEIsUUFBUSxFQUFFLFVBQUMsS0FBYTt3QkFDdEIsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsT0FBTyxFQUFFLEtBQUssSUFDZCxDQUFBO29CQUNKLENBQUMsRUFDRCxLQUFLLEVBQUMsR0FBRyxHQUNUO2dCQUNGLG9CQUFDLFNBQVMsSUFDUixLQUFLLEVBQUMsVUFBVTtvQkFDaEIsbUpBQW1KO29CQUNuSixLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFDckIsUUFBUSxFQUFFLFVBQUMsS0FBYTt3QkFDdEIsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsUUFBUSxFQUFFLEtBQUssSUFDZixDQUFBO29CQUNKLENBQUMsRUFDRCxLQUFLLEVBQUMsR0FBRyxHQUNUO2dCQUNGLG9CQUFDLElBQUksSUFDSCxLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVUsRUFDdkIsUUFBUSxFQUFFLFVBQUMsS0FBYTt3QkFDdEIsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsVUFBVSxFQUFFLEtBQUssSUFDakIsQ0FBQTtvQkFDSixDQUFDLEdBQ0Q7Z0JBQ0Ysb0JBQUMsVUFBVSxJQUNULEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxFQUN2QixRQUFRLEVBQUUsVUFBQyxLQUE4Qjt3QkFDdkMsUUFBUSx1QkFDSCxLQUFLLEtBQ1IsVUFBVSxFQUFFLEtBQUssSUFDakIsQ0FBQTtvQkFDSixDQUFDLEdBQ0QsQ0FDRTtZQUNOLDZCQUFLLFNBQVMsRUFBQyxpQkFBaUI7Z0JBQzlCLG9CQUFDLFVBQVUsSUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQyxPQUFPO29CQUM1QyxvQkFBQyxTQUFTLE9BQUcsQ0FDRixDQUNULENBQ0YsQ0FDRixDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLGVBQWUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEljb25CdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9JY29uQnV0dG9uJ1xuaW1wb3J0IENsb3NlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3NlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICcuLi90ZXh0LWZpZWxkJ1xuaW1wb3J0IHsgWm9uZSwgSGVtaXNwaGVyZSB9IGZyb20gJy4vY29tbW9uJ1xuXG50eXBlIFV0bVVwc1BvaW50ID0ge1xuICBlYXN0aW5nOiBudW1iZXJcbiAgbm9ydGhpbmc6IG51bWJlclxuICB6b25lTnVtYmVyOiBudW1iZXJcbiAgaGVtaXNwaGVyZTogJ05vcnRoZXJuJyB8ICdTb3V0aGVybidcbn1cblxuY29uc3QgVXRtdXBzVGV4dGZpZWxkID0gKHtcbiAgcG9pbnQsXG4gIHNldFBvaW50LFxuICBkZWxldGVQb2ludCxcbn06IHtcbiAgcG9pbnQ6IFV0bVVwc1BvaW50XG4gIHNldFBvaW50OiAocG9pbnQ6IFV0bVVwc1BvaW50KSA9PiB2b2lkXG4gIGRlbGV0ZVBvaW50OiAoKSA9PiB2b2lkXG59KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIgZmxleC1ub3dyYXBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIHNwYWNlLXktMiBmbGV4LW5vd3JhcCBzaHJpbmsgdy1mdWxsXCI+XG4gICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgbGFiZWw9XCJFYXN0aW5nXCJcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAnbnVtYmVyJyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICdzdHJpbmcgfCAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgdmFsdWU9e3BvaW50LmVhc3Rpbmd9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgc2V0UG9pbnQoe1xuICAgICAgICAgICAgICAgIC4uLnBvaW50LFxuICAgICAgICAgICAgICAgIGVhc3Rpbmc6IHZhbHVlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGFkZG9uPVwibVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICBsYWJlbD1cIk5vcnRoaW5nXCJcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzIyKSBGSVhNRTogVHlwZSAnbnVtYmVyJyBpcyBub3QgYXNzaWduYWJsZSB0byB0eXBlICdzdHJpbmcgfCAuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgdmFsdWU9e3BvaW50Lm5vcnRoaW5nfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgIHNldFBvaW50KHtcbiAgICAgICAgICAgICAgICAuLi5wb2ludCxcbiAgICAgICAgICAgICAgICBub3J0aGluZzogdmFsdWUsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYWRkb249XCJtXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxab25lXG4gICAgICAgICAgICB2YWx1ZT17cG9pbnQuem9uZU51bWJlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICBzZXRQb2ludCh7XG4gICAgICAgICAgICAgICAgLi4ucG9pbnQsXG4gICAgICAgICAgICAgICAgem9uZU51bWJlcjogdmFsdWUsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEhlbWlzcGhlcmVcbiAgICAgICAgICAgIHZhbHVlPXtwb2ludC5oZW1pc3BoZXJlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZTogJ05vcnRoZXJuJyB8ICdTb3V0aGVybicpID0+IHtcbiAgICAgICAgICAgICAgc2V0UG9pbnQoe1xuICAgICAgICAgICAgICAgIC4uLnBvaW50LFxuICAgICAgICAgICAgICAgIGhlbWlzcGhlcmU6IHZhbHVlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzaHJpbmstMCBncm93LTBcIj5cbiAgICAgICAgICA8SWNvbkJ1dHRvbiBvbkNsaWNrPXtkZWxldGVQb2ludH0gc2l6ZT1cImxhcmdlXCI+XG4gICAgICAgICAgICA8Q2xvc2VJY29uIC8+XG4gICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFV0bXVwc1RleHRmaWVsZFxuIl19