import { __assign, __extends } from "tslib";
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
import { ThemeProvider } from 'styled-components';
import user from '../../component/singletons/user-instance';
import withListenTo from '../backbone-container';
import $ from 'jquery';
import _ from 'underscore';
import { v4 } from 'uuid';
var sizing = {
    comfortable: {
        minimumButtonSize: '2.75rem',
        minimumLineSize: '1.875rem',
        minimumSpacing: '0.625rem',
    },
    cozy: {
        minimumButtonSize: '2.275rem',
        minimumLineSize: '1.6875rem',
        minimumSpacing: '0.4625rem',
    },
    compact: {
        minimumButtonSize: '1.8rem',
        minimumLineSize: '1.5rem',
        minimumSpacing: '0.3rem',
    },
};
var borderRadius = {
    borderRadius: '1px',
};
var screenSizes = {
    minimumScreenSize: '20rem',
    mobileScreenSize: '26.25rem',
    smallScreenSize: '58.75rem',
    mediumScreenSize: '90rem',
};
var zIndexes = {
    zIndexMenubar: 101,
    zIndexLoadingCompanion: 101,
    zIndexSlideout: 103,
    zIndexContent: 101,
    zIndexConfirmation: 103,
    zIndexHelp: 104,
    zIndexVerticalMenu: 101,
    zIndexDropdown: 103,
    zIndexMenuItem: 102,
    zIndexBlocking: 105,
};
var transitions = {
    transitionTime: '0s',
    coreTransitionTime: '0.250s',
};
var fontSizes = {
    minimumFontSize: '0.75rem',
    mediumFontSize: '1rem',
    largeFontSize: '1.25rem',
};
var spacing = function (minSpacing) {
    return {
        minimumSpacing: "".concat(minSpacing, "rem"),
        mediumSpacing: "".concat(2 * minSpacing, "rem"),
        largeSpacing: "".concat(3 * minSpacing, "rem"),
    };
};
var dividers = function (minSpacing) {
    return {
        dividerHeight: "".concat(minSpacing, "rem"),
        minimumDividerSize: "".concat(3 * minSpacing, "rem"),
    };
};
var opacity = {
    minimumOpacity: 0.6,
};
var themes = {
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{ primaryColor: string; positiveColor: strin... Remove this comment to see the full error message
    dark: {
        primaryColor: '#32a6ad',
        positiveColor: '#5b963e',
        negativeColor: '#943838',
        warningColor: '#decd39',
        favoriteColor: '#d1d179',
        backgroundNavigation: '#213137',
        backgroundAccentContent: '#34434c',
        backgroundDropdown: '#253540',
        backgroundContent: '#253540',
        backgroundModal: '#253540',
        backgroundSlideout: '#435059',
    },
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{ primaryColor: string; positiveColor: strin... Remove this comment to see the full error message
    sea: {
        primaryColor: '#32a6ad',
        positiveColor: '#154e7d',
        negativeColor: '#a32c00',
        warningColor: '#b65e1f',
        favoriteColor: '#709e33',
        backgroundNavigation: '#0f3757',
        backgroundAccentContent: '#ffffff',
        backgroundDropdown: '#ffffff',
        backgroundContent: '#ffffff',
        backgroundModal: '#e5e6e6',
        backgroundSlideout: '#e5e6e6',
    },
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{ primaryColor: string; positiveColor: strin... Remove this comment to see the full error message
    light: {
        primaryColor: '#3c6dd5',
        positiveColor: '#428442',
        negativeColor: '#8a423c',
        warningColor: '#c89600',
        favoriteColor: '#d1d179',
        backgroundNavigation: '#3c6dd5',
        backgroundAccentContent: '#edf9fc',
        backgroundDropdown: '#f3fdff',
        backgroundContent: '#f3fdff',
        backgroundModal: '#edf9fc',
        backgroundSlideout: '#edf9fc',
    },
    // @ts-expect-error ts-migrate(2739) FIXME: Type '{ primaryColor: string; positiveColor: strin... Remove this comment to see the full error message
    custom: {
        primaryColor: '#3c6dd5',
        positiveColor: '#428442',
        negativeColor: '#8a423c',
        warningColor: '#c89600',
        favoriteColor: '#d1d179',
        backgroundNavigation: '#252529',
        backgroundAccentContent: '#2A2A2E',
        backgroundDropdown: '#35353a',
        backgroundContent: '#35353a',
        backgroundModal: '#252529',
        backgroundSlideout: '#252529',
    },
};
function updateTheme(userTheme) {
    var relevantColorTheme = themes[userTheme.theme];
    if (userTheme.theme === 'custom') {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        relevantColorTheme = Object.keys(relevantColorTheme).reduce(function (newMap, key) {
            newMap[key] =
                userTheme["custom".concat(key.replace(/^\w/, function (c) { return c.toUpperCase(); }))];
            return newMap;
        }, {});
    }
    var sizingTheme = sizing['comfortable'];
    return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, relevantColorTheme), userTheme), sizingTheme), borderRadius), screenSizes), zIndexes), transitions), fontSizes), spacing(parseFloat(sizingTheme.minimumSpacing))), dividers(parseFloat(sizingTheme.minimumSpacing))), opacity);
}
function determineScreenSize() {
    var fontSize = parseInt(user.get('user').get('preferences').get('fontSize'));
    var screenSize = window.innerWidth / fontSize;
    return screenSize;
}
/*
    necessary evil since we have multiple react roots and want to share theming efficiently
    yes it's awful, yes it's contained, yes you don't have to worry about theming as you go back and forth between
    marionette and react because of this!
*/
var sharedState = __assign({ screenSize: determineScreenSize(), multiple: function (multiplier, variable, unit) {
        return "".concat(multiplier * parseFloat(variable)).concat(unit ? unit : 'rem');
    }, screenBelow: function (specifiedSize) {
        return sharedState.screenSize < parseFloat(specifiedSize);
    }, background: 'black' }, updateTheme(user.get('user').get('preferences').get('theme').toJSON()));
