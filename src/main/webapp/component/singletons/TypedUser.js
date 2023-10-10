import { __read } from "tslib";
import React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import moment from 'moment';
import userInstance from './user-instance';
import { StartupDataStore } from '../../js/model/Startup/startup';
export var TypedUserInstance = {
    getUserInstance: function () {
        return userInstance;
    },
    getResultsAttributesShownList: function () {
        var userchoices = userInstance
            .get('user')
            .get('preferences')
            .get('results-attributesShownList');
        if (userchoices.length > 0) {
            return userchoices;
        }
        if (StartupDataStore.Configuration.getResultShow().length > 0) {
            return StartupDataStore.Configuration.getResultShow();
        }
        return ['title', 'thumbnail'];
    },
    getResultsAttributesShownTable: function () {
        var userchoices = userInstance
            .get('user')
            .get('preferences')
            .get('results-attributesShownTable');
        if (userchoices.length > 0) {
            return userchoices;
        }
        if (StartupDataStore.Configuration.getDefaultTableColumns().length > 0) {
            return StartupDataStore.Configuration.getDefaultTableColumns();
        }
        return ['title', 'thumbnail'];
    },
    // basically, what could be shown that currently isn't
    getResultsAttributesPossibleTable: function () {
        var currentAttributesShown = TypedUserInstance.getResultsAttributesShownTable();
        var allKnownAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
        var searchOnlyAttributes = StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes();
        var attributesPossible = allKnownAttributes.filter(function (attr) {
            return (!currentAttributesShown.includes(attr.id) &&
                !searchOnlyAttributes.includes(attr.id) &&
                !StartupDataStore.MetacardDefinitions.isHiddenTypeExceptThumbnail(attr.id) &&
                !StartupDataStore.Configuration.isHiddenAttribute(attr.id));
        });
        return attributesPossible.map(function (attr) { return attr.id; });
    },
    // basically, what could be shown that currently isn't
    getResultsAttributesPossibleList: function () {
        var currentAttributesShown = TypedUserInstance.getResultsAttributesShownList();
        var allKnownAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
        var searchOnlyAttributes = StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes();
        var attributesPossible = allKnownAttributes.filter(function (attr) {
            return (!currentAttributesShown.includes(attr.id) &&
                !searchOnlyAttributes.includes(attr.id) &&
                !StartupDataStore.MetacardDefinitions.isHiddenTypeExceptThumbnail(attr.id) &&
                !StartupDataStore.Configuration.isHiddenAttribute(attr.id));
        });
        return attributesPossible.map(function (attr) { return attr.id; });
    },
    getQuerySettingsJSON: function () {
        return TypedUserInstance.getQuerySettingsModel().toJSON();
    },
    getQuerySettingsModel: function () {
        return userInstance.getQuerySettings();
    },
    updateQuerySettings: function (newSettings) {
        var currentSettings = TypedUserInstance.getQuerySettingsModel();
        currentSettings.set(newSettings);
        userInstance.savePreferences();
    },
    getCoordinateFormat: function () {
        var _a, _b, _c, _d, _e;
        var coordFormat = (_b = (_a = userInstance
            .get('user')) === null || _a === void 0 ? void 0 : _a.get('preferences')) === null || _b === void 0 ? void 0 : _b.get('coordinateFormat');
        if (!coordFormat) {
            var defaultCoordFormat = (_e = (_d = (_c = userInstance
                .get('user')) === null || _c === void 0 ? void 0 : _c.defaults()) === null || _d === void 0 ? void 0 : _d.preferences) === null || _e === void 0 ? void 0 : _e.get('coordinateFormat');
            coordFormat = defaultCoordFormat !== null && defaultCoordFormat !== void 0 ? defaultCoordFormat : 'degrees';
        }
        return coordFormat;
    },
    getEphemeralSorts: function () {
        return userInstance.get('user').get('preferences').get('resultSort');
    },
    getEphemeralFilter: function () {
        return userInstance.get('user').get('preferences').get('resultFilter');
    },
    removeEphemeralFilter: function () {
        userInstance.get('user').get('preferences').set('resultFilter', undefined);
        TypedUserInstance.savePreferences();
    },
    removeEphemeralSorts: function () {
        userInstance.get('user').get('preferences').set('resultSort', undefined);
        TypedUserInstance.savePreferences();
    },
    getPreferences: function () {
        return userInstance.get('user').get('preferences');
    },
    savePreferences: function () {
        userInstance.get('user').get('preferences').savePreferences();
    },
    getActingRole: function () {
        return userInstance.get('user').get('preferences').get('actingRole');
    },
    setActingRole: function (actingRole) {
        return userInstance
            .get('user')
            .get('preferences')
            .set('actingRole', actingRole);
    },
    canWrite: function (result) {
        return userInstance.canWrite(result.plain.metacard.properties);
    },
    isAdmin: function (result) {
        return userInstance.canShare(result.plain.metacard.properties);
    },
    getResultCount: function () {
        return userInstance.get('user').get('preferences').get('resultCount');
    },
    getUserReadableDateTime: function (val) {
        return userInstance.getUserReadableDateTime(val);
    },
    getMapHome: function () {
        return TypedUserInstance.getPreferences().get('mapHome');
    },
    getDecimalPrecision: function () {
        return TypedUserInstance.getPreferences().get('decimalPrecision');
    },
    getMomentDate: function (date) {
        return "".concat(moment(date).fromNow(), " : ").concat(userInstance.getUserReadableDateTime(date));
    },
    needsUpdate: function (upToDatePrefs) {
        return this.getPreferences().needsUpdate(upToDatePrefs);
    },
    sync: function (upToDatePrefs) {
        if (this.needsUpdate(upToDatePrefs)) {
            this.getPreferences().set(upToDatePrefs);
        }
    },
};
export function useActingRole() {
    var _a = __read(React.useState(TypedUserInstance.getActingRole()), 2), activeRole = _a[0], setActiveRole = _a[1];
    useListenTo(TypedUserInstance.getPreferences(), 'change:actingRole', function () {
        setActiveRole(TypedUserInstance.getActingRole());
    });
    return activeRole;
}
export var useEphemeralFilter = function () {
    var _a = __read(React.useState(TypedUserInstance.getEphemeralFilter()), 2), ephemeralFilter = _a[0], setEphemeralFilter = _a[1];
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', function () {
        setEphemeralFilter(TypedUserInstance.getEphemeralFilter());
    });
    return ephemeralFilter;
};
//# sourceMappingURL=TypedUser.js.map