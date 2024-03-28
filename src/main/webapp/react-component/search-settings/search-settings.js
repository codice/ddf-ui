import { __makeTemplateObject, __read } from "tslib";
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
import user from '../../component/singletons/user-instance';
import QuerySettings from '../../component/query-settings/query-settings';
import { UserQuery } from '../../js/model/TypedQuery';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Input from '@mui/material/Input';
import Swath from '../../component/swath/swath';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import { MuiOutlinedInputBorderClasses, Elevations, } from '../../component/theme/theme';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: hidden;\n  padding: ", ";\n"], ["\n  overflow: hidden;\n  padding: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var getResultCount = function () {
    return user.get('user').get('preferences').get('resultCount');
};
var SearchSettings = function () {
    var config = useConfiguration().config;
    var configuredMaxResultCount = (config === null || config === void 0 ? void 0 : config.resultCount) || 250;
    var _a = __read(React.useState(UserQuery() // we pass this to query settings
    ), 1), queryModel = _a[0];
    var _b = __read(React.useState(getResultCount()), 2), resultCount = _b[0], setResultCount = _b[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:resultCount', function () {
            setResultCount(getResultCount());
        });
    }, []);
    React.useEffect(function () {
        return function () {
            var _a = queryModel.toJSON(), sorts = _a.sorts, phonetics = _a.phonetics, spellcheck = _a.spellcheck, sources = _a.sources;
            user.getPreferences().get('querySettings').set({
                sorts: sorts,
                phonetics: phonetics,
                spellcheck: spellcheck,
                sources: sources,
            });
            user.savePreferences();
        };
    }, []);
    return (React.createElement(Root, null,
        React.createElement(Tooltip, { placement: "right", title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-3" },
                React.createElement(Typography, { variant: "h6" }, "For example:"),
                React.createElement(Typography, null,
                    "Searching 3 data sources with the current setting could return as many as ",
                    resultCount * 3,
                    " results in a single page.")) },
            React.createElement("div", null,
                React.createElement(Typography, { id: "resultcount-slider", className: "pb-2" }, "Results per page per data source"),
                React.createElement(Grid, { className: "w-full ".concat(MuiOutlinedInputBorderClasses), container: true, alignItems: "center", direction: "column" },
                    React.createElement(Grid, { item: true, className: "w-full" },
                        React.createElement(Input, { fullWidth: true, value: resultCount, margin: "dense", onChange: function (e) {
                                user.getPreferences().set({
                                    resultCount: Math.min(parseInt(e.target.value), configuredMaxResultCount),
                                });
                            }, inputProps: {
                                className: 'text-center',
                                step: 10,
                                min: 1,
                                max: configuredMaxResultCount,
                                type: 'number',
                                'aria-labelledby': 'resultcount-slider',
                            } })),
                    React.createElement(Grid, { item: true, className: "w-full px-10" },
                        React.createElement(Slider, { value: resultCount, onChange: function (_e, newValue) {
                                user.getPreferences().set({
                                    resultCount: newValue,
                                });
                            }, "aria-labelledby": "input-slider", min: 1, max: configuredMaxResultCount, step: 10, marks: [
                                {
                                    value: 1,
                                    label: '1',
                                },
                                {
                                    value: configuredMaxResultCount,
                                    label: "".concat(configuredMaxResultCount),
                                },
                            ] }))))),
        React.createElement("div", { className: "py-5" },
            React.createElement(Swath, { className: "w-full h-1" })),
        React.createElement(Typography, { variant: "h5" }, "Defaults for New Searches"),
        React.createElement(QuerySettings, { model: queryModel })));
};
export default hot(module)(SearchSettings);
var templateObject_1;
//# sourceMappingURL=search-settings.js.map