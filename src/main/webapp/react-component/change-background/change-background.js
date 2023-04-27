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
import * as React from 'react';
import { ThemeContext, ThemeProvider } from 'styled-components';
import { hot } from 'react-hot-loader';
var render = function (props) {
    var themeContext = React.useContext(ThemeContext);
    var children = props.children, color = props.color;
    var modifiedTheme = __assign(__assign({}, themeContext), { background: themeContext ? color(themeContext) : '' });
    return React.createElement(ThemeProvider, { theme: modifiedTheme }, children);
};
export default hot(module)(render);
//# sourceMappingURL=change-background.js.map