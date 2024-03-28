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
//# sourceMappingURL=sort-selections.js.map