function updateMediaQueries() {
    sharedState.screenSize = determineScreenSize();
}
function updateSharedTheme() {
    _.extend(sharedState, updateTheme(user.get('user').get('preferences').get('theme').toJSON()));
}
$(window).on("resize.themeContainer", _.throttle(updateMediaQueries, 30));
user.get('user').get('preferences').on('change:theme', updateSharedTheme);
user.get('user').get('preferences').on('change:fontSize', updateMediaQueries);
var ThemeContainer = /** @class */ (function (_super) {
    __extends(ThemeContainer, _super);
    function ThemeContainer(props) {
        var _this = _super.call(this, props) || this;
        _this.id = v4();
        _this.isDestroyed = false;
        _this.state = sharedState;
        return _this;
    }
    ThemeContainer.prototype.componentDidMount = function () {
        this.listenForUserChanges();
        this.watchScreenSize();
    };
    ThemeContainer.prototype.componentWillUnmount = function () {
        $(window).off(".".concat(this.id));
        this.isDestroyed = true; // we have a throttled listener that updates state, so we need this!
    };
    ThemeContainer.prototype.watchScreenSize = function () {
        $(window).on("resize.".concat(this.id), _.throttle(this.syncToSharedState.bind(this), 30));
    };
    ThemeContainer.prototype.syncToSharedState = function () {
        if (this.isDestroyed === true) {
            return;
        }
        this.setState(sharedState);
    };
    ThemeContainer.prototype.listenForUserChanges = function () {
        this.props.listenTo(user.get('user').get('preferences'), 'change:theme', this.syncToSharedState.bind(this));
        this.props.listenTo(user.get('user').get('preferences'), 'change:fontSize', this.syncToSharedState.bind(this));
    };
    ThemeContainer.prototype.render = function () {
        return (React.createElement(ThemeProvider, { theme: this.state }, this.props.children));
    };
    return ThemeContainer;
}(React.Component));
export default withListenTo(ThemeContainer);
//# sourceMappingURL=theme.js.map