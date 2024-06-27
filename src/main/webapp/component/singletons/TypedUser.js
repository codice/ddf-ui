import { __read, __spreadArray } from "tslib";
import React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import moment from 'moment';
import userInstance from './user-instance';
import { StartupDataStore } from '../../js/model/Startup/startup';
export var TypedUserInstance = {
    getUserInstance: function () {
        return userInstance;
    },
    getResultsAttributesSummaryShown: function () {
        var config = StartupDataStore.Configuration;
        var required = config.getRequiredExportAttributes();
        var userchoices = userInstance
            .get('user')
            .get('preferences')
            .get('inspector-summaryShown');
        if (userchoices.length > 0) {
            return __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(userchoices), false), __read(required), false))), false);
        }
        var summary = config.getSummaryShow();
        if (summary.length > 0 || required.length > 0) {
            return __spreadArray([], __read(new Set(__spreadArray(__spreadArray([], __read(summary), false), __read(required), false))), false);
        }
        return ['title', 'created', 'thumbnail'];
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
    getResultsAttributesPossibleSummaryShown: function () {
        var currentAttributesShown = TypedUserInstance.getResultsAttributesSummaryShown();
        var allKnownAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
        var searchOnlyAttributes = StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes();
        var attributesPossible = allKnownAttributes.filter(function (attr) {
            return (!currentAttributesShown.includes(attr.id) &&
                !searchOnlyAttributes.includes(attr.id) &&
                !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id));
        });
        return attributesPossible.map(function (attr) { return attr.id; });
    },
    getResultsAttributesPossibleTable: function (currentAttributes) {
        var currentAttributesShown = currentAttributes !== null && currentAttributes !== void 0 ? currentAttributes : TypedUserInstance.getResultsAttributesShownTable();
        var allKnownAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
        var searchOnlyAttributes = StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes();
        var attributesPossible = allKnownAttributes.filter(function (attr) {
            return (!currentAttributesShown.includes(attr.id) &&
                !searchOnlyAttributes.includes(attr.id) &&
                !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id));
        });
        return attributesPossible.map(function (attr) { return attr.id; });
    },
    // basically, what could be shown that currently isn't
    getResultsAttributesPossibleList: function (currentAttributes) {
        var currentAttributesShown = currentAttributes !== null && currentAttributes !== void 0 ? currentAttributes : TypedUserInstance.getResultsAttributesShownList();
        var allKnownAttributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
        var searchOnlyAttributes = StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes();
        var attributesPossible = allKnownAttributes.filter(function (attr) {
            return (!currentAttributesShown.includes(attr.id) &&
                !searchOnlyAttributes.includes(attr.id) &&
                !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id));
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
    getMapLayers: function () {
        var mapLayers = TypedUserInstance.getPreferences().get('mapLayers');
        return mapLayers;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZWRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL1R5cGVkVXNlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUl6QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRTNCLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFBO0FBQzFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBRWpFLE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFHO0lBQy9CLGVBQWUsRUFBRTtRQUNmLE9BQU8sWUFBWSxDQUFBO0lBQ3JCLENBQUM7SUFDRCxnQ0FBZ0MsRUFBRTtRQUNoQyxJQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUE7UUFDN0MsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLDJCQUEyQixFQUFFLENBQUE7UUFFckQsSUFBTSxXQUFXLEdBQUcsWUFBWTthQUM3QixHQUFHLENBQUMsTUFBTSxDQUFDO2FBQ1gsR0FBRyxDQUFDLGFBQWEsQ0FBQzthQUNsQixHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtRQUNoQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzFCLGdDQUFXLElBQUksR0FBRyx3Q0FBSyxXQUFXLGtCQUFLLFFBQVEsVUFBRSxVQUFDO1NBQ25EO1FBRUQsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3ZDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0MsZ0NBQVcsSUFBSSxHQUFHLHdDQUFLLE9BQU8sa0JBQUssUUFBUSxV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QUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtTQUN6QztJQUNILENBQUM7Q0FDRixDQUFBO0FBRUQsTUFBTSxVQUFVLGFBQWE7SUFDckIsSUFBQSxLQUFBLE9BQThCLEtBQUssQ0FBQyxRQUFRLENBQ2hELGlCQUFpQixDQUFDLGFBQWEsRUFBTyxDQUN2QyxJQUFBLEVBRk0sVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUUvQixDQUFBO0lBQ0QsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxFQUFFLG1CQUFtQixFQUFFO1FBQ25FLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQU8sQ0FBQyxDQUFBO0lBQ3ZELENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxVQUFVLENBQUE7QUFDbkIsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHO0lBQzFCLElBQUEsS0FBQSxPQUF3QyxLQUFLLENBQUMsUUFBUSxDQUMxRCxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUN2QyxJQUFBLEVBRk0sZUFBZSxRQUFBLEVBQUUsa0JBQWtCLFFBRXpDLENBQUE7SUFDRCxXQUFXLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEVBQUUscUJBQXFCLEVBQUU7UUFDckUsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0lBQzVELENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxlQUFlLENBQUE7QUFDeEIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IFNvcnRUeXBlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvUXVlcnkuc2hhcmVkLXR5cGVzJ1xuaW1wb3J0IHsgRmlsdGVyQnVpbGRlckNsYXNzIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCdcblxuaW1wb3J0IHVzZXJJbnN0YW5jZSBmcm9tICcuL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuXG5leHBvcnQgY29uc3QgVHlwZWRVc2VySW5zdGFuY2UgPSB7XG4gIGdldFVzZXJJbnN0YW5jZTogKCkgPT4ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2VcbiAgfSxcbiAgZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTdW1tYXJ5U2hvd246ICgpOiBzdHJpbmdbXSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uXG4gICAgY29uc3QgcmVxdWlyZWQgPSBjb25maWcuZ2V0UmVxdWlyZWRFeHBvcnRBdHRyaWJ1dGVzKClcblxuICAgIGNvbnN0IHVzZXJjaG9pY2VzID0gdXNlckluc3RhbmNlXG4gICAgICAuZ2V0KCd1c2VyJylcbiAgICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAgIC5nZXQoJ2luc3BlY3Rvci1zdW1tYXJ5U2hvd24nKVxuICAgIGlmICh1c2VyY2hvaWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gWy4uLm5ldyBTZXQoWy4uLnVzZXJjaG9pY2VzLCAuLi5yZXF1aXJlZF0pXVxuICAgIH1cblxuICAgIGNvbnN0IHN1bW1hcnkgPSBjb25maWcuZ2V0U3VtbWFyeVNob3coKVxuICAgIGlmIChzdW1tYXJ5Lmxlbmd0aCA+IDAgfHwgcmVxdWlyZWQubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFsuLi5uZXcgU2V0KFsuLi5zdW1tYXJ5LCAuLi5yZXF1aXJlZF0pXVxuICAgIH1cblxuICAgIHJldHVybiBbJ3RpdGxlJywgJ2NyZWF0ZWQnLCAndGh1bWJuYWlsJ11cbiAgfSxcbiAgZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTaG93bkxpc3Q6ICgpOiBzdHJpbmdbXSA9PiB7XG4gICAgY29uc3QgdXNlcmNob2ljZXMgPSB1c2VySW5zdGFuY2VcbiAgICAgIC5nZXQoJ3VzZXInKVxuICAgICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgLmdldCgncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25MaXN0JylcbiAgICBpZiAodXNlcmNob2ljZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHVzZXJjaG9pY2VzXG4gICAgfVxuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0U2hvdygpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0U2hvdygpXG4gICAgfVxuICAgIHJldHVybiBbJ3RpdGxlJywgJ3RodW1ibmFpbCddXG4gIH0sXG4gIGdldFJlc3VsdHNBdHRyaWJ1dGVzU2hvd25UYWJsZTogKCk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCB1c2VyY2hvaWNlcyA9IHVzZXJJbnN0YW5jZVxuICAgICAgLmdldCgndXNlcicpXG4gICAgICAuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICAuZ2V0KCdyZXN1bHRzLWF0dHJpYnV0ZXNTaG93blRhYmxlJylcbiAgICBpZiAodXNlcmNob2ljZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHVzZXJjaG9pY2VzXG4gICAgfVxuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RGVmYXVsdFRhYmxlQ29sdW1ucygpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RGVmYXVsdFRhYmxlQ29sdW1ucygpXG4gICAgfVxuICAgIHJldHVybiBbJ3RpdGxlJywgJ3RodW1ibmFpbCddXG4gIH0sXG4gIC8vIGJhc2ljYWxseSwgd2hhdCBjb3VsZCBiZSBzaG93biB0aGF0IGN1cnJlbnRseSBpc24ndFxuICBnZXRSZXN1bHRzQXR0cmlidXRlc1Bvc3NpYmxlU3VtbWFyeVNob3duOiAoKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRBdHRyaWJ1dGVzU2hvd24gPVxuICAgICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTdW1tYXJ5U2hvd24oKVxuICAgIGNvbnN0IGFsbEtub3duQXR0cmlidXRlcyA9XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0U29ydGVkQXR0cmlidXRlcygpXG4gICAgY29uc3Qgc2VhcmNoT25seUF0dHJpYnV0ZXMgPVxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldFNlYXJjaE9ubHlBdHRyaWJ1dGVzKClcbiAgICBjb25zdCBhdHRyaWJ1dGVzUG9zc2libGUgPSBhbGxLbm93bkF0dHJpYnV0ZXMuZmlsdGVyKChhdHRyKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICAhY3VycmVudEF0dHJpYnV0ZXNTaG93bi5pbmNsdWRlcyhhdHRyLmlkKSAmJlxuICAgICAgICAhc2VhcmNoT25seUF0dHJpYnV0ZXMuaW5jbHVkZXMoYXR0ci5pZCkgJiZcbiAgICAgICAgIVN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5pc0hpZGRlbkF0dHJpYnV0ZShhdHRyLmlkKVxuICAgICAgKVxuICAgIH0pXG4gICAgcmV0dXJuIGF0dHJpYnV0ZXNQb3NzaWJsZS5tYXAoKGF0dHIpID0+IGF0dHIuaWQpXG4gIH0sXG4gIGdldFJlc3VsdHNBdHRyaWJ1dGVzUG9zc2libGVUYWJsZTogKFxuICAgIGN1cnJlbnRBdHRyaWJ1dGVzPzogc3RyaW5nW11cbiAgKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRBdHRyaWJ1dGVzU2hvd24gPVxuICAgICAgY3VycmVudEF0dHJpYnV0ZXMgPz8gVHlwZWRVc2VySW5zdGFuY2UuZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTaG93blRhYmxlKClcbiAgICBjb25zdCBhbGxLbm93bkF0dHJpYnV0ZXMgPVxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldFNvcnRlZEF0dHJpYnV0ZXMoKVxuICAgIGNvbnN0IHNlYXJjaE9ubHlBdHRyaWJ1dGVzID1cbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRTZWFyY2hPbmx5QXR0cmlidXRlcygpXG4gICAgY29uc3QgYXR0cmlidXRlc1Bvc3NpYmxlID0gYWxsS25vd25BdHRyaWJ1dGVzLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIWN1cnJlbnRBdHRyaWJ1dGVzU2hvd24uaW5jbHVkZXMoYXR0ci5pZCkgJiZcbiAgICAgICAgIXNlYXJjaE9ubHlBdHRyaWJ1dGVzLmluY2x1ZGVzKGF0dHIuaWQpICYmXG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoYXR0ci5pZClcbiAgICAgIClcbiAgICB9KVxuICAgIHJldHVybiBhdHRyaWJ1dGVzUG9zc2libGUubWFwKChhdHRyKSA9PiBhdHRyLmlkKVxuICB9LFxuICAvLyBiYXNpY2FsbHksIHdoYXQgY291bGQgYmUgc2hvd24gdGhhdCBjdXJyZW50bHkgaXNuJ3RcbiAgZ2V0UmVzdWx0c0F0dHJpYnV0ZXNQb3NzaWJsZUxpc3Q6IChcbiAgICBjdXJyZW50QXR0cmlidXRlcz86IHN0cmluZ1tdXG4gICk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCBjdXJyZW50QXR0cmlidXRlc1Nob3duID1cbiAgICAgIGN1cnJlbnRBdHRyaWJ1dGVzID8/IFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU2hvd25MaXN0KClcbiAgICBjb25zdCBhbGxLbm93bkF0dHJpYnV0ZXMgPVxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldFNvcnRlZEF0dHJpYnV0ZXMoKVxuICAgIGNvbnN0IHNlYXJjaE9ubHlBdHRyaWJ1dGVzID1cbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRTZWFyY2hPbmx5QXR0cmlidXRlcygpXG4gICAgY29uc3QgYXR0cmlidXRlc1Bvc3NpYmxlID0gYWxsS25vd25BdHRyaWJ1dGVzLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIWN1cnJlbnRBdHRyaWJ1dGVzU2hvd24uaW5jbHVkZXMoYXR0ci5pZCkgJiZcbiAgICAgICAgIXNlYXJjaE9ubHlBdHRyaWJ1dGVzLmluY2x1ZGVzKGF0dHIuaWQpICYmXG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoYXR0ci5pZClcbiAgICAgIClcbiAgICB9KVxuICAgIHJldHVybiBhdHRyaWJ1dGVzUG9zc2libGUubWFwKChhdHRyKSA9PiBhdHRyLmlkKVxuICB9LFxuICBnZXRRdWVyeVNldHRpbmdzSlNPTjogKCk6IFF1ZXJ5U2V0dGluZ3NUeXBlID0+IHtcbiAgICByZXR1cm4gVHlwZWRVc2VySW5zdGFuY2UuZ2V0UXVlcnlTZXR0aW5nc01vZGVsKCkudG9KU09OKClcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5nc01vZGVsOiAoKTogUXVlcnlTZXR0aW5nc01vZGVsVHlwZSA9PiB7XG4gICAgcmV0dXJuIHVzZXJJbnN0YW5jZS5nZXRRdWVyeVNldHRpbmdzKClcbiAgfSxcbiAgdXBkYXRlUXVlcnlTZXR0aW5nczogKG5ld1NldHRpbmdzOiBQYXJ0aWFsPFF1ZXJ5U2V0dGluZ3NUeXBlPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRTZXR0aW5ncyA9IFR5cGVkVXNlckluc3RhbmNlLmdldFF1ZXJ5U2V0dGluZ3NNb2RlbCgpXG4gICAgY3VycmVudFNldHRpbmdzLnNldChuZXdTZXR0aW5ncylcbiAgICB1c2VySW5zdGFuY2Uuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgZ2V0Q29vcmRpbmF0ZUZvcm1hdDogKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IGNvb3JkRm9ybWF0ID0gdXNlckluc3RhbmNlXG4gICAgICAuZ2V0KCd1c2VyJylcbiAgICAgID8uZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICA/LmdldCgnY29vcmRpbmF0ZUZvcm1hdCcpXG5cbiAgICBpZiAoIWNvb3JkRm9ybWF0KSB7XG4gICAgICBjb25zdCBkZWZhdWx0Q29vcmRGb3JtYXQgPSB1c2VySW5zdGFuY2VcbiAgICAgICAgLmdldCgndXNlcicpXG4gICAgICAgID8uZGVmYXVsdHMoKVxuICAgICAgICA/LnByZWZlcmVuY2VzPy5nZXQoJ2Nvb3JkaW5hdGVGb3JtYXQnKVxuICAgICAgY29vcmRGb3JtYXQgPSBkZWZhdWx0Q29vcmRGb3JtYXQgPz8gJ2RlZ3JlZXMnXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvb3JkRm9ybWF0XG4gIH0sXG4gIGdldEVwaGVtZXJhbFNvcnRzKCk6IHVuZGVmaW5lZCB8IFNvcnRUeXBlW10ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0U29ydCcpXG4gIH0sXG4gIGdldEVwaGVtZXJhbEZpbHRlcigpOiB1bmRlZmluZWQgfCBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0RmlsdGVyJylcbiAgfSxcbiAgcmVtb3ZlRXBoZW1lcmFsRmlsdGVyKCkge1xuICAgIHVzZXJJbnN0YW5jZS5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KCdyZXN1bHRGaWx0ZXInLCB1bmRlZmluZWQpXG4gICAgVHlwZWRVc2VySW5zdGFuY2Uuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgcmVtb3ZlRXBoZW1lcmFsU29ydHMoKSB7XG4gICAgdXNlckluc3RhbmNlLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zZXQoJ3Jlc3VsdFNvcnQnLCB1bmRlZmluZWQpXG4gICAgVHlwZWRVc2VySW5zdGFuY2Uuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgZ2V0UHJlZmVyZW5jZXMoKTogQmFja2JvbmUuTW9kZWw8YW55PiAmIHtcbiAgICBuZWVkc1VwZGF0ZTogKHVwZGF0ZTogYW55KSA9PiBib29sZWFuXG4gIH0ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpXG4gIH0sXG4gIHNhdmVQcmVmZXJlbmNlcygpIHtcbiAgICB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGdldEFjdGluZ1JvbGU6ICgpOiBzdHJpbmcgPT4ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnYWN0aW5nUm9sZScpXG4gIH0sXG4gIHNldEFjdGluZ1JvbGU6IChhY3RpbmdSb2xlOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlXG4gICAgICAuZ2V0KCd1c2VyJylcbiAgICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAgIC5zZXQoJ2FjdGluZ1JvbGUnLCBhY3RpbmdSb2xlKVxuICB9LFxuICBjYW5Xcml0ZTogKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHVzZXJJbnN0YW5jZS5jYW5Xcml0ZShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgfSxcbiAgaXNBZG1pbjogKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHVzZXJJbnN0YW5jZS5jYW5TaGFyZShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgfSxcbiAgZ2V0UmVzdWx0Q291bnQ6ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0Q291bnQnKVxuICB9LFxuICBnZXRVc2VyUmVhZGFibGVEYXRlVGltZTogKHZhbDogYW55KTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKHZhbClcbiAgfSxcbiAgZ2V0TWFwSG9tZTogKCkgPT4ge1xuICAgIHJldHVybiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLmdldCgnbWFwSG9tZScpXG4gIH0sXG4gIGdldERlY2ltYWxQcmVjaXNpb246ICgpID0+IHtcbiAgICByZXR1cm4gVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKS5nZXQoJ2RlY2ltYWxQcmVjaXNpb24nKVxuICB9LFxuICBnZXRNb21lbnREYXRlKGRhdGU6IHN0cmluZykge1xuICAgIHJldHVybiBgJHttb21lbnQoZGF0ZSkuZnJvbU5vdygpfSA6ICR7dXNlckluc3RhbmNlLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKFxuICAgICAgZGF0ZVxuICAgICl9YFxuICB9LFxuICBnZXRNYXBMYXllcnM6ICgpOiBCYWNrYm9uZS5Db2xsZWN0aW9uID0+IHtcbiAgICBjb25zdCBtYXBMYXllcnMgPSBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLmdldCgnbWFwTGF5ZXJzJylcbiAgICByZXR1cm4gbWFwTGF5ZXJzXG4gIH0sXG4gIG5lZWRzVXBkYXRlKHVwVG9EYXRlUHJlZnM6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmdldFByZWZlcmVuY2VzKCkubmVlZHNVcGRhdGUodXBUb0RhdGVQcmVmcylcbiAgfSxcbiAgc3luYyh1cFRvRGF0ZVByZWZzOiBhbnkpIHtcbiAgICBpZiAodGhpcy5uZWVkc1VwZGF0ZSh1cFRvRGF0ZVByZWZzKSkge1xuICAgICAgdGhpcy5nZXRQcmVmZXJlbmNlcygpLnNldCh1cFRvRGF0ZVByZWZzKVxuICAgIH1cbiAgfSxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUFjdGluZ1JvbGU8VCBleHRlbmRzIHN0cmluZz4oKTogVCB7XG4gIGNvbnN0IFthY3RpdmVSb2xlLCBzZXRBY3RpdmVSb2xlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldEFjdGluZ1JvbGUoKSBhcyBUXG4gIClcbiAgdXNlTGlzdGVuVG8oVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKSwgJ2NoYW5nZTphY3RpbmdSb2xlJywgKCkgPT4ge1xuICAgIHNldEFjdGl2ZVJvbGUoVHlwZWRVc2VySW5zdGFuY2UuZ2V0QWN0aW5nUm9sZSgpIGFzIFQpXG4gIH0pXG4gIHJldHVybiBhY3RpdmVSb2xlXG59XG5cbmV4cG9ydCBjb25zdCB1c2VFcGhlbWVyYWxGaWx0ZXIgPSAoKSA9PiB7XG4gIGNvbnN0IFtlcGhlbWVyYWxGaWx0ZXIsIHNldEVwaGVtZXJhbEZpbHRlcl0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXRFcGhlbWVyYWxGaWx0ZXIoKVxuICApXG4gIHVzZUxpc3RlblRvKFR5cGVkVXNlckluc3RhbmNlLmdldFByZWZlcmVuY2VzKCksICdjaGFuZ2U6cmVzdWx0RmlsdGVyJywgKCkgPT4ge1xuICAgIHNldEVwaGVtZXJhbEZpbHRlcihUeXBlZFVzZXJJbnN0YW5jZS5nZXRFcGhlbWVyYWxGaWx0ZXIoKSlcbiAgfSlcbiAgcmV0dXJuIGVwaGVtZXJhbEZpbHRlclxufVxuXG50eXBlIFF1ZXJ5U2V0dGluZ3NUeXBlID0ge1xuICB0eXBlOiBzdHJpbmdcbiAgc291cmNlczogc3RyaW5nW11cbiAgZmVkZXJhdGlvbjogJ3NlbGVjdGVkJyB8ICdlbnRlcnByaXNlJ1xuICBzb3J0czogeyBhdHRyaWJ1dGU6IHN0cmluZzsgZGlyZWN0aW9uOiAnZGVzY2VuZGluZycgfCAnYXNjZW5kaW5nJyB9W11cbiAgdGVtcGxhdGU6IHN0cmluZ1xuICBzcGVsbGNoZWNrOiBib29sZWFuXG4gIHBob25ldGljczogYm9vbGVhblxuICBhZGRpdGlvbmFsT3B0aW9ucz86IHN0cmluZ1xufVxuXG50eXBlIFF1ZXJ5U2V0dGluZ3NNb2RlbFR5cGUgPSB7XG4gIGdldDogKGF0dHI6IHN0cmluZykgPT4gYW55XG4gIHNldDogKGF0dHI6IGFueSwgdmFsdWU/OiBhbnkpID0+IHZvaWRcbiAgdG9KU09OOiAoKSA9PiBRdWVyeVNldHRpbmdzVHlwZVxufVxuIl19