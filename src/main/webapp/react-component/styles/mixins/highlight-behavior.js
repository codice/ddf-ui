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
import { css } from 'styled-components';
export var HighlightBehavior = function (_a) {
    var initialOpacity = _a.initialOpacity;
    return css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  opacity: ", ";\n\n  &:active,\n  &:focus,\n  &:hover {\n    opacity: 1;\n  }\n"], ["\n  opacity: ", ";\n\n  &:active,\n  &:focus,\n  &:hover {\n    opacity: 1;\n  }\n"])), initialOpacity);
};
var templateObject_1;
//# sourceMappingURL=highlight-behavior.js.map