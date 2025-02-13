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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbWVudS9tZW51LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDakMsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFOUMsSUFBTSxHQUFHLEdBQUcsVUFBQyxDQUFNLEVBQUUsQ0FBTSxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQWpCLENBQWlCLENBQUE7QUFFakQsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEdBQUcsbUhBQUEsZ0RBRzFCLElBQUEsQ0FBQTtBQUVELElBQU0sS0FBSyxHQUFHLDJRQWFiLENBQUE7QUFFRCw4RUFBOEU7QUFDOUUsSUFBTSxVQUFVLEdBQUcsVUFBQyxLQUFVO0lBQzVCLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7UUFDaEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtLQUNoRTtBQUNILENBQUMsQ0FBQTtBQUVELDhFQUE4RTtBQUM5RSxJQUFNLFVBQVUsR0FBRyxVQUFDLEtBQVU7SUFDNUIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixLQUFLLFNBQVMsRUFBRTtRQUNoRCxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUE7S0FD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RUFDUCxNQUFNLEdBSUosS0FBSyxPQUpELEVBQ04sT0FBTyxHQUdMLEtBQUssUUFIQSxFQUNQLEtBQUssR0FFSCxLQUFLLE1BRkYsRUFDTCxRQUFRLEdBQ04sS0FBSyxTQURDLENBQ0Q7SUFFVCxPQUFPLENBQ0wsb0JBQUMsUUFBUSxJQUNQLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLE1BQU0sRUFBRSxNQUFNLEVBQ2QsS0FBSyxFQUFFLEtBQUssRUFDWixZQUFZLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBZCxDQUFjLEVBQ2xDLE9BQU8sRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFkLENBQWMsRUFDN0IsUUFBUSxFQUFFLENBQUMsRUFDWCxPQUFPLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBZCxDQUFjLEVBQzdCLFFBQVEsRUFBRSxRQUFRLElBRWpCLFFBQVEsSUFBSSxLQUFLLENBQ1QsQ0FDWixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgcmVhZGFibGVDb2xvciwgcmdiYSB9IGZyb20gJ3BvbGlzaGVkJ1xuXG5jb25zdCBtb2QgPSAobjogYW55LCBtOiBhbnkpID0+ICgobiAlIG0pICsgbSkgJSBtXG5cbmNvbnN0IE1lbnVSb290ID0gc3R5bGVkLmRpdmBcbiAgbWF4LWhlaWdodDogNTB2aDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuYFxuXG5jb25zdCBhZnRlciA9IGBcbiAgOjphZnRlciB7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIGNvbnRlbnQ6ICdcXGYwMGMnO1xuICAgIGZvbnQtZmFtaWx5OiBGb250QXdlc29tZTtcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogNTAlO1xuICAgIHJpZ2h0OiAwcHg7XG4gICAgd2lkdGg6IDIuMjc1cmVtO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XG4gIH1cbmBcblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5jb25zdCBiYWNrZ3JvdW5kID0gKHByb3BzOiBhbnkpID0+IHtcbiAgaWYgKHByb3BzLnRoZW1lLmJhY2tncm91bmREcm9wZG93biAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHJnYmEocmVhZGFibGVDb2xvcihwcm9wcy50aGVtZS5iYWNrZ3JvdW5kRHJvcGRvd24pLCAwLjEpXG4gIH1cbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5jb25zdCBmb3JlZ3JvdW5kID0gKHByb3BzOiBhbnkpID0+IHtcbiAgaWYgKHByb3BzLnRoZW1lLmJhY2tncm91bmREcm9wZG93biAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHJlYWRhYmxlQ29sb3IocHJvcHMudGhlbWUuYmFja2dyb3VuZERyb3Bkb3duKVxuICB9XG59XG5cbmNvbnN0IEl0ZW1Sb290ID0gc3R5bGVkLmRpdjx7XG4gIGFjdGl2ZTogYm9vbGVhblxuICBkaXNhYmxlZDogYm9vbGVhblxuICBzZWxlY3RlZDogYm9vbGVhblxufT5gXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgcGFkZGluZzogMHB4ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUubWluaW11bVNwYWNpbmd9O1xuICBwYWRkaW5nLXJpZ2h0OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLm1pbmltdW1CdXR0b25TaXplfTtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgaGVpZ2h0OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLm1pbmltdW1CdXR0b25TaXplfTtcbiAgbGluZS1oZWlnaHQ6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUubWluaW11bUJ1dHRvblNpemV9O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTsgLyogaU9TIFNhZmFyaSAqL1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lOyAvKiBTYWZhcmkgKi9cbiAgLWtodG1sLXVzZXItc2VsZWN0OiBub25lOyAvKiBLb25xdWVyb3IgSFRNTCAqL1xuICAtbW96LXVzZXItc2VsZWN0OiBub25lOyAvKiBGaXJlZm94ICovXG4gIC1tcy11c2VyLXNlbGVjdDogbm9uZTsgLyogSW50ZXJuZXQgRXhwbG9yZXIvRWRnZSAqL1xuICB1c2VyLXNlbGVjdDogbm9uZTsgLyogTm9uLXByZWZpeGVkIHZlcnNpb24sIGN1cnJlbnRseSBzdXBwb3J0ZWQgYnkgQ2hyb21lIGFuZCBPcGVyYSAqL1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgJHsoeyBkaXNhYmxlZCB9KSA9PiAoZGlzYWJsZWQgPyAncG9pbnRlci1ldmVudHMgOiBub25lJyA6ICcnKX1cbiAgJHsoeyB0aGVtZSwgYWN0aXZlLCBkaXNhYmxlZCB9KSA9PlxuICAgIGFjdGl2ZSAmJiAhZGlzYWJsZWRcbiAgICAgID8gYGJveC1zaGFkb3c6IGluc2V0IDBweCAwcHggMHB4IDFweCAgJHt0aGVtZS5wcmltYXJ5Q29sb3J9O2BcbiAgICAgIDogJyd9XG4keyh7IHNlbGVjdGVkIH0pID0+IChzZWxlY3RlZCA/ICdmb250LXdlaWdodDogYm9sZDsnIDogJycpfVxuJHsoeyBzZWxlY3RlZCwgZGlzYWJsZWQgfSkgPT4gKHNlbGVjdGVkICYmICFkaXNhYmxlZCA/IGFmdGVyIDogJycpfVxuYmFja2dyb3VuZDogJHsocHJvcHMpID0+XG4gICAgcHJvcHMuYWN0aXZlICYmICFwcm9wcy5kaXNhYmxlZCA/IGJhY2tncm91bmQocHJvcHMpIDogJ2luaGVyaXQnfTtcbiAgY29sb3I6ICR7KHByb3BzKSA9PiAocHJvcHMuZGlzYWJsZWQgPyAnbGlnaHRncmV5JyA6IGZvcmVncm91bmQpfTtcbmBcblxuY29uc3QgRG9jdW1lbnRMaXN0ZW5lciA9IChwcm9wczogYW55KSA9PiB7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihwcm9wcy5ldmVudCwgcHJvcHMubGlzdGVuZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIocHJvcHMuZXZlbnQsIHByb3BzLmxpc3RlbmVyKVxuICAgIH1cbiAgfSwgW10pXG4gIHJldHVybiBudWxsXG59XG5cbmludGVyZmFjZSBNZW51UHJvcHMge1xuICAvKiogQ3VycmVudGx5IHNlbGVjdGVkIHZhbHVlIG9mIHRoZSBwcm92aWRlZCBgPE1lbnVJdGVtcyAvPmAuICovXG4gIHZhbHVlPzogYW55XG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIG11bHRpcGxlIGl0ZW1zIGNhbiBiZSBzZWxlY3RlZFxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbXVsdGk/OiBib29sZWFuXG4gIC8qKlxuICAgKiBNZW51SXRlbXNcbiAgICovXG4gIGNoaWxkcmVuPzogYW55XG4gIC8qKiBPcHRpb25hbCB2YWx1ZSBjaGFuZ2UgaGFuZGxlci4gKi9cbiAgb25DaGFuZ2U6ICh2YWx1ZTogYW55KSA9PiB2b2lkXG4gIC8qKiBPcHRpb25hbCBjbGFzc05hbWUgdG8gc3R5bGUgcm9vdCBtZW51IGVsZW1lbnQuICAqL1xuICBjbGFzc05hbWU/OiBzdHJpbmdcblxuICBvbkNsb3NlPzogKCkgPT4gdm9pZFxufVxuXG50eXBlIE1lbnVTdGF0ZSA9IHtcbiAgYWN0aXZlOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PE1lbnVQcm9wcywgTWVudVN0YXRlPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBNZW51UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBhY3RpdmU6IHRoaXMuY2hvb3NlQWN0aXZlKCkgfVxuICAgIHRoaXMub25LZXlEb3duID0gdGhpcy5vbktleURvd24uYmluZCh0aGlzKVxuICB9XG4gIGNob29zZUFjdGl2ZSgpIHtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLnByb3BzLnZhbHVlXG4gICAgY29uc3QgYWN0aXZlID0gdGhpcy5zdGF0ZSA/IHRoaXMuc3RhdGUuYWN0aXZlIDogdW5kZWZpbmVkXG4gICAgY29uc3QgaXRlbU5hbWVzID0gdGhpcy5nZXRDaGlsZHJlbigpLm1hcCgoY2hpbGQ6IGFueSkgPT4gY2hpbGQucHJvcHMudmFsdWUpXG4gICAgaWYgKGl0ZW1OYW1lcy5pbmNsdWRlcyhhY3RpdmUpKSB7XG4gICAgICByZXR1cm4gYWN0aXZlXG4gICAgfSBlbHNlIGlmIChpdGVtTmFtZXMuaW5jbHVkZXMoc2VsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHNlbGVjdGlvblxuICAgIH0gZWxzZSBpZiAoaXRlbU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBpdGVtTmFtZXNbMF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuICBvbkhvdmVyKGFjdGl2ZTogYW55KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZSB9KVxuICB9XG4gIGdldENoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLmdldENoaWxkcmVuRnJvbSh0aGlzLnByb3BzLmNoaWxkcmVuKVxuICB9XG4gIGdldENoaWxkcmVuRnJvbShjaGlsZHJlbjogYW55KSB7XG4gICAgcmV0dXJuIFJlYWN0LkNoaWxkcmVuLnRvQXJyYXkoY2hpbGRyZW4pLmZpbHRlcigobzogYW55KSA9PiBvKVxuICB9XG4gIG9uU2hpZnQob2Zmc2V0OiBhbnkpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldENoaWxkcmVuKCkubWFwKCh7IHByb3BzIH06IGFueSkgPT4gcHJvcHMudmFsdWUpXG4gICAgY29uc3QgaW5kZXggPSB2YWx1ZXMuZmluZEluZGV4KCh2YWx1ZTogYW55KSA9PiB2YWx1ZSA9PT0gdGhpcy5zdGF0ZS5hY3RpdmUpXG4gICAgY29uc3QgbmV4dCA9IG1vZChpbmRleCArIG9mZnNldCwgdmFsdWVzLmxlbmd0aClcbiAgICB0aGlzLm9uSG92ZXIodmFsdWVzW25leHRdKVxuICB9XG4gIGdldFZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5tdWx0aSkge1xuICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUuaW5kZXhPZih2YWx1ZSkgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlLmZpbHRlcigodjogYW55KSA9PiB2ICE9PSB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlLmNvbmNhdCh2YWx1ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9XG4gIG9uQ2hhbmdlKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMuZ2V0VmFsdWUodmFsdWUpKVxuXG4gICAgaWYgKCF0aGlzLnByb3BzLm11bHRpICYmIHR5cGVvZiB0aGlzLnByb3BzLm9uQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpXG4gICAgfVxuICB9XG4gIG9uS2V5RG93bihlOiBhbnkpIHtcbiAgICBzd2l0Y2ggKGUuY29kZSkge1xuICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB0aGlzLm9uU2hpZnQoLTEpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgdGhpcy5vblNoaWZ0KDEpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdFbnRlcic6XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCB7IGFjdGl2ZSB9ID0gdGhpcy5zdGF0ZVxuICAgICAgICBpZiAoYWN0aXZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aGlzLm9uQ2hhbmdlKGFjdGl2ZSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuICBjb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wczogTWVudVByb3BzKSB7XG4gICAgaWYgKHByZXZpb3VzUHJvcHMuY2hpbGRyZW4gIT09IHRoaXMucHJvcHMuY2hpbGRyZW4pIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBhY3RpdmU6IHRoaXMuY2hvb3NlQWN0aXZlKCkgfSlcbiAgICB9XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgbXVsdGksIHZhbHVlLCBjaGlsZHJlbiB9ID0gdGhpcy5wcm9wc1xuXG4gICAgY29uc3QgY2hpbGRyZW5XaXRoUHJvcHMgPSB0aGlzLmdldENoaWxkcmVuRnJvbShjaGlsZHJlbikubWFwKFxuICAgICAgKGNoaWxkOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZCwge1xuICAgICAgICAgIHNlbGVjdGVkOiBtdWx0aVxuICAgICAgICAgICAgPyB2YWx1ZS5pbmRleE9mKGNoaWxkLnByb3BzLnZhbHVlKSAhPT0gLTFcbiAgICAgICAgICAgIDogdmFsdWUgPT09IGNoaWxkLnByb3BzLnZhbHVlLFxuICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHRoaXMub25DaGFuZ2UoY2hpbGQucHJvcHMudmFsdWUpLFxuICAgICAgICAgIGFjdGl2ZTogdGhpcy5zdGF0ZS5hY3RpdmUgPT09IGNoaWxkLnByb3BzLnZhbHVlLFxuICAgICAgICAgIG9uSG92ZXI6ICgpID0+IHRoaXMub25Ib3ZlcihjaGlsZC5wcm9wcy52YWx1ZSksXG4gICAgICAgICAgLi4uY2hpbGQucHJvcHMsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxNZW51Um9vdCBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lfT5cbiAgICAgICAge2NoaWxkcmVuV2l0aFByb3BzfVxuICAgICAgICA8RG9jdW1lbnRMaXN0ZW5lciBldmVudD1cImtleWRvd25cIiBsaXN0ZW5lcj17dGhpcy5vbktleURvd259IC8+XG4gICAgICA8L01lbnVSb290PlxuICAgIClcbiAgfVxufVxuXG50eXBlIE1lbnVJdGVtUHJvcHMgPSB7XG4gIC8qKiBBIHZhbHVlIHRvIHJlcHJlc2VudCB0aGUgY3VycmVudCBJdGVtICovXG4gIHZhbHVlPzogYW55XG4gIC8qKlxuICAgKiBDaGlsZHJlbiB0byBkaXNwbGF5IGZvciBtZW51IGl0ZW0uXG4gICAqXG4gICAqIEBkZWZhdWx0IHZhbHVlXG4gICAqL1xuICBjaGlsZHJlbj86IGFueVxuICAvKiogT3B0aW9uYWwgc3R5bGVzIGZvciByb290IGVsZW1lbnQuICovXG4gIHN0eWxlPzogb2JqZWN0XG4gIHNlbGVjdGVkPzogYW55XG4gIG9uQ2xpY2s/OiBhbnlcbiAgYWN0aXZlPzogYW55XG4gIGRpc2FibGVkPzogYW55XG4gIG9uSG92ZXI/OiBhbnlcbn1cblxuZXhwb3J0IGNvbnN0IE1lbnVJdGVtID0gKHByb3BzOiBNZW51SXRlbVByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICB2YWx1ZSxcbiAgICBjaGlsZHJlbixcbiAgICBzZWxlY3RlZCxcbiAgICBvbkNsaWNrLFxuICAgIGFjdGl2ZSxcbiAgICBvbkhvdmVyLFxuICAgIHN0eWxlLFxuICAgIGRpc2FibGVkLFxuICB9ID0gcHJvcHNcblxuICByZXR1cm4gKFxuICAgIDxJdGVtUm9vdFxuICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgYWN0aXZlPXthY3RpdmV9XG4gICAgICBzdHlsZT17c3R5bGV9XG4gICAgICBvbk1vdXNlRW50ZXI9eygpID0+IG9uSG92ZXIodmFsdWUpfVxuICAgICAgb25Gb2N1cz17KCkgPT4gb25Ib3Zlcih2YWx1ZSl9XG4gICAgICB0YWJJbmRleD17MH1cbiAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2xpY2sodmFsdWUpfVxuICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgID5cbiAgICAgIHtjaGlsZHJlbiB8fCB2YWx1ZX1cbiAgICA8L0l0ZW1Sb290PlxuICApXG59XG5cbk1lbnVJdGVtLmRpc3BsYXlOYW1lID0gJ01lbnVJdGVtJ1xuIl19