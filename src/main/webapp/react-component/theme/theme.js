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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3RoZW1lL3RoZW1lLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQU1qRCxPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUUzRCxPQUFPLFlBQW1DLE1BQU0sdUJBQXVCLENBQUE7QUFDdkUsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBU3pCLElBQU0sTUFBTSxHQUFvQjtJQUM5QixXQUFXLEVBQUU7UUFDWCxpQkFBaUIsRUFBRSxTQUFTO1FBQzVCLGVBQWUsRUFBRSxVQUFVO1FBQzNCLGNBQWMsRUFBRSxVQUFVO0tBQzNCO0lBQ0QsSUFBSSxFQUFFO1FBQ0osaUJBQWlCLEVBQUUsVUFBVTtRQUM3QixlQUFlLEVBQUUsV0FBVztRQUM1QixjQUFjLEVBQUUsV0FBVztLQUM1QjtJQUNELE9BQU8sRUFBRTtRQUNQLGlCQUFpQixFQUFFLFFBQVE7UUFDM0IsZUFBZSxFQUFFLFFBQVE7UUFDekIsY0FBYyxFQUFFLFFBQVE7S0FDekI7Q0FDRixDQUFBO0FBRUQsSUFBTSxZQUFZLEdBQUc7SUFDbkIsWUFBWSxFQUFFLEtBQUs7Q0FDcEIsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHO0lBQ2xCLGlCQUFpQixFQUFFLE9BQU87SUFDMUIsZ0JBQWdCLEVBQUUsVUFBVTtJQUM1QixlQUFlLEVBQUUsVUFBVTtJQUMzQixnQkFBZ0IsRUFBRSxPQUFPO0NBQzFCLENBQUE7QUFFRCxJQUFNLFFBQVEsR0FB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N0IsT0FBTTtTQUNQO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUM1QixDQUFDO0lBQ0QsNkNBQW9CLEdBQXBCO1FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUNuQyxjQUFjLEVBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDbEMsQ0FBQTtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFDbkMsaUJBQWlCLEVBQ2pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ2xDLENBQUE7SUFDSCxDQUFDO0lBQ0QsK0JBQU0sR0FBTjtRQUNFLE9BQU8sQ0FDTCxvQkFBQyxhQUFhLElBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQWlCLENBQ3hFLENBQUE7SUFDSCxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBL0NELENBQTZCLEtBQUssQ0FBQyxTQUFTLEdBK0MzQztBQUVELGVBQWUsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFRoZW1lUHJvdmlkZXIgfSBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7XG4gIFRoZW1lSW50ZXJmYWNlLFxuICBTcGVjaWZpY1NpemluZ0ludGVyZmFjZSxcbiAgVGhlbWVDb2xvckludGVyZmFjZSxcbn0gZnJvbSAnLi4vc3R5bGVzL3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcblxuaW1wb3J0IHdpdGhMaXN0ZW5UbywgeyBXaXRoQmFja2JvbmVQcm9wcyB9IGZyb20gJy4uL2JhY2tib25lLWNvbnRhaW5lcidcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyB2NCB9IGZyb20gJ3V1aWQnXG5cbnR5cGUgU2l6aW5nSW50ZXJmYWNlID0ge1xuICBjb21mb3J0YWJsZTogU3BlY2lmaWNTaXppbmdJbnRlcmZhY2VcbiAgY296eTogU3BlY2lmaWNTaXppbmdJbnRlcmZhY2VcbiAgY29tcGFjdDogU3BlY2lmaWNTaXppbmdJbnRlcmZhY2VcbiAgW2tleTogc3RyaW5nXTogU3BlY2lmaWNTaXppbmdJbnRlcmZhY2Vcbn1cblxuY29uc3Qgc2l6aW5nOiBTaXppbmdJbnRlcmZhY2UgPSB7XG4gIGNvbWZvcnRhYmxlOiB7XG4gICAgbWluaW11bUJ1dHRvblNpemU6ICcyLjc1cmVtJyxcbiAgICBtaW5pbXVtTGluZVNpemU6ICcxLjg3NXJlbScsXG4gICAgbWluaW11bVNwYWNpbmc6ICcwLjYyNXJlbScsXG4gIH0sXG4gIGNvenk6IHtcbiAgICBtaW5pbXVtQnV0dG9uU2l6ZTogJzIuMjc1cmVtJyxcbiAgICBtaW5pbXVtTGluZVNpemU6ICcxLjY4NzVyZW0nLFxuICAgIG1pbmltdW1TcGFjaW5nOiAnMC40NjI1cmVtJyxcbiAgfSxcbiAgY29tcGFjdDoge1xuICAgIG1pbmltdW1CdXR0b25TaXplOiAnMS44cmVtJyxcbiAgICBtaW5pbXVtTGluZVNpemU6ICcxLjVyZW0nLFxuICAgIG1pbmltdW1TcGFjaW5nOiAnMC4zcmVtJyxcbiAgfSxcbn1cblxuY29uc3QgYm9yZGVyUmFkaXVzID0ge1xuICBib3JkZXJSYWRpdXM6ICcxcHgnLFxufVxuXG5jb25zdCBzY3JlZW5TaXplcyA9IHtcbiAgbWluaW11bVNjcmVlblNpemU6ICcyMHJlbScsXG4gIG1vYmlsZVNjcmVlblNpemU6ICcyNi4yNXJlbScsXG4gIHNtYWxsU2NyZWVuU2l6ZTogJzU4Ljc1cmVtJyxcbiAgbWVkaXVtU2NyZWVuU2l6ZTogJzkwcmVtJyxcbn1cblxuY29uc3QgekluZGV4ZXMgPSB7XG4gIHpJbmRleE1lbnViYXI6IDEwMSxcbiAgekluZGV4TG9hZGluZ0NvbXBhbmlvbjogMTAxLFxuICB6SW5kZXhTbGlkZW91dDogMTAzLFxuICB6SW5kZXhDb250ZW50OiAxMDEsXG4gIHpJbmRleENvbmZpcm1hdGlvbjogMTAzLFxuICB6SW5kZXhIZWxwOiAxMDQsXG4gIHpJbmRleFZlcnRpY2FsTWVudTogMTAxLFxuICB6SW5kZXhEcm9wZG93bjogMTAzLFxuICB6SW5kZXhNZW51SXRlbTogMTAyLFxuICB6SW5kZXhCbG9ja2luZzogMTA1LFxufVxuXG5jb25zdCB0cmFuc2l0aW9ucyA9IHtcbiAgdHJhbnNpdGlvblRpbWU6ICcwcycsXG4gIGNvcmVUcmFuc2l0aW9uVGltZTogJzAuMjUwcycsXG59XG5cbmNvbnN0IGZvbnRTaXplcyA9IHtcbiAgbWluaW11bUZvbnRTaXplOiAnMC43NXJlbScsXG4gIG1lZGl1bUZvbnRTaXplOiAnMXJlbScsXG4gIGxhcmdlRm9udFNpemU6ICcxLjI1cmVtJyxcbn1cblxuY29uc3Qgc3BhY2luZyA9IChtaW5TcGFjaW5nOiBudW1iZXIpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBtaW5pbXVtU3BhY2luZzogYCR7bWluU3BhY2luZ31yZW1gLFxuICAgIG1lZGl1bVNwYWNpbmc6IGAkezIgKiBtaW5TcGFjaW5nfXJlbWAsXG4gICAgbGFyZ2VTcGFjaW5nOiBgJHszICogbWluU3BhY2luZ31yZW1gLFxuICB9XG59XG5cbmNvbnN0IGRpdmlkZXJzID0gKG1pblNwYWNpbmc6IG51bWJlcikgPT4ge1xuICByZXR1cm4ge1xuICAgIGRpdmlkZXJIZWlnaHQ6IGAke21pblNwYWNpbmd9cmVtYCxcbiAgICBtaW5pbXVtRGl2aWRlclNpemU6IGAkezMgKiBtaW5TcGFjaW5nfXJlbWAsXG4gIH1cbn1cblxuY29uc3Qgb3BhY2l0eSA9IHtcbiAgbWluaW11bU9wYWNpdHk6IDAuNixcbn1cblxudHlwZSBUaGVtZXNJbnRlcmZhY2UgPSB7XG4gIGRhcms6IFRoZW1lQ29sb3JJbnRlcmZhY2VcbiAgc2VhOiBUaGVtZUNvbG9ySW50ZXJmYWNlXG4gIGxpZ2h0OiBUaGVtZUNvbG9ySW50ZXJmYWNlXG4gIGN1c3RvbTogVGhlbWVDb2xvckludGVyZmFjZVxuICBba2V5OiBzdHJpbmddOiBUaGVtZUNvbG9ySW50ZXJmYWNlXG59XG5cbmNvbnN0IHRoZW1lczogVGhlbWVzSW50ZXJmYWNlID0ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjczOSkgRklYTUU6IFR5cGUgJ3sgcHJpbWFyeUNvbG9yOiBzdHJpbmc7IHBvc2l0aXZlQ29sb3I6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgZGFyazoge1xuICAgIHByaW1hcnlDb2xvcjogJyMzMmE2YWQnLFxuICAgIHBvc2l0aXZlQ29sb3I6ICcjNWI5NjNlJyxcbiAgICBuZWdhdGl2ZUNvbG9yOiAnIzk0MzgzOCcsXG4gICAgd2FybmluZ0NvbG9yOiAnI2RlY2QzOScsXG4gICAgZmF2b3JpdGVDb2xvcjogJyNkMWQxNzknLFxuICAgIGJhY2tncm91bmROYXZpZ2F0aW9uOiAnIzIxMzEzNycsXG4gICAgYmFja2dyb3VuZEFjY2VudENvbnRlbnQ6ICcjMzQ0MzRjJyxcbiAgICBiYWNrZ3JvdW5kRHJvcGRvd246ICcjMjUzNTQwJyxcbiAgICBiYWNrZ3JvdW5kQ29udGVudDogJyMyNTM1NDAnLFxuICAgIGJhY2tncm91bmRNb2RhbDogJyMyNTM1NDAnLFxuICAgIGJhY2tncm91bmRTbGlkZW91dDogJyM0MzUwNTknLFxuICB9LFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjczOSkgRklYTUU6IFR5cGUgJ3sgcHJpbWFyeUNvbG9yOiBzdHJpbmc7IHBvc2l0aXZlQ29sb3I6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgc2VhOiB7XG4gICAgcHJpbWFyeUNvbG9yOiAnIzMyYTZhZCcsXG4gICAgcG9zaXRpdmVDb2xvcjogJyMxNTRlN2QnLFxuICAgIG5lZ2F0aXZlQ29sb3I6ICcjYTMyYzAwJyxcbiAgICB3YXJuaW5nQ29sb3I6ICcjYjY1ZTFmJyxcbiAgICBmYXZvcml0ZUNvbG9yOiAnIzcwOWUzMycsXG4gICAgYmFja2dyb3VuZE5hdmlnYXRpb246ICcjMGYzNzU3JyxcbiAgICBiYWNrZ3JvdW5kQWNjZW50Q29udGVudDogJyNmZmZmZmYnLFxuICAgIGJhY2tncm91bmREcm9wZG93bjogJyNmZmZmZmYnLFxuICAgIGJhY2tncm91bmRDb250ZW50OiAnI2ZmZmZmZicsXG4gICAgYmFja2dyb3VuZE1vZGFsOiAnI2U1ZTZlNicsXG4gICAgYmFja2dyb3VuZFNsaWRlb3V0OiAnI2U1ZTZlNicsXG4gIH0sXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNzM5KSBGSVhNRTogVHlwZSAneyBwcmltYXJ5Q29sb3I6IHN0cmluZzsgcG9zaXRpdmVDb2xvcjogc3RyaW4uLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBsaWdodDoge1xuICAgIHByaW1hcnlDb2xvcjogJyMzYzZkZDUnLFxuICAgIHBvc2l0aXZlQ29sb3I6ICcjNDI4NDQyJyxcbiAgICBuZWdhdGl2ZUNvbG9yOiAnIzhhNDIzYycsXG4gICAgd2FybmluZ0NvbG9yOiAnI2M4OTYwMCcsXG4gICAgZmF2b3JpdGVDb2xvcjogJyNkMWQxNzknLFxuICAgIGJhY2tncm91bmROYXZpZ2F0aW9uOiAnIzNjNmRkNScsXG4gICAgYmFja2dyb3VuZEFjY2VudENvbnRlbnQ6ICcjZWRmOWZjJyxcbiAgICBiYWNrZ3JvdW5kRHJvcGRvd246ICcjZjNmZGZmJyxcbiAgICBiYWNrZ3JvdW5kQ29udGVudDogJyNmM2ZkZmYnLFxuICAgIGJhY2tncm91bmRNb2RhbDogJyNlZGY5ZmMnLFxuICAgIGJhY2tncm91bmRTbGlkZW91dDogJyNlZGY5ZmMnLFxuICB9LFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjczOSkgRklYTUU6IFR5cGUgJ3sgcHJpbWFyeUNvbG9yOiBzdHJpbmc7IHBvc2l0aXZlQ29sb3I6IHN0cmluLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgY3VzdG9tOiB7XG4gICAgcHJpbWFyeUNvbG9yOiAnIzNjNmRkNScsXG4gICAgcG9zaXRpdmVDb2xvcjogJyM0Mjg0NDInLFxuICAgIG5lZ2F0aXZlQ29sb3I6ICcjOGE0MjNjJyxcbiAgICB3YXJuaW5nQ29sb3I6ICcjYzg5NjAwJyxcbiAgICBmYXZvcml0ZUNvbG9yOiAnI2QxZDE3OScsXG4gICAgYmFja2dyb3VuZE5hdmlnYXRpb246ICcjMjUyNTI5JyxcbiAgICBiYWNrZ3JvdW5kQWNjZW50Q29udGVudDogJyMyQTJBMkUnLFxuICAgIGJhY2tncm91bmREcm9wZG93bjogJyMzNTM1M2EnLFxuICAgIGJhY2tncm91bmRDb250ZW50OiAnIzM1MzUzYScsXG4gICAgYmFja2dyb3VuZE1vZGFsOiAnIzI1MjUyOScsXG4gICAgYmFja2dyb3VuZFNsaWRlb3V0OiAnIzI1MjUyOScsXG4gIH0sXG59XG5cbnR5cGUgVXNlclRoZW1lID0ge1xuICB0aGVtZTogc3RyaW5nXG4gIFtrZXk6IHN0cmluZ106IHN0cmluZ1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUaGVtZSh1c2VyVGhlbWU6IFVzZXJUaGVtZSkge1xuICBsZXQgcmVsZXZhbnRDb2xvclRoZW1lID0gdGhlbWVzW3VzZXJUaGVtZS50aGVtZV1cbiAgaWYgKHVzZXJUaGVtZS50aGVtZSA9PT0gJ2N1c3RvbScpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjc2OSkgRklYTUU6IE5vIG92ZXJsb2FkIG1hdGNoZXMgdGhpcyBjYWxsLlxuICAgIHJlbGV2YW50Q29sb3JUaGVtZSA9IE9iamVjdC5rZXlzKHJlbGV2YW50Q29sb3JUaGVtZSkucmVkdWNlKFxuICAgICAgKG5ld01hcDogVXNlclRoZW1lLCBrZXkpID0+IHtcbiAgICAgICAgbmV3TWFwW2tleV0gPVxuICAgICAgICAgIHVzZXJUaGVtZVtgY3VzdG9tJHtrZXkucmVwbGFjZSgvXlxcdy8sIChjKSA9PiBjLnRvVXBwZXJDYXNlKCkpfWBdXG4gICAgICAgIHJldHVybiBuZXdNYXBcbiAgICAgIH0sXG4gICAgICB7fVxuICAgICkgYXMgVGhlbWVDb2xvckludGVyZmFjZVxuICB9XG4gIGxldCBzaXppbmdUaGVtZSA9IHNpemluZ1snY29tZm9ydGFibGUnXVxuICByZXR1cm4ge1xuICAgIC4uLnJlbGV2YW50Q29sb3JUaGVtZSxcbiAgICAuLi51c2VyVGhlbWUsXG4gICAgLi4uc2l6aW5nVGhlbWUsXG4gICAgLi4uYm9yZGVyUmFkaXVzLFxuICAgIC4uLnNjcmVlblNpemVzLFxuICAgIC4uLnpJbmRleGVzLFxuICAgIC4uLnRyYW5zaXRpb25zLFxuICAgIC4uLmZvbnRTaXplcyxcbiAgICAuLi5zcGFjaW5nKHBhcnNlRmxvYXQoc2l6aW5nVGhlbWUubWluaW11bVNwYWNpbmcpKSxcbiAgICAuLi5kaXZpZGVycyhwYXJzZUZsb2F0KHNpemluZ1RoZW1lLm1pbmltdW1TcGFjaW5nKSksXG4gICAgLi4ub3BhY2l0eSxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZXRlcm1pbmVTY3JlZW5TaXplKCkge1xuICBjb25zdCBmb250U2l6ZSA9IHBhcnNlSW50KHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZm9udFNpemUnKSlcbiAgY29uc3Qgc2NyZWVuU2l6ZSA9IHdpbmRvdy5pbm5lcldpZHRoIC8gZm9udFNpemVcbiAgcmV0dXJuIHNjcmVlblNpemVcbn1cblxuLypcbiAgICBuZWNlc3NhcnkgZXZpbCBzaW5jZSB3ZSBoYXZlIG11bHRpcGxlIHJlYWN0IHJvb3RzIGFuZCB3YW50IHRvIHNoYXJlIHRoZW1pbmcgZWZmaWNpZW50bHlcbiAgICB5ZXMgaXQncyBhd2Z1bCwgeWVzIGl0J3MgY29udGFpbmVkLCB5ZXMgeW91IGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgdGhlbWluZyBhcyB5b3UgZ28gYmFjayBhbmQgZm9ydGggYmV0d2VlblxuICAgIG1hcmlvbmV0dGUgYW5kIHJlYWN0IGJlY2F1c2Ugb2YgdGhpcyFcbiovXG5jb25zdCBzaGFyZWRTdGF0ZTogVGhlbWVJbnRlcmZhY2UgPSB7XG4gIHNjcmVlblNpemU6IGRldGVybWluZVNjcmVlblNpemUoKSxcbiAgbXVsdGlwbGU6IChtdWx0aXBsaWVyOiBudW1iZXIsIHZhcmlhYmxlOiBzdHJpbmcsIHVuaXQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBgJHttdWx0aXBsaWVyICogcGFyc2VGbG9hdCh2YXJpYWJsZSl9JHt1bml0ID8gdW5pdCA6ICdyZW0nfWBcbiAgfSxcbiAgc2NyZWVuQmVsb3c6IChzcGVjaWZpZWRTaXplOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gc2hhcmVkU3RhdGUuc2NyZWVuU2l6ZSA8IHBhcnNlRmxvYXQoc3BlY2lmaWVkU2l6ZSlcbiAgfSxcbiAgYmFja2dyb3VuZDogJ2JsYWNrJyxcbiAgLi4udXBkYXRlVGhlbWUodXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCd0aGVtZScpLnRvSlNPTigpKSxcbn1cblxuZnVuY3Rpb24gdXBkYXRlTWVkaWFRdWVyaWVzKCkge1xuICBzaGFyZWRTdGF0ZS5zY3JlZW5TaXplID0gZGV0ZXJtaW5lU2NyZWVuU2l6ZSgpXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVNoYXJlZFRoZW1lKCkge1xuICBfLmV4dGVuZChcbiAgICBzaGFyZWRTdGF0ZSxcbiAgICB1cGRhdGVUaGVtZSh1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3RoZW1lJykudG9KU09OKCkpXG4gIClcbn1cblxuJCh3aW5kb3cpLm9uKGByZXNpemUudGhlbWVDb250YWluZXJgLCBfLnRocm90dGxlKHVwZGF0ZU1lZGlhUXVlcmllcywgMzApKVxudXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykub24oJ2NoYW5nZTp0aGVtZScsIHVwZGF0ZVNoYXJlZFRoZW1lKVxudXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykub24oJ2NoYW5nZTpmb250U2l6ZScsIHVwZGF0ZU1lZGlhUXVlcmllcylcbmNsYXNzIFRoZW1lQ29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFxuICBXaXRoQmFja2JvbmVQcm9wcyAmIHsgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZSB9LFxuICBUaGVtZUludGVyZmFjZVxuPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBXaXRoQmFja2JvbmVQcm9wcyAmIHsgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZSB9KSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHNoYXJlZFN0YXRlXG4gIH1cbiAgaWQgPSB2NCgpXG4gIGlzRGVzdHJveWVkID0gZmFsc2VcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5saXN0ZW5Gb3JVc2VyQ2hhbmdlcygpXG4gICAgdGhpcy53YXRjaFNjcmVlblNpemUoKVxuICB9XG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICQod2luZG93KS5vZmYoYC4ke3RoaXMuaWR9YClcbiAgICB0aGlzLmlzRGVzdHJveWVkID0gdHJ1ZSAvLyB3ZSBoYXZlIGEgdGhyb3R0bGVkIGxpc3RlbmVyIHRoYXQgdXBkYXRlcyBzdGF0ZSwgc28gd2UgbmVlZCB0aGlzIVxuICB9XG4gIHdhdGNoU2NyZWVuU2l6ZSgpIHtcbiAgICAkKHdpbmRvdykub24oXG4gICAgICBgcmVzaXplLiR7dGhpcy5pZH1gLFxuICAgICAgXy50aHJvdHRsZSh0aGlzLnN5bmNUb1NoYXJlZFN0YXRlLmJpbmQodGhpcyksIDMwKVxuICAgIClcbiAgfVxuICBzeW5jVG9TaGFyZWRTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5pc0Rlc3Ryb3llZCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoc2hhcmVkU3RhdGUpXG4gIH1cbiAgbGlzdGVuRm9yVXNlckNoYW5nZXMoKSB7XG4gICAgdGhpcy5wcm9wcy5saXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTp0aGVtZScsXG4gICAgICB0aGlzLnN5bmNUb1NoYXJlZFN0YXRlLmJpbmQodGhpcylcbiAgICApXG4gICAgdGhpcy5wcm9wcy5saXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTpmb250U2l6ZScsXG4gICAgICB0aGlzLnN5bmNUb1NoYXJlZFN0YXRlLmJpbmQodGhpcylcbiAgICApXG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8VGhlbWVQcm92aWRlciB0aGVtZT17dGhpcy5zdGF0ZX0+e3RoaXMucHJvcHMuY2hpbGRyZW59PC9UaGVtZVByb3ZpZGVyPlxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB3aXRoTGlzdGVuVG8oVGhlbWVDb250YWluZXIpXG4iXX0=