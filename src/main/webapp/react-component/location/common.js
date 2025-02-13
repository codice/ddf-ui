import { __assign, __makeTemplateObject, __read, __spreadArray } from "tslib";
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
import styled from 'styled-components';
import Group from '../group';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Label from './label';
var Units = function (_a) {
    var value = _a.value, onChange = _a.onChange, children = _a.children;
    return (React.createElement(Group, null,
        children,
        React.createElement(Autocomplete, { fullWidth: true, disableClearable: true, options: [
                'meters',
                'kilometers',
                'feet',
                'yards',
                'miles',
                'nautical miles',
            ], renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value, onChange: function (_event, newVal) {
                onChange(newVal);
            }, size: "small", style: { minWidth: '200px' } })));
};
// create an array of 1-60 for zones
var range = __spreadArray([], __read(Array(61).keys()), false).map(function (val) { return val.toString(); }).slice(1);
var Zone = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    return (React.createElement(Group, null,
        React.createElement(Label, null, "Zone"),
        React.createElement(Autocomplete, { className: "w-full shrink", disableClearable: true, options: range, renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value.toString(), onChange: function (_event, newVal) {
                onChange(parseInt(newVal));
            }, size: "small" })));
};
var Hemisphere = function (_a) {
    var value = _a.value, onChange = _a.onChange;
    return (React.createElement(Group, null,
        React.createElement(Label, null, "Hemisphere"),
        React.createElement(Autocomplete, { className: "w-full shrink", disableClearable: true, options: ['Northern', 'Southern'], renderInput: function (params) {
                return React.createElement(TextField, __assign({}, params, { label: "", variant: "outlined" }));
            }, value: value, onChange: function (_event, newVal) {
                onChange(newVal);
            }, size: "small" })));
};
var MinimumSpacing = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  height: ", ";\n"], ["\n  height: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
export { Units, Zone, Hemisphere, MinimumSpacing };
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi9jb21tb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRXpCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBRXRDLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUM1QixPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFFM0IsSUFBTSxLQUFLLEdBQUcsVUFBQyxFQUFrQztRQUFoQyxLQUFLLFdBQUEsRUFBRSxRQUFRLGNBQUEsRUFBRSxRQUFRLGNBQUE7SUFBWSxPQUFBLENBQ3BELG9CQUFDLEtBQUs7UUFDSCxRQUFRO1FBQ1Qsb0JBQUMsWUFBWSxJQUNYLFNBQVMsUUFDVCxnQkFBZ0IsUUFDaEIsT0FBTyxFQUFFO2dCQUNQLFFBQVE7Z0JBQ1IsWUFBWTtnQkFDWixNQUFNO2dCQUNOLE9BQU87Z0JBQ1AsT0FBTztnQkFDUCxnQkFBZ0I7YUFDakIsRUFDRCxXQUFXLEVBQUUsVUFBQyxNQUFNO2dCQUNsQixPQUFPLG9CQUFDLFNBQVMsZUFBSyxNQUFNLElBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsVUFBVSxJQUFHLENBQUE7WUFDOUQsQ0FBQyxFQUNELEtBQUssRUFBRSxLQUFLLEVBQ1osUUFBUSxFQUFFLFVBQUMsTUFBTSxFQUFFLE1BQU07Z0JBQ3ZCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNsQixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sRUFDWixLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQ2QsQ0FDVixDQUNUO0FBekJxRCxDQXlCckQsQ0FBQTtBQUVELG9DQUFvQztBQUNwQyxJQUFNLEtBQUssR0FBRyx5QkFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLFVBQUUsR0FBRyxDQUFDLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6RSxJQUFNLElBQUksR0FBRyxVQUFDLEVBQXdCO1FBQXRCLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUFZLE9BQUEsQ0FDekMsb0JBQUMsS0FBSztRQUNKLG9CQUFDLEtBQUssZUFBYTtRQUNuQixvQkFBQyxZQUFZLElBQ1gsU0FBUyxFQUFDLGVBQWUsRUFDekIsZ0JBQWdCLFFBQ2hCLE9BQU8sRUFBRSxLQUFLLEVBQ2QsV0FBVyxFQUFFLFVBQUMsTUFBTTtnQkFDbEIsT0FBTyxvQkFBQyxTQUFTLGVBQUssTUFBTSxJQUFFLEtBQUssRUFBQyxFQUFFLEVBQUMsT0FBTyxFQUFDLFVBQVUsSUFBRyxDQUFBO1lBQzlELENBQUMsRUFDRCxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUN2QixRQUFRLEVBQUUsVUFBQyxNQUFNLEVBQUUsTUFBTTtnQkFDdkIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQzVCLENBQUMsRUFDRCxJQUFJLEVBQUMsT0FBTyxHQUNFLENBQ1YsQ0FDVDtBQWpCMEMsQ0FpQjFDLENBQUE7QUFFRCxJQUFNLFVBQVUsR0FBRyxVQUFDLEVBQXdCO1FBQXRCLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQTtJQUFZLE9BQUEsQ0FDL0Msb0JBQUMsS0FBSztRQUNKLG9CQUFDLEtBQUsscUJBQW1CO1FBQ3pCLG9CQUFDLFlBQVksSUFDWCxTQUFTLEVBQUMsZUFBZSxFQUN6QixnQkFBZ0IsUUFDaEIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUNqQyxXQUFXLEVBQUUsVUFBQyxNQUFNO2dCQUNsQixPQUFPLG9CQUFDLFNBQVMsZUFBSyxNQUFNLElBQUUsS0FBSyxFQUFDLEVBQUUsRUFBQyxPQUFPLEVBQUMsVUFBVSxJQUFHLENBQUE7WUFDOUQsQ0FBQyxFQUNELEtBQUssRUFBRSxLQUFLLEVBQ1osUUFBUSxFQUFFLFVBQUMsTUFBTSxFQUFFLE1BQU07Z0JBQ3ZCLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNsQixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sR0FDRSxDQUNWLENBQ1Q7QUFqQmdELENBaUJoRCxDQUFBO0FBRUQsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLEdBQUcsd0ZBQUEsY0FDckIsRUFBcUMsS0FDaEQsS0FEVyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixDQUNoRCxDQUFBO0FBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5cbmltcG9ydCBHcm91cCBmcm9tICcuLi9ncm91cCdcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IExhYmVsIGZyb20gJy4vbGFiZWwnXG5cbmNvbnN0IFVuaXRzID0gKHsgdmFsdWUsIG9uQ2hhbmdlLCBjaGlsZHJlbiB9OiBhbnkpID0+IChcbiAgPEdyb3VwPlxuICAgIHtjaGlsZHJlbn1cbiAgICA8QXV0b2NvbXBsZXRlXG4gICAgICBmdWxsV2lkdGhcbiAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgIG9wdGlvbnM9e1tcbiAgICAgICAgJ21ldGVycycsXG4gICAgICAgICdraWxvbWV0ZXJzJyxcbiAgICAgICAgJ2ZlZXQnLFxuICAgICAgICAneWFyZHMnLFxuICAgICAgICAnbWlsZXMnLFxuICAgICAgICAnbmF1dGljYWwgbWlsZXMnLFxuICAgICAgXX1cbiAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiB7XG4gICAgICAgIHJldHVybiA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IGxhYmVsPVwiXCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgIH19XG4gICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICBvbkNoYW5nZT17KF9ldmVudCwgbmV3VmFsKSA9PiB7XG4gICAgICAgIG9uQ2hhbmdlKG5ld1ZhbClcbiAgICAgIH19XG4gICAgICBzaXplPVwic21hbGxcIlxuICAgICAgc3R5bGU9e3sgbWluV2lkdGg6ICcyMDBweCcgfX1cbiAgICA+PC9BdXRvY29tcGxldGU+XG4gIDwvR3JvdXA+XG4pXG5cbi8vIGNyZWF0ZSBhbiBhcnJheSBvZiAxLTYwIGZvciB6b25lc1xuY29uc3QgcmFuZ2UgPSBbLi4uQXJyYXkoNjEpLmtleXMoKV0ubWFwKCh2YWwpID0+IHZhbC50b1N0cmluZygpKS5zbGljZSgxKVxuY29uc3QgWm9uZSA9ICh7IHZhbHVlLCBvbkNoYW5nZSB9OiBhbnkpID0+IChcbiAgPEdyb3VwPlxuICAgIDxMYWJlbD5ab25lPC9MYWJlbD5cbiAgICA8QXV0b2NvbXBsZXRlXG4gICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgc2hyaW5rXCJcbiAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgIG9wdGlvbnM9e3JhbmdlfVxuICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgcmV0dXJuIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgfX1cbiAgICAgIHZhbHVlPXt2YWx1ZS50b1N0cmluZygpfVxuICAgICAgb25DaGFuZ2U9eyhfZXZlbnQsIG5ld1ZhbCkgPT4ge1xuICAgICAgICBvbkNoYW5nZShwYXJzZUludChuZXdWYWwpKVxuICAgICAgfX1cbiAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgPjwvQXV0b2NvbXBsZXRlPlxuICA8L0dyb3VwPlxuKVxuXG5jb25zdCBIZW1pc3BoZXJlID0gKHsgdmFsdWUsIG9uQ2hhbmdlIH06IGFueSkgPT4gKFxuICA8R3JvdXA+XG4gICAgPExhYmVsPkhlbWlzcGhlcmU8L0xhYmVsPlxuICAgIDxBdXRvY29tcGxldGVcbiAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBzaHJpbmtcIlxuICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgb3B0aW9ucz17WydOb3J0aGVybicsICdTb3V0aGVybiddfVxuICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IHtcbiAgICAgICAgcmV0dXJuIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgfX1cbiAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgIG9uQ2hhbmdlPXsoX2V2ZW50LCBuZXdWYWwpID0+IHtcbiAgICAgICAgb25DaGFuZ2UobmV3VmFsKVxuICAgICAgfX1cbiAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgPjwvQXV0b2NvbXBsZXRlPlxuICA8L0dyb3VwPlxuKVxuXG5jb25zdCBNaW5pbXVtU3BhY2luZyA9IHN0eWxlZC5kaXZgXG4gIGhlaWdodDogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1pbmltdW1TcGFjaW5nfTtcbmBcblxuZXhwb3J0IHsgVW5pdHMsIFpvbmUsIEhlbWlzcGhlcmUsIE1pbmltdW1TcGFjaW5nIH1cbiJdfQ==