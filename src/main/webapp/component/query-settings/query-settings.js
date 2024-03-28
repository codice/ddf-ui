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
import PermanentSearchSort from '../../react-component/query-sort-selection/permanent-search-sort';
import * as React from 'react';
import SourceSelector from './source-selector';
import SourcesInfo from './sources-info';
import Phonetics from './phonetics';
import Spellcheck from './spellcheck';
import { hot } from 'react-hot-loader';
import { Memo } from '../memo/memo';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
/**
 * This is expensive to rerender, so we memo.  However, if the inner components aren't listening to the query,
 * this will not work.
 */
var QuerySettings = function (_a) {
    var model = _a.model, Extensions = _a.Extensions;
    var config = useConfiguration().config;
    return (React.createElement(Memo, { dependencies: [model] },
        React.createElement("div", null,
            Extensions ? React.createElement(Extensions, __assign({}, { model: model })) : null,
            (config === null || config === void 0 ? void 0 : config.isSpellcheckEnabled) ? (React.createElement("div", { className: "pb-2" },
                React.createElement(Spellcheck, { model: model }))) : null,
            (config === null || config === void 0 ? void 0 : config.isPhoneticsEnabled) ? (React.createElement("div", { className: "pb-2" },
                React.createElement(Phonetics, { model: model }))) : null,
            React.createElement("div", { className: "pb-2" },
                React.createElement(PermanentSearchSort, { model: model })),
            React.createElement("div", { className: "pb-2" },
                React.createElement(SourceSelector, { search: model })),
            React.createElement("div", null,
                React.createElement(SourcesInfo, null)))));
};
export default hot(module)(QuerySettings);
//# sourceMappingURL=query-settings.js.map