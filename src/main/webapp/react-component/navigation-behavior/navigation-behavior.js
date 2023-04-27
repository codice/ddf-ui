import { __extends, __makeTemplateObject } from "tslib";
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
import { readableColor, transparentize } from 'polished';
import { hot } from 'react-hot-loader';
import $ from 'jquery';
var Wrapper = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  > *:not(.composed-menu):hover:not(button),\n  > *.is-active:not(.composed-menu):not(button),\n  .composed-menu > *:not(.composed-menu):hover:not(button),\n  .composed-menu > *:not(.composed-menu).is-active:not(button) {\n    background: ", ";\n  }\n  > button:not(.composed-menu):hover,\n  > button.is-active:not(.composed-menu),\n  .composed-menu > button:not(.composed-menu):hover,\n  .composed-menu > button:not(.composed-menu).is-active {\n    position: relative;\n  }\n  > button:not(.composed-menu):hover::before,\n  > button.is-active:not(.composed-menu)::before,\n  .composed-menu > button:not(.composed-menu):hover::before,\n  .composed-menu > button:not(.composed-menu).is-active::before {\n    content: '';\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0px;\n    left: 0px;\n    background: ", ";\n  }\n"], ["\n  > *:not(.composed-menu):hover:not(button),\n  > *.is-active:not(.composed-menu):not(button),\n  .composed-menu > *:not(.composed-menu):hover:not(button),\n  .composed-menu > *:not(.composed-menu).is-active:not(button) {\n    background: ", ";\n  }\n  > button:not(.composed-menu):hover,\n  > button.is-active:not(.composed-menu),\n  .composed-menu > button:not(.composed-menu):hover,\n  .composed-menu > button:not(.composed-menu).is-active {\n    position: relative;\n  }\n  > button:not(.composed-menu):hover::before,\n  > button.is-active:not(.composed-menu)::before,\n  .composed-menu > button:not(.composed-menu):hover::before,\n  .composed-menu > button:not(.composed-menu).is-active::before {\n    content: '';\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0px;\n    left: 0px;\n    background: ", ";\n  }\n"])), function (props) {
    return transparentize(0.9, readableColor(props.theme.background));
}, function (props) {
    return transparentize(0.9, readableColor(props.theme.background));
});
var expandComposedMenus = function (menuItems) {
    var expandedItems = [];
    var expanded = false;
    menuItems.forEach(function (element) {
        if ($(element).hasClass('composed-menu')) {
            expanded = true;
            expandedItems = expandedItems.concat($(element).children().toArray());
        }
        else {
            expandedItems.push(element);
        }
    });
    if (expanded === false) {
        return expandedItems;
    }
    else {
        return expandComposedMenus(expandedItems);
    }
};
var handleArrowKey = function (componentView, up) {
    var menuItems = componentView.getMenuItems();
    var currentActive = menuItems.filter(function (element) {
        return $(element).hasClass('is-active');
    })[0];
    var potentialNext = menuItems[menuItems.indexOf(currentActive) + (up === true ? -1 : 1)];
    if (potentialNext !== undefined) {
        $(currentActive).removeClass('is-active');
        $(potentialNext).addClass('is-active').focus();
    }
    else if (menuItems.indexOf(currentActive) === 0) {
        $(currentActive).removeClass('is-active');
        $(menuItems[menuItems.length - 1])
            .addClass('is-active')
            .focus();
    }
    else {
        $(currentActive).removeClass('is-active');
        $(menuItems[0]).addClass('is-active').focus();
    }
};
var findEnclosingMenuItem = function (menuItems, element, rootNode) {
    var matchingMenuItem = menuItems[menuItems.indexOf(element)];
    if (matchingMenuItem) {
        return matchingMenuItem;
    }
    else if (element === rootNode) {
        return undefined;
    }
    else {
        return findEnclosingMenuItem(menuItems, element.parentNode, rootNode);
    }
};
var Dropdown = /** @class */ (function (_super) {
    __extends(Dropdown, _super);
    function Dropdown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            open: false
        };
        _this.wrapperRef = React.createRef();
        _this.focus = function () {
            var menuItems = _this.getMenuItems();
            $(menuItems).removeClass('is-active');
            $(menuItems[0]).addClass('is-active').focus();
        };
        _this.getMenuItems = function () {
            return _this.getAllPossibleMenuItems().filter(function (element) { return element.offsetParent !== null; });
        };
        _this.getAllPossibleMenuItems = function () {
            if (!_this.wrapperRef.current) {
                return;
            }
            var menuItems = _this.wrapperRef.current.childNodes;
            var fullMenuItems = expandComposedMenus(menuItems);
            return fullMenuItems;
        };
        _this.listenToKeydown = function () {
            if (_this.wrapperRef.current) {
                _this.wrapperRef.current.addEventListener('keydown', _this.handleKeydown);
                _this.wrapperRef.current.addEventListener('mouseover', _this.handleMouseEnter);
            }
        };
        _this.handleMouseEnter = function (e) {
            var menuItems = _this.getMenuItems();
            var currentActive = menuItems.filter(function (element) {
                return $(element).hasClass('is-active');
            })[0];
            var mouseOver = findEnclosingMenuItem(menuItems, e.target, _this.wrapperRef.current);
            if (mouseOver) {
                $(currentActive).removeClass('is-active');
                $(mouseOver).addClass('is-active').focus();
            }
        };
        _this.handleUpArrow = function () {
            handleArrowKey(_this, true);
        };
        _this.handleDownArrow = function () {
            handleArrowKey(_this, false);
        };
        /*
              buttons take action on keydown for enter in browsers, try it for yourself
              https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_button_test
          */
        _this.handleKeydown = function (event) {
            var code = event.keyCode;
            if (event.charCode && code == 0)
                code = event.charCode;
            switch (code) {
                case 38:
                    // Key up.
                    event.preventDefault();
                    _this.handleUpArrow();
                    break;
                case 40:
                    // Key down.
                    event.preventDefault();
                    _this.handleDownArrow();
                    break;
            }
        };
        return _this;
    }
    Dropdown.prototype.listenToFocusIn = function () {
        if (this.wrapperRef.current) {
            this.wrapperRef.current.addEventListener('focus', this.focus);
        }
    };
    Dropdown.prototype.componentDidMount = function () {
        this.listenToKeydown();
        this.listenToFocusIn();
        setTimeout(this.focus, 30);
    };
    Dropdown.prototype.componentWillUnmount = function () { };
    Dropdown.prototype.render = function () {
        var _a = this.props, className = _a.className, style = _a.style;
        return (React.createElement(Wrapper, { tabIndex: 0, ref: this.wrapperRef, className: "composed-menu ".concat(className ? className : ''), style: style }, this.props.children));
    };
    return Dropdown;
}(React.Component));
export default hot(module)(Dropdown);
var templateObject_1;
//# sourceMappingURL=navigation-behavior.js.map