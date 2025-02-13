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
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import SortItem from './sort-item';
import { getLabel, getNextAttribute, getSortAttributeOptions, getSortDirectionOptions, } from './sort-selection-helpers';
var getCollectionAsJson = function (collection) {
    var items = collection.map(function (sort) {
        return {
            attribute: {
                label: getLabel(sort.attribute),
                value: sort.attribute,
            },
            direction: sort.direction,
        };
    });
    return items;
};
var SortSelections = function (_a) {
    var _b = _a.value, value = _b === void 0 ? [] : _b, onChange = _a.onChange;
    if (!value.length) {
        value.push({
            attribute: 'title',
            direction: 'ascending',
        });
        onChange(value.slice(0));
    }
    var collectionJson = getCollectionAsJson(value);
    var sortAttributeOptions = getSortAttributeOptions(collectionJson.map(function (item) { return item.attribute.value; }));
    var updateAttribute = function (index) { return function (attribute) {
        value[index].attribute = attribute;
        onChange(value.slice(0));
    }; };
    var updateDirection = function (index) { return function (direction) {
        value[index].direction = direction;
        onChange(value.slice(0));
    }; };
    var removeItem = function (index) { return function () {
        value.splice(index, 1);
        onChange(value.slice(0));
    }; };
    var addSort = function () {
        value.push({
            attribute: getNextAttribute(collectionJson, sortAttributeOptions),
            direction: 'descending',
        });
        onChange(value.slice(0));
    };
    return (React.createElement("div", { "data-id": "root-sort-container" },
        React.createElement(Typography, { "data-id": "Sort-changed", className: "pb-2" }, "Sort"),
        collectionJson.map(function (sortItem, index) {
            return (React.createElement("div", { "data-id": "sort-container", key: sortItem.attribute.value, className: index > 0 ? 'pt-2' : '' },
                React.createElement(SortItem, { sortItem: sortItem, attributeOptions: sortAttributeOptions, directionOptions: getSortDirectionOptions(sortItem.attribute.value), updateAttribute: updateAttribute(index), updateDirection: updateDirection(index), onRemove: removeItem(index), showRemove: index !== 0 })));
        }),
        React.createElement("div", { className: "pt-2" },
            React.createElement(Button, { "data-id": "add-sort-button", color: "primary", fullWidth: true, onClick: addSort },
                React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
                    React.createElement(Grid, { item: true },
                        React.createElement(AddIcon, { className: "Mui-text-text-primary" })),
                    React.createElement(Grid, { item: true }, "Sort"))))));
};
export default hot(module)(SortSelections);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1zZWxlY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9xdWVyeS1zb3J0LXNlbGVjdGlvbi9zb3J0LXNlbGVjdGlvbnMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLFVBQVUsTUFBTSwwQkFBMEIsQ0FBQTtBQUNqRCxPQUFPLE9BQU8sTUFBTSx5QkFBeUIsQ0FBQTtBQUM3QyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFBO0FBQ2xDLE9BQU8sRUFDTCxRQUFRLEVBQ1IsZ0JBQWdCLEVBQ2hCLHVCQUF1QixFQUN2Qix1QkFBdUIsR0FDeEIsTUFBTSwwQkFBMEIsQ0FBQTtBQXNCakMsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLFVBQTBCO0lBQ3JELElBQU0sS0FBSyxHQUFtQixVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSTtRQUNoRCxPQUFPO1lBQ0wsU0FBUyxFQUFFO2dCQUNULEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDL0IsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTO2FBQ3RCO1lBQ0QsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzFCLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBRUQsSUFBTSxjQUFjLEdBQUcsVUFBQyxFQUErQjtRQUE3QixhQUFVLEVBQVYsS0FBSyxtQkFBRyxFQUFFLEtBQUEsRUFBRSxRQUFR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LElBQUMsU0FBUyxRQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsUUFBUTtvQkFDL0Qsb0JBQUMsSUFBSSxJQUFDLElBQUk7d0JBQ1Isb0JBQUMsT0FBTyxJQUFDLFNBQVMsRUFBQyx1QkFBdUIsR0FBRyxDQUN4QztvQkFDUCxvQkFBQyxJQUFJLElBQUMsSUFBSSxpQkFBWSxDQUNqQixDQUNBLENBQ0wsQ0FDRixDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBBZGRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQWRkJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IFNvcnRJdGVtIGZyb20gJy4vc29ydC1pdGVtJ1xuaW1wb3J0IHtcbiAgZ2V0TGFiZWwsXG4gIGdldE5leHRBdHRyaWJ1dGUsXG4gIGdldFNvcnRBdHRyaWJ1dGVPcHRpb25zLFxuICBnZXRTb3J0RGlyZWN0aW9uT3B0aW9ucyxcbn0gZnJvbSAnLi9zb3J0LXNlbGVjdGlvbi1oZWxwZXJzJ1xuXG5leHBvcnQgdHlwZSBTb3J0c1R5cGUgPSB7XG4gIGF0dHJpYnV0ZTogc3RyaW5nXG4gIGRpcmVjdGlvbjogc3RyaW5nXG59W11cblxudHlwZSBQcm9wcyA9IHtcbiAgdmFsdWU6IFNvcnRzVHlwZVxuICBvbkNoYW5nZTogKG5ld1ZhbDogU29ydHNUeXBlKSA9PiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvbiA9IHtcbiAgbGFiZWw6IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIFNvcnRJdGVtVHlwZSA9IHtcbiAgYXR0cmlidXRlOiBPcHRpb25cbiAgZGlyZWN0aW9uOiBzdHJpbmdcbn1cblxuY29uc3QgZ2V0Q29sbGVjdGlvbkFzSnNvbiA9IChjb2xsZWN0aW9uOiBQcm9wc1sndmFsdWUnXSkgPT4ge1xuICBjb25zdCBpdGVtczogU29ydEl0ZW1UeXBlW10gPSBjb2xsZWN0aW9uLm1hcCgoc29ydCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBhdHRyaWJ1dGU6IHtcbiAgICAgICAgbGFiZWw6IGdldExhYmVsKHNvcnQuYXR0cmlidXRlKSxcbiAgICAgICAgdmFsdWU6IHNvcnQuYXR0cmlidXRlLFxuICAgICAgfSxcbiAgICAgIGRpcmVjdGlvbjogc29ydC5kaXJlY3Rpb24sXG4gICAgfVxuICB9KVxuICByZXR1cm4gaXRlbXNcbn1cblxuY29uc3QgU29ydFNlbGVjdGlvbnMgPSAoeyB2YWx1ZSA9IFtdLCBvbkNoYW5nZSB9OiBQcm9wcykgPT4ge1xuICBpZiAoIXZhbHVlLmxlbmd0aCkge1xuICAgIHZhbHVlLnB1c2goe1xuICAgICAgYXR0cmlidXRlOiAndGl0bGUnLFxuICAgICAgZGlyZWN0aW9uOiAnYXNjZW5kaW5nJyxcbiAgICB9KVxuICAgIG9uQ2hhbmdlKHZhbHVlLnNsaWNlKDApKVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkpzb24gPSBnZXRDb2xsZWN0aW9uQXNKc29uKHZhbHVlKVxuXG4gIGNvbnN0IHNvcnRBdHRyaWJ1dGVPcHRpb25zID0gZ2V0U29ydEF0dHJpYnV0ZU9wdGlvbnMoXG4gICAgY29sbGVjdGlvbkpzb24ubWFwKChpdGVtKSA9PiBpdGVtLmF0dHJpYnV0ZS52YWx1ZSlcbiAgKVxuXG4gIGNvbnN0IHVwZGF0ZUF0dHJpYnV0ZSA9IChpbmRleDogbnVtYmVyKSA9PiAoYXR0cmlidXRlOiBzdHJpbmcpID0+IHtcbiAgICB2YWx1ZVtpbmRleF0uYXR0cmlidXRlID0gYXR0cmlidXRlXG4gICAgb25DaGFuZ2UodmFsdWUuc2xpY2UoMCkpXG4gIH1cblxuICBjb25zdCB1cGRhdGVEaXJlY3Rpb24gPSAoaW5kZXg6IG51bWJlcikgPT4gKGRpcmVjdGlvbjogc3RyaW5nKSA9PiB7XG4gICAgdmFsdWVbaW5kZXhdLmRpcmVjdGlvbiA9IGRpcmVjdGlvblxuICAgIG9uQ2hhbmdlKHZhbHVlLnNsaWNlKDApKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlSXRlbSA9IChpbmRleDogbnVtYmVyKSA9PiAoKSA9PiB7XG4gICAgdmFsdWUuc3BsaWNlKGluZGV4LCAxKVxuICAgIG9uQ2hhbmdlKHZhbHVlLnNsaWNlKDApKVxuICB9XG5cbiAgY29uc3QgYWRkU29ydCA9ICgpID0+IHtcbiAgICB2YWx1ZS5wdXNoKHtcbiAgICAgIGF0dHJpYnV0ZTogZ2V0TmV4dEF0dHJpYnV0ZShjb2xsZWN0aW9uSnNvbiwgc29ydEF0dHJpYnV0ZU9wdGlvbnMpLFxuICAgICAgZGlyZWN0aW9uOiAnZGVzY2VuZGluZycsXG4gICAgfSlcbiAgICBvbkNoYW5nZSh2YWx1ZS5zbGljZSgwKSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgZGF0YS1pZD1cInJvb3Qtc29ydC1jb250YWluZXJcIj5cbiAgICAgIDxUeXBvZ3JhcGh5IGRhdGEtaWQ9XCJTb3J0LWNoYW5nZWRcIiBjbGFzc05hbWU9XCJwYi0yXCI+XG4gICAgICAgIFNvcnRcbiAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgIHtjb2xsZWN0aW9uSnNvbi5tYXAoKHNvcnRJdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGRhdGEtaWQ9e2Bzb3J0LWNvbnRhaW5lcmB9XG4gICAgICAgICAgICBrZXk9e3NvcnRJdGVtLmF0dHJpYnV0ZS52YWx1ZX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17aW5kZXggPiAwID8gJ3B0LTInIDogJyd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFNvcnRJdGVtXG4gICAgICAgICAgICAgIHNvcnRJdGVtPXtzb3J0SXRlbX1cbiAgICAgICAgICAgICAgYXR0cmlidXRlT3B0aW9ucz17c29ydEF0dHJpYnV0ZU9wdGlvbnN9XG4gICAgICAgICAgICAgIGRpcmVjdGlvbk9wdGlvbnM9e2dldFNvcnREaXJlY3Rpb25PcHRpb25zKFxuICAgICAgICAgICAgICAgIHNvcnRJdGVtLmF0dHJpYnV0ZS52YWx1ZVxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB1cGRhdGVBdHRyaWJ1dGU9e3VwZGF0ZUF0dHJpYnV0ZShpbmRleCl9XG4gICAgICAgICAgICAgIHVwZGF0ZURpcmVjdGlvbj17dXBkYXRlRGlyZWN0aW9uKGluZGV4KX1cbiAgICAgICAgICAgICAgb25SZW1vdmU9e3JlbW92ZUl0ZW0oaW5kZXgpfVxuICAgICAgICAgICAgICBzaG93UmVtb3ZlPXtpbmRleCAhPT0gMH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkYXRhLWlkPVwiYWRkLXNvcnQtYnV0dG9uXCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgIG9uQ2xpY2s9e2FkZFNvcnR9XG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIHdyYXA9XCJub3dyYXBcIj5cbiAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgIDxBZGRJY29uIGNsYXNzTmFtZT1cIk11aS10ZXh0LXRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8R3JpZCBpdGVtPlNvcnQ8L0dyaWQ+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFNvcnRTZWxlY3Rpb25zKVxuIl19