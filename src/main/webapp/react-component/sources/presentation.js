import { __makeTemplateObject } from "tslib";
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
import styled from 'styled-components';
import SourceItem from '../source-item';
import SourcesSummary from '../sources-summary';
import { useSources } from '../../js/model/Startup/sources.hooks';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"], ["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"])));
var SourcesCenter = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"], ["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"])), function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '100%'
        : '1200px';
}, function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize) ? '20px' : '100px';
});
export default (function () {
    var sources = useSources().sources;
    var amountDown = sources.reduce(function (blob, source) {
        if (source.available === false) {
            return blob + 1;
        }
        return blob;
    }, 0);
    return (React.createElement(Root, null,
        React.createElement(SourcesCenter, null,
            React.createElement(SourcesSummary, { amountDown: amountDown }),
            sources.map(function (source) {
                return (React.createElement(SourceItem, { key: source.id, sourceActions: source.sourceActions, id: source.id, available: source.available }));
            }))));
});
var templateObject_1, templateObject_2;
//# sourceMappingURL=presentation.js.map