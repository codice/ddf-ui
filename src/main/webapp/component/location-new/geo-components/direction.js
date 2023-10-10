import { __extends } from "tslib";
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
import TextField from '@mui/material/TextField';
var Direction = /** @class */ (function (_super) {
    __extends(Direction, _super);
    function Direction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Direction.prototype.getToggledOption = function () {
        return this.props.value === this.props.options[0]
            ? this.props.options[1]
            : this.props.options[0];
    };
    Direction.prototype.handleMouseDown = function (e) {
        e.preventDefault();
        this.props.onChange(this.getToggledOption());
    };
    Direction.prototype.handleKeyPress = function (e) {
        var toggledOption = this.getToggledOption();
        if (String.fromCharCode(e.which).toUpperCase() === toggledOption.toUpperCase()) {
            ;
            this.props.onChange(toggledOption);
        }
    };
    Direction.prototype.render = function () {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
        var value = this.props.value;
        return (React.createElement("div", { className: "shrink-0 grow-0" },
            React.createElement(TextField, { size: "small", variant: "outlined", value: value, className: "flex-1 w-12 cursor-pointer", onMouseDown: this.handleMouseDown.bind(this), onKeyPress: this.handleKeyPress.bind(this), onChange: function (e) { return e.stopPropagation(); } })));
    };
    return Direction;
}(React.Component));
export default Direction;
//# sourceMappingURL=direction.js.map