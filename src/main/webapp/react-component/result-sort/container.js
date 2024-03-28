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
import { __read } from "tslib";
import { hot } from 'react-hot-loader';
import * as React from 'react';
import ResultSortPresentation from './presentation';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import Backbone from 'backbone';
import user from '../../component/singletons/user-instance';
var getResultSort = function () {
    return user.get('user').get('preferences').get('resultSort');
};
var ResultSortContainer = function (_a) {
    var closeDropdown = _a.closeDropdown;
    var _b = __read(React.useState(new Backbone.Collection(getResultSort())), 2), collection = _b[0], setCollection = _b[1];
    var _c = __read(React.useState(collection.length > 0), 2), hasSort = _c[0], setHasSort = _c[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:resultSort', function () {
            var resultSort = getResultSort();
            setHasSort(resultSort !== undefined && resultSort.length > 0);
            setCollection(new Backbone.Collection(resultSort));
        });
    }, []);
    var removeSort = function () {
        user.get('user').get('preferences').set('resultSort', undefined);
        user.get('user').get('preferences').savePreferences();
        closeDropdown();
    };
    var saveSort = function () {
        var sorting = collection.toJSON();
        user
            .get('user')
            .get('preferences')
            .set('resultSort', sorting.length === 0 ? undefined : sorting);
        user.get('user').get('preferences').savePreferences();
        closeDropdown();
    };
    return (React.createElement(ResultSortPresentation, { key: Math.random(), saveSort: saveSort, removeSort: removeSort, collection: collection, hasSort: hasSort }));
};
export default hot(module)(ResultSortContainer);
//# sourceMappingURL=container.js.map