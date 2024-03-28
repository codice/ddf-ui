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
import { hot } from 'react-hot-loader';
import { FormattedMessage } from 'react-intl';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  width: 100%;\n  height: auto;\n  font-size: ", ";\n  text-align: center;\n  padding: ", " 0px;\n"], ["\n  display: block;\n  width: 100%;\n  height: auto;\n  font-size: ", ";\n  text-align: center;\n  padding: ", " 0px;\n"])), function (props) { return props.theme.largeFontSize; }, function (props) { return props.theme.largeSpacing; });
export default hot(module)(function (_a) {
    var amountDown = _a.amountDown;
    return (React.createElement(Root, null, amountDown == 0 ? (React.createElement(FormattedMessage, { id: "sources.available", defaultMessage: "All sources are currently up" })) : (React.createElement(FormattedMessage, { id: "sources.unavailable", defaultMessage: "{amountDown} {amountDown, plural, one {source is} other {sources are}} currently down", values: { amountDown: amountDown } }))));
});
var templateObject_1;
//# sourceMappingURL=sources-summary.js.map