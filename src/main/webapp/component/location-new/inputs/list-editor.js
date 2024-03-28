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
import Group from '../../../react-component/group/index';
import Button from '@mui/material/Button';
var ListEditor = /** @class */ (function (_super) {
    __extends(ListEditor, _super);
    function ListEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListEditor.prototype.handleAdd = function () {
        var _a = this.props, list = _a.list, defaultItem = _a.defaultItem, onChange = _a.onChange;
        var newList = list.slice();
        newList.push(defaultItem);
        onChange(newList);
    };
    ListEditor.prototype.handleRemove = function (index) {
        var _a = this.props, list = _a.list, onChange = _a.onChange;
        var newList = list.slice();
        newList.splice(index, 1);
        onChange(newList);
    };
    ListEditor.prototype.render = function () {
        var _this = this;
        var listItems = React.Children.map(this.props.children, function (child, index) { return (React.createElement("li", { className: "item" },
            React.createElement(Group, null,
                child,
                React.createElement(Button, { onClick: _this.handleRemove.bind(_this, index) }, "Remove")))); });
        return (React.createElement("div", null,
            React.createElement("ul", { className: "list flex flex-col flex-nowrap space-y-2" }, listItems),
            React.createElement(Button, { onClick: this.handleAdd.bind(this), className: "mt-2", fullWidth: true }, "Add")));
    };
    return ListEditor;
}(React.Component));
export default ListEditor;
//# sourceMappingURL=list-editor.js.map