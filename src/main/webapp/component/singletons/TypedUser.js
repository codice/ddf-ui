import { __read, __spreadArray } from "tslib";
import React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import moment from 'moment-timezone';
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
export var useEphemeralFilter = function () {
    var _a = __read(React.useState(TypedUserInstance.getEphemeralFilter()), 2), ephemeralFilter = _a[0], setEphemeralFilter = _a[1];
    useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', function () {
        setEphemeralFilter(TypedUserInstance.getEphemeralFilter());
    });
    return ephemeralFilter;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZWRVc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL1R5cGVkVXNlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUl6QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUE7QUFFcEMsT0FBTyxZQUFZLE1BQU0saUJBQWlCLENBQUE7QUFDMUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFFakUsTUFBTSxDQUFDLElBQU0saUJBQWlCLEdBQUc7SUFDL0IsZUFBZSxFQUFFO1FBQ2YsT0FBTyxZQUFZLENBQUE7SUFDckIsQ0FBQztJQUNELGdDQUFnQyxFQUFFO1FBQ2hDLElBQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQTtRQUM3QyxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtRQUVyRCxJQUFNLFdBQVcsR0FBRyxZQUFZO2FBQzdCLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFDWCxHQUFHLENBQUMsYUFBYSxDQUFDO2FBQ2xCLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQ2hDLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMzQixnQ0FBVyxJQUFJLEdBQUcsd0NBQUssV0FBVyxrQkFBSyxRQUFRLFVBQUUsVUFBQztRQUNwRCxDQUFDO1FBRUQsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3ZDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM5QyxnQ0FBVyxJQUFJLEdBQUcsd0NBQUss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LGVBQWUsUUFBQSxFQUFFLGtCQUFrQixRQUV6QyxDQUFBO0lBQ0QsV0FBVyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxFQUFFLHFCQUFxQixFQUFFO1FBQ3JFLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtJQUM1RCxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sZUFBZSxDQUFBO0FBQ3hCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTb3J0VHlwZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1F1ZXJ5LnNoYXJlZC10eXBlcydcbmltcG9ydCB7IEZpbHRlckJ1aWxkZXJDbGFzcyB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQtdGltZXpvbmUnXG5cbmltcG9ydCB1c2VySW5zdGFuY2UgZnJvbSAnLi91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcblxuZXhwb3J0IGNvbnN0IFR5cGVkVXNlckluc3RhbmNlID0ge1xuICBnZXRVc2VySW5zdGFuY2U6ICgpID0+IHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlXG4gIH0sXG4gIGdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duOiAoKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvblxuICAgIGNvbnN0IHJlcXVpcmVkID0gY29uZmlnLmdldFJlcXVpcmVkRXhwb3J0QXR0cmlidXRlcygpXG5cbiAgICBjb25zdCB1c2VyY2hvaWNlcyA9IHVzZXJJbnN0YW5jZVxuICAgICAgLmdldCgndXNlcicpXG4gICAgICAuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICAuZ2V0KCdpbnNwZWN0b3Itc3VtbWFyeVNob3duJylcbiAgICBpZiAodXNlcmNob2ljZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFsuLi5uZXcgU2V0KFsuLi51c2VyY2hvaWNlcywgLi4ucmVxdWlyZWRdKV1cbiAgICB9XG5cbiAgICBjb25zdCBzdW1tYXJ5ID0gY29uZmlnLmdldFN1bW1hcnlTaG93KClcbiAgICBpZiAoc3VtbWFyeS5sZW5ndGggPiAwIHx8IHJlcXVpcmVkLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBbLi4ubmV3IFNldChbLi4uc3VtbWFyeSwgLi4ucmVxdWlyZWRdKV1cbiAgICB9XG5cbiAgICByZXR1cm4gWyd0aXRsZScsICdjcmVhdGVkJywgJ3RodW1ibmFpbCddXG4gIH0sXG4gIGdldFJlc3VsdHNBdHRyaWJ1dGVzU2hvd25MaXN0OiAoKTogc3RyaW5nW10gPT4ge1xuICAgIGNvbnN0IHVzZXJjaG9pY2VzID0gdXNlckluc3RhbmNlXG4gICAgICAuZ2V0KCd1c2VyJylcbiAgICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAgIC5nZXQoJ3Jlc3VsdHMtYXR0cmlidXRlc1Nob3duTGlzdCcpXG4gICAgaWYgKHVzZXJjaG9pY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB1c2VyY2hvaWNlc1xuICAgIH1cbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlc3VsdFNob3coKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlc3VsdFNob3coKVxuICAgIH1cbiAgICByZXR1cm4gWyd0aXRsZScsICd0aHVtYm5haWwnXVxuICB9LFxuICBnZXRSZXN1bHRzQXR0cmlidXRlc1Nob3duVGFibGU6ICgpOiBzdHJpbmdbXSA9PiB7XG4gICAgY29uc3QgdXNlcmNob2ljZXMgPSB1c2VySW5zdGFuY2VcbiAgICAgIC5nZXQoJ3VzZXInKVxuICAgICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgLmdldCgncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25UYWJsZScpXG4gICAgaWYgKHVzZXJjaG9pY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB1c2VyY2hvaWNlc1xuICAgIH1cbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldERlZmF1bHRUYWJsZUNvbHVtbnMoKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldERlZmF1bHRUYWJsZUNvbHVtbnMoKVxuICAgIH1cbiAgICByZXR1cm4gWyd0aXRsZScsICd0aHVtYm5haWwnXVxuICB9LFxuICAvLyBiYXNpY2FsbHksIHdoYXQgY291bGQgYmUgc2hvd24gdGhhdCBjdXJyZW50bHkgaXNuJ3RcbiAgZ2V0UmVzdWx0c0F0dHJpYnV0ZXNQb3NzaWJsZVN1bW1hcnlTaG93bjogKCk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCBjdXJyZW50QXR0cmlidXRlc1Nob3duID1cbiAgICAgIFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKClcbiAgICBjb25zdCBhbGxLbm93bkF0dHJpYnV0ZXMgPVxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldFNvcnRlZEF0dHJpYnV0ZXMoKVxuICAgIGNvbnN0IHNlYXJjaE9ubHlBdHRyaWJ1dGVzID1cbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRTZWFyY2hPbmx5QXR0cmlidXRlcygpXG4gICAgY29uc3QgYXR0cmlidXRlc1Bvc3NpYmxlID0gYWxsS25vd25BdHRyaWJ1dGVzLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgIWN1cnJlbnRBdHRyaWJ1dGVzU2hvd24uaW5jbHVkZXMoYXR0ci5pZCkgJiZcbiAgICAgICAgIXNlYXJjaE9ubHlBdHRyaWJ1dGVzLmluY2x1ZGVzKGF0dHIuaWQpICYmXG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoYXR0ci5pZClcbiAgICAgIClcbiAgICB9KVxuICAgIHJldHVybiBhdHRyaWJ1dGVzUG9zc2libGUubWFwKChhdHRyKSA9PiBhdHRyLmlkKVxuICB9LFxuICBnZXRSZXN1bHRzQXR0cmlidXRlc1Bvc3NpYmxlVGFibGU6IChcbiAgICBjdXJyZW50QXR0cmlidXRlcz86IHN0cmluZ1tdXG4gICk6IHN0cmluZ1tdID0+IHtcbiAgICBjb25zdCBjdXJyZW50QXR0cmlidXRlc1Nob3duID1cbiAgICAgIGN1cnJlbnRBdHRyaWJ1dGVzID8/IFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU2hvd25UYWJsZSgpXG4gICAgY29uc3QgYWxsS25vd25BdHRyaWJ1dGVzID1cbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRTb3J0ZWRBdHRyaWJ1dGVzKClcbiAgICBjb25zdCBzZWFyY2hPbmx5QXR0cmlidXRlcyA9XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0U2VhcmNoT25seUF0dHJpYnV0ZXMoKVxuICAgIGNvbnN0IGF0dHJpYnV0ZXNQb3NzaWJsZSA9IGFsbEtub3duQXR0cmlidXRlcy5maWx0ZXIoKGF0dHIpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICFjdXJyZW50QXR0cmlidXRlc1Nob3duLmluY2x1ZGVzKGF0dHIuaWQpICYmXG4gICAgICAgICFzZWFyY2hPbmx5QXR0cmlidXRlcy5pbmNsdWRlcyhhdHRyLmlkKSAmJlxuICAgICAgICAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKGF0dHIuaWQpXG4gICAgICApXG4gICAgfSlcbiAgICByZXR1cm4gYXR0cmlidXRlc1Bvc3NpYmxlLm1hcCgoYXR0cikgPT4gYXR0ci5pZClcbiAgfSxcbiAgLy8gYmFzaWNhbGx5LCB3aGF0IGNvdWxkIGJlIHNob3duIHRoYXQgY3VycmVudGx5IGlzbid0XG4gIGdldFJlc3VsdHNBdHRyaWJ1dGVzUG9zc2libGVMaXN0OiAoXG4gICAgY3VycmVudEF0dHJpYnV0ZXM/OiBzdHJpbmdbXVxuICApOiBzdHJpbmdbXSA9PiB7XG4gICAgY29uc3QgY3VycmVudEF0dHJpYnV0ZXNTaG93biA9XG4gICAgICBjdXJyZW50QXR0cmlidXRlcyA/PyBUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1Nob3duTGlzdCgpXG4gICAgY29uc3QgYWxsS25vd25BdHRyaWJ1dGVzID1cbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRTb3J0ZWRBdHRyaWJ1dGVzKClcbiAgICBjb25zdCBzZWFyY2hPbmx5QXR0cmlidXRlcyA9XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0U2VhcmNoT25seUF0dHJpYnV0ZXMoKVxuICAgIGNvbnN0IGF0dHJpYnV0ZXNQb3NzaWJsZSA9IGFsbEtub3duQXR0cmlidXRlcy5maWx0ZXIoKGF0dHIpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICFjdXJyZW50QXR0cmlidXRlc1Nob3duLmluY2x1ZGVzKGF0dHIuaWQpICYmXG4gICAgICAgICFzZWFyY2hPbmx5QXR0cmlidXRlcy5pbmNsdWRlcyhhdHRyLmlkKSAmJlxuICAgICAgICAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKGF0dHIuaWQpXG4gICAgICApXG4gICAgfSlcbiAgICByZXR1cm4gYXR0cmlidXRlc1Bvc3NpYmxlLm1hcCgoYXR0cikgPT4gYXR0ci5pZClcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5nc0pTT046ICgpOiBRdWVyeVNldHRpbmdzVHlwZSA9PiB7XG4gICAgcmV0dXJuIFR5cGVkVXNlckluc3RhbmNlLmdldFF1ZXJ5U2V0dGluZ3NNb2RlbCgpLnRvSlNPTigpXG4gIH0sXG4gIGdldFF1ZXJ5U2V0dGluZ3NNb2RlbDogKCk6IFF1ZXJ5U2V0dGluZ3NNb2RlbFR5cGUgPT4ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0UXVlcnlTZXR0aW5ncygpXG4gIH0sXG4gIHVwZGF0ZVF1ZXJ5U2V0dGluZ3M6IChuZXdTZXR0aW5nczogUGFydGlhbDxRdWVyeVNldHRpbmdzVHlwZT4pOiB2b2lkID0+IHtcbiAgICBjb25zdCBjdXJyZW50U2V0dGluZ3MgPSBUeXBlZFVzZXJJbnN0YW5jZS5nZXRRdWVyeVNldHRpbmdzTW9kZWwoKVxuICAgIGN1cnJlbnRTZXR0aW5ncy5zZXQobmV3U2V0dGluZ3MpXG4gICAgdXNlckluc3RhbmNlLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGdldENvb3JkaW5hdGVGb3JtYXQ6ICgpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBjb29yZEZvcm1hdCA9IHVzZXJJbnN0YW5jZVxuICAgICAgLmdldCgndXNlcicpXG4gICAgICA/LmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgPy5nZXQoJ2Nvb3JkaW5hdGVGb3JtYXQnKVxuXG4gICAgaWYgKCFjb29yZEZvcm1hdCkge1xuICAgICAgY29uc3QgZGVmYXVsdENvb3JkRm9ybWF0ID0gdXNlckluc3RhbmNlXG4gICAgICAgIC5nZXQoJ3VzZXInKVxuICAgICAgICA/LmRlZmF1bHRzKClcbiAgICAgICAgPy5wcmVmZXJlbmNlcz8uZ2V0KCdjb29yZGluYXRlRm9ybWF0JylcbiAgICAgIGNvb3JkRm9ybWF0ID0gZGVmYXVsdENvb3JkRm9ybWF0ID8/ICdkZWdyZWVzJ1xuICAgIH1cblxuICAgIHJldHVybiBjb29yZEZvcm1hdFxuICB9LFxuICBnZXRFcGhlbWVyYWxTb3J0cygpOiB1bmRlZmluZWQgfCBTb3J0VHlwZVtdIHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3Jlc3VsdFNvcnQnKVxuICB9LFxuICBnZXRFcGhlbWVyYWxGaWx0ZXIoKTogdW5kZWZpbmVkIHwgRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3Jlc3VsdEZpbHRlcicpXG4gIH0sXG4gIHJlbW92ZUVwaGVtZXJhbEZpbHRlcigpIHtcbiAgICB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLnNldCgncmVzdWx0RmlsdGVyJywgdW5kZWZpbmVkKVxuICAgIFR5cGVkVXNlckluc3RhbmNlLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIHJlbW92ZUVwaGVtZXJhbFNvcnRzKCkge1xuICAgIHVzZXJJbnN0YW5jZS5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KCdyZXN1bHRTb3J0JywgdW5kZWZpbmVkKVxuICAgIFR5cGVkVXNlckluc3RhbmNlLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGdldFByZWZlcmVuY2VzKCk6IEJhY2tib25lLk1vZGVsPGFueT4gJiB7XG4gICAgbmVlZHNVcGRhdGU6ICh1cGRhdGU6IGFueSkgPT4gYm9vbGVhblxuICB9IHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKVxuICB9LFxuICBzYXZlUHJlZmVyZW5jZXMoKSB7XG4gICAgdXNlckluc3RhbmNlLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBjYW5Xcml0ZTogKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHVzZXJJbnN0YW5jZS5jYW5Xcml0ZShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgfSxcbiAgaXNBZG1pbjogKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHVzZXJJbnN0YW5jZS5jYW5TaGFyZShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgfSxcbiAgZ2V0UmVzdWx0Q291bnQ6ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB1c2VySW5zdGFuY2UuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0Q291bnQnKVxuICB9LFxuICBnZXRVc2VyUmVhZGFibGVEYXRlVGltZTogKHZhbDogYW55KTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gdXNlckluc3RhbmNlLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKHZhbClcbiAgfSxcbiAgZ2V0TWFwSG9tZTogKCkgPT4ge1xuICAgIHJldHVybiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLmdldCgnbWFwSG9tZScpXG4gIH0sXG4gIGdldERlY2ltYWxQcmVjaXNpb246ICgpID0+IHtcbiAgICByZXR1cm4gVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKS5nZXQoJ2RlY2ltYWxQcmVjaXNpb24nKVxuICB9LFxuICBnZXRNb21lbnREYXRlKGRhdGU6IHN0cmluZykge1xuICAgIHJldHVybiBgJHttb21lbnQoZGF0ZSkuZnJvbU5vdygpfSA6ICR7dXNlckluc3RhbmNlLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKFxuICAgICAgZGF0ZVxuICAgICl9YFxuICB9LFxuICBnZXRNYXBMYXllcnM6ICgpOiBCYWNrYm9uZS5Db2xsZWN0aW9uID0+IHtcbiAgICBjb25zdCBtYXBMYXllcnMgPSBUeXBlZFVzZXJJbnN0YW5jZS5nZXRQcmVmZXJlbmNlcygpLmdldCgnbWFwTGF5ZXJzJylcbiAgICByZXR1cm4gbWFwTGF5ZXJzXG4gIH0sXG4gIG5lZWRzVXBkYXRlKHVwVG9EYXRlUHJlZnM6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmdldFByZWZlcmVuY2VzKCkubmVlZHNVcGRhdGUodXBUb0RhdGVQcmVmcylcbiAgfSxcbiAgc3luYyh1cFRvRGF0ZVByZWZzOiBhbnkpIHtcbiAgICBpZiAodGhpcy5uZWVkc1VwZGF0ZSh1cFRvRGF0ZVByZWZzKSkge1xuICAgICAgdGhpcy5nZXRQcmVmZXJlbmNlcygpLnNldCh1cFRvRGF0ZVByZWZzKVxuICAgIH1cbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IHVzZUVwaGVtZXJhbEZpbHRlciA9ICgpID0+IHtcbiAgY29uc3QgW2VwaGVtZXJhbEZpbHRlciwgc2V0RXBoZW1lcmFsRmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldEVwaGVtZXJhbEZpbHRlcigpXG4gIClcbiAgdXNlTGlzdGVuVG8oVHlwZWRVc2VySW5zdGFuY2UuZ2V0UHJlZmVyZW5jZXMoKSwgJ2NoYW5nZTpyZXN1bHRGaWx0ZXInLCAoKSA9PiB7XG4gICAgc2V0RXBoZW1lcmFsRmlsdGVyKFR5cGVkVXNlckluc3RhbmNlLmdldEVwaGVtZXJhbEZpbHRlcigpKVxuICB9KVxuICByZXR1cm4gZXBoZW1lcmFsRmlsdGVyXG59XG5cbnR5cGUgUXVlcnlTZXR0aW5nc1R5cGUgPSB7XG4gIHR5cGU6IHN0cmluZ1xuICBzb3VyY2VzOiBzdHJpbmdbXVxuICBmZWRlcmF0aW9uOiAnc2VsZWN0ZWQnIHwgJ2VudGVycHJpc2UnXG4gIHNvcnRzOiB7IGF0dHJpYnV0ZTogc3RyaW5nOyBkaXJlY3Rpb246ICdkZXNjZW5kaW5nJyB8ICdhc2NlbmRpbmcnIH1bXVxuICB0ZW1wbGF0ZTogc3RyaW5nXG4gIHNwZWxsY2hlY2s6IGJvb2xlYW5cbiAgcGhvbmV0aWNzOiBib29sZWFuXG4gIGFkZGl0aW9uYWxPcHRpb25zPzogc3RyaW5nXG59XG5cbnR5cGUgUXVlcnlTZXR0aW5nc01vZGVsVHlwZSA9IHtcbiAgZ2V0OiAoYXR0cjogc3RyaW5nKSA9PiBhbnlcbiAgc2V0OiAoYXR0cjogYW55LCB2YWx1ZT86IGFueSkgPT4gdm9pZFxuICB0b0pTT046ICgpID0+IFF1ZXJ5U2V0dGluZ3NUeXBlXG59XG5cbmV4cG9ydCB0eXBlIFR5cGVkVXNlckluc3RhbmNlVHlwZSA9IHR5cGVvZiBUeXBlZFVzZXJJbnN0YW5jZVxuIl19