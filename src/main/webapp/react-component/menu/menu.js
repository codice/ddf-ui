import { __assign, __extends, __makeTemplateObject } from "tslib";
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
import { useEffect } from 'react';
import styled from 'styled-components';
import { readableColor, rgba } from 'polished';
var mod = function (n, m) { return ((n % m) + m) % m; };
var MenuRoot = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  max-height: 50vh;\n  position: relative;\n"], ["\n  max-height: 50vh;\n  position: relative;\n"])));
var after = "\n  ::after {\n    display: inline-block;\n    content: '\f00c';\n    font-family: FontAwesome;\n    font-style: normal;\n    position: absolute;\n    top: 50%;\n    right: 0px;\n    width: 2.275rem;\n    text-align: center;\n    transform: translateY(-50%);\n  }\n";
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
var background = function (props) {
    if (props.theme.backgroundDropdown !== undefined) {
        return rgba(readableColor(props.theme.backgroundDropdown), 0.1);
    }
};
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
var foreground = function (props) {
    if (props.theme.backgroundDropdown !== undefined) {
        return readableColor(props.theme.backgroundDropdown);
    }
};
var ItemRoot = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: relative;\n  padding: 0px ", ";\n  padding-right: ", ";\n  box-sizing: border-box;\n  height: ", ";\n  line-height: ", ";\n  cursor: pointer;\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n  -khtml-user-select: none; /* Konqueror HTML */\n  -moz-user-select: none; /* Firefox */\n  -ms-user-select: none; /* Internet Explorer/Edge */\n  user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  ", "\n  ", "\n", "\n", "\nbackground: ", ";\n  color: ", ";\n"], ["\n  position: relative;\n  padding: 0px ", ";\n  padding-right: ", ";\n  box-sizing: border-box;\n  height: ", ";\n  line-height: ", ";\n  cursor: pointer;\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n  -khtml-user-select: none; /* Konqueror HTML */\n  -moz-user-select: none; /* Firefox */\n  -ms-user-select: none; /* Internet Explorer/Edge */\n  user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  ", "\n  ", "\n", "\n", "\nbackground: ", ";\n  color: ", ";\n"])), function (_a) {
    var theme = _a.theme;
    return theme.minimumSpacing;
}, function (_a) {
    var theme = _a.theme;
    return theme.minimumButtonSize;
}, function (_a) {
    var theme = _a.theme;
    return theme.minimumButtonSize;
}, function (_a) {
    var theme = _a.theme;
    return theme.minimumButtonSize;
}, function (_a) {
    var disabled = _a.disabled;
    return (disabled ? 'pointer-events : none' : '');
}, function (_a) {
    var theme = _a.theme, active = _a.active, disabled = _a.disabled;
    return active && !disabled
        ? "box-shadow: inset 0px 0px 0px 1px  ".concat(theme.primaryColor, ";")
        : '';
}, function (_a) {
    var selected = _a.selected;
    return (selected ? 'font-weight: bold;' : '');
}, function (_a) {
    var selected = _a.selected, disabled = _a.disabled;
    return (selected && !disabled ? after : '');
}, function (props) {
    return props.active && !props.disabled ? background(props) : 'inherit';
}, function (props) { return (props.disabled ? 'lightgrey' : foreground); });
var DocumentListener = function (props) {
    useEffect(function () {
        document.addEventListener(props.event, props.listener);
        return function () {
            document.removeEventListener(props.event, props.listener);
        };
    }, []);
    return null;
};
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { active: _this.chooseActive() };
        _this.onKeyDown = _this.onKeyDown.bind(_this);
        return _this;
    }
    Menu.prototype.chooseActive = function () {
        var selection = this.props.value;
        var active = this.state ? this.state.active : undefined;
        var itemNames = this.getChildren().map(function (child) { return child.props.value; });
        if (itemNames.includes(active)) {
            return active;
        }
        else if (itemNames.includes(selection)) {
            return selection;
        }
        else if (itemNames.length > 0) {
            return itemNames[0];
        }
        else {
            return undefined;
        }
    };
    Menu.prototype.onHover = function (active) {
        this.setState({ active: active });
    };
    Menu.prototype.getChildren = function () {
        return this.getChildrenFrom(this.props.children);
    };
    Menu.prototype.getChildrenFrom = function (children) {
        return React.Children.toArray(children).filter(function (o) { return o; });
    };
    Menu.prototype.onShift = function (offset) {
        var _this = this;
        var values = this.getChildren().map(function (_a) {
            var props = _a.props;
            return props.value;
        });
        var index = values.findIndex(function (value) { return value === _this.state.active; });
        var next = mod(index + offset, values.length);
        this.onHover(values[next]);
    };
    Menu.prototype.getValue = function (value) {
        if (this.props.multi) {
            if (this.props.value.indexOf(value) !== -1) {
                return this.props.value.filter(function (v) { return v !== value; });
            }
            else {
                return this.props.value.concat(value);
            }
        }
        else {
            return value;
        }
    };
    Menu.prototype.onChange = function (value) {
        this.props.onChange(this.getValue(value));
        if (!this.props.multi && typeof this.props.onClose === 'function') {
            this.props.onClose();
        }
    };
    Menu.prototype.onKeyDown = function (e) {
        switch (e.code) {
            case 'ArrowUp':
                e.preventDefault();
                this.onShift(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.onShift(1);
                break;
            case 'Enter':
                e.preventDefault();
                var active = this.state.active;
                if (active !== undefined) {
                    this.onChange(active);
                }
                break;
        }
    };
    Menu.prototype.componentDidUpdate = function (previousProps) {
        if (previousProps.children !== this.props.children) {
            this.setState({ active: this.chooseActive() });
        }
    };
    Menu.prototype.render = function () {
        var _this = this;
        var _a = this.props, multi = _a.multi, value = _a.value, children = _a.children;
        var childrenWithProps = this.getChildrenFrom(children).map(function (child) {
            return React.cloneElement(child, __assign({ selected: multi
                    ? value.indexOf(child.props.value) !== -1
                    : value === child.props.value, onClick: function () { return _this.onChange(child.props.value); }, active: _this.state.active === child.props.value, onHover: function () { return _this.onHover(child.props.value); } }, child.props));
        });
        return (React.createElement(MenuRoot, { className: this.props.className },
            childrenWithProps,
            React.createElement(DocumentListener, { event: "keydown", listener: this.onKeyDown })));
    };
    return Menu;
}(React.Component));
export { Menu };
export var MenuItem = function (props) {
    var value = props.value, children = props.children, selected = props.selected, onClick = props.onClick, active = props.active, onHover = props.onHover, style = props.style, disabled = props.disabled;
    return (React.createElement(ItemRoot, { selected: selected, active: active, style: style, onMouseEnter: function () { return onHover(value); }, onFocus: function () { return onHover(value); }, tabIndex: 0, onClick: function () { return onClick(value); }, disabled: disabled }, children || value));
};
MenuItem.displayName = 'MenuItem';
var templateObject_1, templateObject_2;
//# sourceMappingURL=menu.js.map