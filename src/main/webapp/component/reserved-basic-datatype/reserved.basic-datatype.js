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
import { __assign, __read } from "tslib";
import * as React from 'react';
import IconHelper from '../../js/IconHelper';
import TextField from '@mui/material/TextField';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks';
import Swath from '../swath/swath';
function getMatchTypeAttribute() {
    return StartupDataStore.MetacardDefinitions.getAttributeMap()[StartupDataStore.Configuration.getBasicSearchMatchType()]
        ? StartupDataStore.Configuration.getBasicSearchMatchType()
        : 'datatype';
}
/**
 *  If the configuration is empty, we generate a configuration based off the enum instead
 */
function getTypesMapping(_a) {
    var Configuration = _a.Configuration, MetacardDefinitions = _a.MetacardDefinitions;
    var customTypesConfig = Configuration.getDataTypes();
    if (Object.keys(customTypesConfig.groups).length > 0) {
        return customTypesConfig;
    }
    var matchTypeAttr = getMatchTypeAttribute();
    var validTypes = MetacardDefinitions.getEnum(matchTypeAttr);
    var defaultTypesMapping = validTypes.reduce(function (blob, value) {
        var iconClass = IconHelper.getClassByName(value);
        blob.groups['Other'] = blob.groups['Other'] || {};
        blob.groups['Other'].values = blob.groups['Other'].values || {};
        blob.groups['Other'].values[value] = {
            attributes: {
                datatype: [value],
                'metadata-content-type': [value],
            },
            iconConfig: {
                class: iconClass,
            },
        };
        return blob;
    }, {
        groups: {},
    });
    return defaultTypesMapping;
}
export function getDataTypesConfiguration(_a) {
    var Configuration = _a.Configuration, MetacardDefinitions = _a.MetacardDefinitions;
    var typesMapping = getTypesMapping({ Configuration: Configuration, MetacardDefinitions: MetacardDefinitions });
    var reverseMapping = Object.entries(typesMapping.groups).reduce(function (blob, _a) {
        var _b = __read(_a, 2), groupName = _b[0], groupInfo = _b[1];
        Object.entries(groupInfo.values).forEach(function (_a) {
            var _b = __read(_a, 2), valueName = _b[0], valueInfo = _b[1];
            blob[valueName] = __assign({ group: {
                    name: groupName,
                    iconConfig: groupInfo.iconConfig,
                } }, valueInfo);
        });
        return blob;
    }, {});
    return {
        groupMap: typesMapping,
        valueMap: reverseMapping,
    };
}
function getGroupFromValue(_a) {
    var _b;
    var dataTypesConfiguration = _a.dataTypesConfiguration, value = _a.value, orderedGroups = _a.orderedGroups;
    var groupName = (_b = dataTypesConfiguration.valueMap[value]) === null || _b === void 0 ? void 0 : _b.group.name;
    return orderedGroups.includes(groupName)
        ? groupName
        : orderedGroups.includes(value)
            ? value
            : null;
}
export function generateSortedValues(_a) {
    var dataTypesConfiguration = _a.dataTypesConfiguration;
    var orderedGroups = Object.keys(dataTypesConfiguration.groupMap.groups);
    return Object.keys(dataTypesConfiguration.valueMap)
        .concat(orderedGroups)
        .sort(function (a, b) {
        var groupA = getGroupFromValue({
            dataTypesConfiguration: dataTypesConfiguration,
            value: a,
            orderedGroups: orderedGroups,
        });
        var groupB = getGroupFromValue({
            dataTypesConfiguration: dataTypesConfiguration,
            value: b,
            orderedGroups: orderedGroups,
        });
        // Handle cases where one value has a group and the other doesn't (grouped comes first)
        if (groupA && !groupB)
            return -1;
        if (!groupA && groupB)
            return 1;
        // Sort by group if both values have different groups (group order matters)
        if (groupA && groupB && groupA !== groupB) {
            return orderedGroups.indexOf(groupA) - orderedGroups.indexOf(groupB);
        }
        // If they are in the same group, sort by whether the value itself is the group (if it's the group, it comes first)
        if (groupA === groupB) {
            if (a === groupA)
                return -1;
            if (b === groupB)
                return 1;
            return a.localeCompare(b); // Sub-sort alphabetically if not the group itself
        }
        // If no groups are involved, sort alphabetically
        return a.localeCompare(b);
    })
        .map(function (value) {
        return {
            label: value,
            value: value,
        };
    });
}
export function generateGroupsToValues(_a) {
    var dataTypesConfiguration = _a.dataTypesConfiguration;
    return Object.keys(dataTypesConfiguration.groupMap.groups).reduce(function (groupsToValuesMapping, groupName) {
        groupsToValuesMapping[groupName] = Object.keys(dataTypesConfiguration.groupMap.groups[groupName].values);
        return groupsToValuesMapping;
    }, {});
}
export function generateKnownGroups(_a) {
    var dataTypesConfiguration = _a.dataTypesConfiguration;
    return Object.keys(dataTypesConfiguration.groupMap.groups);
}
function useDataTypesConfiguration() {
    var Configuration = useConfiguration();
    var MetacardDefinitions = useMetacardDefinitions();
    var dataTypesConfiguration = React.useMemo(function () {
        return getDataTypesConfiguration({ Configuration: Configuration, MetacardDefinitions: MetacardDefinitions });
    }, [Configuration.getDataTypes(), MetacardDefinitions]);
    var sortedValues = React.useMemo(function () {
        return generateSortedValues({ dataTypesConfiguration: dataTypesConfiguration });
    }, [dataTypesConfiguration]);
    var groupsToValues = React.useMemo(function () {
        return generateGroupsToValues({ dataTypesConfiguration: dataTypesConfiguration });
    }, [dataTypesConfiguration]);
    var knownGroups = React.useMemo(function () {
        return generateKnownGroups({ dataTypesConfiguration: dataTypesConfiguration });
    }, [dataTypesConfiguration]);
    return {
        configuration: dataTypesConfiguration,
        sortedValues: sortedValues,
        groupsToValues: groupsToValues,
        knownGroups: knownGroups,
    };
}
function validateShape(_a) {
    var value = _a.value, onChange = _a.onChange;
    if (!hasValidShape({ value: value })) {
        onChange([]);
    }
}
function hasValidShape(_a) {
    var value = _a.value;
    if (value === undefined || value === null || value.constructor !== Array) {
        return false;
    }
    else {
        return (value.find(function (subvalue) {
            return typeof subvalue !== 'string';
        }) === undefined);
    }
}
function getIconForValue(_a) {
    var _b, _c, _d, _f;
    var value = _a.value, configuration = _a.configuration;
    return (((_c = (_b = configuration.valueMap[value]) === null || _b === void 0 ? void 0 : _b.iconConfig) === null || _c === void 0 ? void 0 : _c.class) ||
        ((_f = (_d = configuration.groupMap.groups[value]) === null || _d === void 0 ? void 0 : _d.iconConfig) === null || _f === void 0 ? void 0 : _f.class));
}
export var ReservedBasicDatatype = function (_a) {
    var _b = _a.value, value = _b === void 0 ? [] : _b, onChange = _a.onChange;
    var datatypesConfiguration = useDataTypesConfiguration();
    React.useEffect(function () {
        validateShape({ value: value, onChange: onChange });
    }, []);
    if (!hasValidShape({ value: value })) {
        return null;
    }
    return (React.createElement(Autocomplete, { fullWidth: true, multiple: true, options: datatypesConfiguration.sortedValues, disableCloseOnSelect: true, getOptionLabel: function (option) { return option.label; }, isOptionEqualToValue: function (option, value) { return option.value === value.value; }, onChange: function (_e, newValue) {
            var _a;
            // should technically only ever be one value, since we filter these out at the end
            var includedGroup = (_a = newValue.find(function (val) {
                return datatypesConfiguration.knownGroups.includes(val.value);
            })) === null || _a === void 0 ? void 0 : _a.value;
            // determine if we need to deselect or select all values in a group
            if (includedGroup) {
                // determine if everything in a group is selected
                var groupValues_1 = datatypesConfiguration.groupsToValues[includedGroup];
                var isGroupSelected = groupValues_1.every(function (val) {
                    return value.includes(val);
                });
                if (isGroupSelected) {
                    newValue = newValue.filter(function (val) {
                        return !groupValues_1.includes(val.value);
                    });
                }
                else {
                    groupValues_1.forEach(function (val) {
                        if (!newValue.find(function (value) { return value.value === val; })) {
                            newValue.push({ label: val, value: val });
                        }
                    });
                }
            }
            // remove any groups, as we don't actually want these in the value or we can't remove other chips in that category once it gets added
            newValue = newValue.filter(function (val) {
                return !datatypesConfiguration.knownGroups.includes(val.value);
            });
            onChange(newValue.map(function (val) { return val.value; }));
        }, size: "small", renderOption: function (props, option) {
            var isGroup = datatypesConfiguration.knownGroups.includes(option.value);
            // determine if everything in a group is selected
            var isGroupSelected = isGroup
                ? datatypesConfiguration.groupsToValues[option.value].every(function (val) {
                    return value.includes(val);
                })
                : false;
            // determine if anything in a group is selected but not everything
            var isGroupPartiallySelected = isGroup && !isGroupSelected
                ? datatypesConfiguration.groupsToValues[option.value].some(function (val) {
                    return value.includes(val);
                })
                : false;
            var isSelected = props['aria-selected'] || isGroupSelected;
            return (React.createElement("li", __assign({}, props, { className: "".concat(props.className, " ").concat(isGroup ? '!pl-2' : '!pl-8', " ").concat(isGroupSelected ? '' : ''), "aria-selected": isSelected }),
                isGroup ? React.createElement(React.Fragment, null) : React.createElement(Swath, { className: "w-1 h-6" }),
                React.createElement("div", { className: "px-2" }, isGroup ? (isGroupSelected ? (React.createElement(CheckBoxIcon, null)) : isGroupPartiallySelected ? (React.createElement(IndeterminateCheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))) : isSelected ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                React.createElement("div", { className: "pr-2 icon ".concat(getIconForValue({
                        value: option.value,
                        configuration: datatypesConfiguration.configuration,
                    })) }),
                React.createElement("div", { className: "pt-[3px]" },
                    " ",
                    option.label)));
        }, renderTags: function (tagValue, getTagProps) {
            return tagValue.map(function (option, index) { return (React.createElement(Chip, __assign({ variant: "outlined", color: "default", label: React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "pr-2 icon ".concat(getIconForValue({
                            value: option.value,
                            configuration: datatypesConfiguration.configuration,
                        })) }),
                    option.label) }, getTagProps({ index: index })))); });
        }, value: value.map(function (val) {
            return {
                label: val,
                value: val,
            };
        }), renderInput: function (params) { return React.createElement(TextField, __assign({}, params, { variant: "outlined" })); } }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Jlc2VydmVkLWJhc2ljLWRhdGF0eXBlL3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQUVKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLHFCQUFxQixDQUFBO0FBQzVDLE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFBO0FBQ3ZELE9BQU8sd0JBQXdCLE1BQU0sMENBQTBDLENBQUE7QUFDL0UsT0FBTyx5QkFBeUIsTUFBTSwyQ0FBMkMsQ0FBQTtBQUVqRixPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUcxRixPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQU1sQyxTQUFTLHFCQUFxQjtJQUM1QixPQUFPLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUMzRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLEVBQUUsQ0FDekQ7UUFDQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixFQUFFO1FBQzFELENBQUMsQ0FBQyxVQUFVLENBQUE7QUFDaEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQUMsRUFNeEI7UUFMQyxhQUFh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QUFDLFFBQVEsRUFBRSxXQUFXO1lBQ2hDLE9BQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sRUFBRSxLQUFLLElBQUssT0FBQSxDQUM5QixvQkFBQyxJQUFJLGFBQ0gsT0FBTyxFQUFDLFVBQVUsRUFDbEIsS0FBSyxFQUFDLFNBQVMsRUFDZixLQUFLLEVBQ0g7b0JBQ0UsNkJBQ0UsU0FBUyxFQUFFLG9CQUFhLGVBQWUsQ0FBQzs0QkFDdEMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLOzRCQUNuQixhQUFhLEVBQUUsc0JBQXNCLENBQUMsYUFBYTt5QkFDcEQsQ0FBQyxDQUFFLEdBQ0o7b0JBQ0QsTUFBTSxDQUFDLEtBQUssQ0FDWixJQUVELFdBQVcsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsRUFDMUIsQ0FDSCxFQWpCK0IsQ0FpQi9CLENBQUM7UUFqQkYsQ0FpQkUsRUFFSixLQUFLLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEdBQUc7WUFDbkIsT0FBTztnQkFDTCxLQUFLLEVBQUUsR0FBRztnQkFDVixLQUFLLEVBQUUsR0FBRzthQUNYLENBQUE7UUFDSCxDQUFDLENBQUMsRUFDRixXQUFXLEVBQUUsVUFBQyxNQUFNLElBQUssT0FBQSxvQkFBQyxTQUFTLGVBQUssTUFBTSxJQUFFLE9BQU8sRUFBQyxVQUFVLElBQUcsRUFBNUMsQ0FBNEMsR0FDckUsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEljb25IZWxwZXIgZnJvbSAnLi4vLi4vanMvSWNvbkhlbHBlcidcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgQ2hlY2tCb3hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hlY2tCb3gnXG5pbXBvcnQgQ2hlY2tCb3hPdXRsaW5lQmxhbmtJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hlY2tCb3hPdXRsaW5lQmxhbmsnXG5pbXBvcnQgSW5kZXRlcm1pbmF0ZUNoZWNrQm94SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0luZGV0ZXJtaW5hdGVDaGVja0JveCdcblxuaW1wb3J0IENoaXAgZnJvbSAnQG11aS9tYXRlcmlhbC9DaGlwJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCB7IHVzZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24uaG9va3MnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgdXNlTWV0YWNhcmREZWZpbml0aW9ucyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvbWV0YWNhcmQtZGVmaW5pdGlvbnMuaG9va3MnXG5pbXBvcnQgeyBCYXNpY0RhdGF0eXBlRmlsdGVyIH0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcblxuaW1wb3J0IFN3YXRoIGZyb20gJy4uL3N3YXRoL3N3YXRoJ1xuaW1wb3J0IHtcbiAgRGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbiAgUmV2ZXJzZURhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG59IGZyb20gJy4uL2RhdGF0eXBlcy9kYXRhdHlwZXMnXG5cbmZ1bmN0aW9uIGdldE1hdGNoVHlwZUF0dHJpYnV0ZSgpIHtcbiAgcmV0dXJuIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtcbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0QmFzaWNTZWFyY2hNYXRjaFR5cGUoKVxuICBdXG4gICAgPyBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0QmFzaWNTZWFyY2hNYXRjaFR5cGUoKVxuICAgIDogJ2RhdGF0eXBlJ1xufVxuXG4vKipcbiAqICBJZiB0aGUgY29uZmlndXJhdGlvbiBpcyBlbXB0eSwgd2UgZ2VuZXJhdGUgYSBjb25maWd1cmF0aW9uIGJhc2VkIG9mZiB0aGUgZW51bSBpbnN0ZWFkXG4gKi9cbmZ1bmN0aW9uIGdldFR5cGVzTWFwcGluZyh7XG4gIENvbmZpZ3VyYXRpb24sXG4gIE1ldGFjYXJkRGVmaW5pdGlvbnMsXG59OiB7XG4gIENvbmZpZ3VyYXRpb246IFJldHVyblR5cGU8dHlwZW9mIHVzZUNvbmZpZ3VyYXRpb24+XG4gIE1ldGFjYXJkRGVmaW5pdGlvbnM6IFJldHVyblR5cGU8dHlwZW9mIHVzZU1ldGFjYXJkRGVmaW5pdGlvbnM+XG59KTogRGF0YVR5cGVzQ29uZmlndXJhdGlvbiB7XG4gIGNvbnN0IGN1c3RvbVR5cGVzQ29uZmlnID0gQ29uZmlndXJhdGlvbi5nZXREYXRhVHlwZXMoKVxuICBpZiAoT2JqZWN0LmtleXMoY3VzdG9tVHlwZXNDb25maWcuZ3JvdXBzKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGN1c3RvbVR5cGVzQ29uZmlnXG4gIH1cbiAgY29uc3QgbWF0Y2hUeXBlQXR0ciA9IGdldE1hdGNoVHlwZUF0dHJpYnV0ZSgpXG4gIGNvbnN0IHZhbGlkVHlwZXMgPSBNZXRhY2FyZERlZmluaXRpb25zLmdldEVudW0obWF0Y2hUeXBlQXR0cilcbiAgY29uc3QgZGVmYXVsdFR5cGVzTWFwcGluZyA9IHZhbGlkVHlwZXMucmVkdWNlKFxuICAgIChibG9iLCB2YWx1ZTogYW55KSA9PiB7XG4gICAgICBjb25zdCBpY29uQ2xhc3MgPSBJY29uSGVscGVyLmdldENsYXNzQnlOYW1lKHZhbHVlKVxuICAgICAgYmxvYi5ncm91cHNbJ090aGVyJ10gPSBibG9iLmdyb3Vwc1snT3RoZXInXSB8fCB7fVxuICAgICAgYmxvYi5ncm91cHNbJ090aGVyJ10udmFsdWVzID0gYmxvYi5ncm91cHNbJ090aGVyJ10udmFsdWVzIHx8IHt9XG5cbiAgICAgIGJsb2IuZ3JvdXBzWydPdGhlciddLnZhbHVlc1t2YWx1ZV0gPSB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBkYXRhdHlwZTogW3ZhbHVlXSxcbiAgICAgICAgICAnbWV0YWRhdGEtY29udGVudC10eXBlJzogW3ZhbHVlXSxcbiAgICAgICAgfSxcbiAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgIGNsYXNzOiBpY29uQ2xhc3MsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge1xuICAgICAgZ3JvdXBzOiB7fSxcbiAgICB9IGFzIFJldHVyblR5cGU8dHlwZW9mIENvbmZpZ3VyYXRpb24uZ2V0RGF0YVR5cGVzPlxuICApXG4gIHJldHVybiBkZWZhdWx0VHlwZXNNYXBwaW5nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uKHtcbiAgQ29uZmlndXJhdGlvbixcbiAgTWV0YWNhcmREZWZpbml0aW9ucyxcbn06IHtcbiAgQ29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgdXNlQ29uZmlndXJhdGlvbj5cbiAgTWV0YWNhcmREZWZpbml0aW9uczogUmV0dXJuVHlwZTx0eXBlb2YgdXNlTWV0YWNhcmREZWZpbml0aW9ucz5cbn0pOiB7XG4gIGdyb3VwTWFwOiBEYXRhVHlwZXNDb25maWd1cmF0aW9uXG4gIHZhbHVlTWFwOiBSZXZlcnNlRGF0YVR5cGVzQ29uZmlndXJhdGlvblxufSB7XG4gIGNvbnN0IHR5cGVzTWFwcGluZyA9IGdldFR5cGVzTWFwcGluZyh7IENvbmZpZ3VyYXRpb24sIE1ldGFjYXJkRGVmaW5pdGlvbnMgfSlcbiAgY29uc3QgcmV2ZXJzZU1hcHBpbmcgPSBPYmplY3QuZW50cmllcyh0eXBlc01hcHBpbmcuZ3JvdXBzKS5yZWR1Y2UoXG4gICAgKGJsb2IsIFtncm91cE5hbWUsIGdyb3VwSW5mb10pID0+IHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKGdyb3VwSW5mby52YWx1ZXMpLmZvckVhY2goKFt2YWx1ZU5hbWUsIHZhbHVlSW5mb10pID0+IHtcbiAgICAgICAgYmxvYlt2YWx1ZU5hbWVdID0ge1xuICAgICAgICAgIGdyb3VwOiB7XG4gICAgICAgICAgICBuYW1lOiBncm91cE5hbWUsXG4gICAgICAgICAgICBpY29uQ29uZmlnOiBncm91cEluZm8uaWNvbkNvbmZpZyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIC4uLnZhbHVlSW5mbyxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiBibG9iXG4gICAgfSxcbiAgICB7fSBhcyBSZXZlcnNlRGF0YVR5cGVzQ29uZmlndXJhdGlvblxuICApXG5cbiAgcmV0dXJuIHtcbiAgICBncm91cE1hcDogdHlwZXNNYXBwaW5nLFxuICAgIHZhbHVlTWFwOiByZXZlcnNlTWFwcGluZyxcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRHcm91cEZyb21WYWx1ZSh7XG4gIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG4gIHZhbHVlLFxuICBvcmRlcmVkR3JvdXBzLFxufToge1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uPlxuICB2YWx1ZTogc3RyaW5nXG4gIG9yZGVyZWRHcm91cHM6IHN0cmluZ1tdXG59KSB7XG4gIGNvbnN0IGdyb3VwTmFtZSA9IGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24udmFsdWVNYXBbdmFsdWVdPy5ncm91cC5uYW1lXG4gIHJldHVybiBvcmRlcmVkR3JvdXBzLmluY2x1ZGVzKGdyb3VwTmFtZSlcbiAgICA/IGdyb3VwTmFtZVxuICAgIDogb3JkZXJlZEdyb3Vwcy5pbmNsdWRlcyh2YWx1ZSlcbiAgICA/IHZhbHVlXG4gICAgOiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNvcnRlZFZhbHVlcyh7XG4gIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG59OiB7XG4gIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb246IFJldHVyblR5cGU8dHlwZW9mIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24+XG59KSB7XG4gIGNvbnN0IG9yZGVyZWRHcm91cHMgPSBPYmplY3Qua2V5cyhkYXRhVHlwZXNDb25maWd1cmF0aW9uLmdyb3VwTWFwLmdyb3VwcylcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24udmFsdWVNYXApXG4gICAgLmNvbmNhdChvcmRlcmVkR3JvdXBzKVxuICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBjb25zdCBncm91cEEgPSBnZXRHcm91cEZyb21WYWx1ZSh7XG4gICAgICAgIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG4gICAgICAgIHZhbHVlOiBhLFxuICAgICAgICBvcmRlcmVkR3JvdXBzLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IGdyb3VwQiA9IGdldEdyb3VwRnJvbVZhbHVlKHtcbiAgICAgICAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbiAgICAgICAgdmFsdWU6IGIsXG4gICAgICAgIG9yZGVyZWRHcm91cHMsXG4gICAgICB9KVxuXG4gICAgICAvLyBIYW5kbGUgY2FzZXMgd2hlcmUgb25lIHZhbHVlIGhhcyBhIGdyb3VwIGFuZCB0aGUgb3RoZXIgZG9lc24ndCAoZ3JvdXBlZCBjb21lcyBmaXJzdClcbiAgICAgIGlmIChncm91cEEgJiYgIWdyb3VwQikgcmV0dXJuIC0xXG4gICAgICBpZiAoIWdyb3VwQSAmJiBncm91cEIpIHJldHVybiAxXG5cbiAgICAgIC8vIFNvcnQgYnkgZ3JvdXAgaWYgYm90aCB2YWx1ZXMgaGF2ZSBkaWZmZXJlbnQgZ3JvdXBzIChncm91cCBvcmRlciBtYXR0ZXJzKVxuICAgICAgaWYgKGdyb3VwQSAmJiBncm91cEIgJiYgZ3JvdXBBICE9PSBncm91cEIpIHtcbiAgICAgICAgcmV0dXJuIG9yZGVyZWRHcm91cHMuaW5kZXhPZihncm91cEEpIC0gb3JkZXJlZEdyb3Vwcy5pbmRleE9mKGdyb3VwQilcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhleSBhcmUgaW4gdGhlIHNhbWUgZ3JvdXAsIHNvcnQgYnkgd2hldGhlciB0aGUgdmFsdWUgaXRzZWxmIGlzIHRoZSBncm91cCAoaWYgaXQncyB0aGUgZ3JvdXAsIGl0IGNvbWVzIGZpcnN0KVxuICAgICAgaWYgKGdyb3VwQSA9PT0gZ3JvdXBCKSB7XG4gICAgICAgIGlmIChhID09PSBncm91cEEpIHJldHVybiAtMVxuICAgICAgICBpZiAoYiA9PT0gZ3JvdXBCKSByZXR1cm4gMVxuICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpIC8vIFN1Yi1zb3J0IGFscGhhYmV0aWNhbGx5IGlmIG5vdCB0aGUgZ3JvdXAgaXRzZWxmXG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGdyb3VwcyBhcmUgaW52b2x2ZWQsIHNvcnQgYWxwaGFiZXRpY2FsbHlcbiAgICAgIHJldHVybiBhLmxvY2FsZUNvbXBhcmUoYilcbiAgICB9KVxuICAgIC5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsYWJlbDogdmFsdWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgfVxuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUdyb3Vwc1RvVmFsdWVzKHtcbiAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbn06IHtcbiAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbj5cbn0pIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24uZ3JvdXBNYXAuZ3JvdXBzKS5yZWR1Y2UoXG4gICAgKGdyb3Vwc1RvVmFsdWVzTWFwcGluZywgZ3JvdXBOYW1lKSA9PiB7XG4gICAgICBncm91cHNUb1ZhbHVlc01hcHBpbmdbZ3JvdXBOYW1lXSA9IE9iamVjdC5rZXlzKFxuICAgICAgICBkYXRhVHlwZXNDb25maWd1cmF0aW9uLmdyb3VwTWFwLmdyb3Vwc1tncm91cE5hbWVdLnZhbHVlc1xuICAgICAgKVxuICAgICAgcmV0dXJuIGdyb3Vwc1RvVmFsdWVzTWFwcGluZ1xuICAgIH0sXG4gICAge30gYXMgeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlS25vd25Hcm91cHMoe1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uLFxufToge1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uPlxufSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoZGF0YVR5cGVzQ29uZmlndXJhdGlvbi5ncm91cE1hcC5ncm91cHMpXG59XG5cbmZ1bmN0aW9uIHVzZURhdGFUeXBlc0NvbmZpZ3VyYXRpb24oKToge1xuICBjb25maWd1cmF0aW9uOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uPlxuICBzb3J0ZWRWYWx1ZXM6IHsgbGFiZWw6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9W11cbiAgZ3JvdXBzVG9WYWx1ZXM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmdbXVxuICB9XG4gIGtub3duR3JvdXBzOiBzdHJpbmdbXVxufSB7XG4gIGNvbnN0IENvbmZpZ3VyYXRpb24gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgY29uc3QgTWV0YWNhcmREZWZpbml0aW9ucyA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuXG4gIGNvbnN0IGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24gPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbih7IENvbmZpZ3VyYXRpb24sIE1ldGFjYXJkRGVmaW5pdGlvbnMgfSlcbiAgfSwgW0NvbmZpZ3VyYXRpb24uZ2V0RGF0YVR5cGVzKCksIE1ldGFjYXJkRGVmaW5pdGlvbnNdKVxuXG4gIGNvbnN0IHNvcnRlZFZhbHVlcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBnZW5lcmF0ZVNvcnRlZFZhbHVlcyh7IGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24gfSlcbiAgfSwgW2RhdGFUeXBlc0NvbmZpZ3VyYXRpb25dKVxuXG4gIGNvbnN0IGdyb3Vwc1RvVmFsdWVzID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIGdlbmVyYXRlR3JvdXBzVG9WYWx1ZXMoeyBkYXRhVHlwZXNDb25maWd1cmF0aW9uIH0pXG4gIH0sIFtkYXRhVHlwZXNDb25maWd1cmF0aW9uXSlcblxuICBjb25zdCBrbm93bkdyb3VwcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBnZW5lcmF0ZUtub3duR3JvdXBzKHsgZGF0YVR5cGVzQ29uZmlndXJhdGlvbiB9KVxuICB9LCBbZGF0YVR5cGVzQ29uZmlndXJhdGlvbl0pXG5cbiAgcmV0dXJuIHtcbiAgICBjb25maWd1cmF0aW9uOiBkYXRhVHlwZXNDb25maWd1cmF0aW9uLFxuICAgIHNvcnRlZFZhbHVlcyxcbiAgICBncm91cHNUb1ZhbHVlcyxcbiAgICBrbm93bkdyb3VwcyxcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVNoYXBlKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlLFxufToge1xuICB2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclsndmFsdWUnXVxuICBvbkNoYW5nZTogKHZhbHVlOiBCYXNpY0RhdGF0eXBlRmlsdGVyWyd2YWx1ZSddKSA9PiB2b2lkXG59KSB7XG4gIGlmICghaGFzVmFsaWRTaGFwZSh7IHZhbHVlIH0pKSB7XG4gICAgb25DaGFuZ2UoW10pXG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzVmFsaWRTaGFwZSh7XG4gIHZhbHVlLFxufToge1xuICB2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclsndmFsdWUnXVxufSk6IGJvb2xlYW4ge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZS5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKFxuICAgICAgdmFsdWUuZmluZCgoc3VidmFsdWUpID0+IHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzdWJ2YWx1ZSAhPT0gJ3N0cmluZydcbiAgICAgIH0pID09PSB1bmRlZmluZWRcbiAgICApXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0SWNvbkZvclZhbHVlKHtcbiAgdmFsdWUsXG4gIGNvbmZpZ3VyYXRpb24sXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgY29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbj5cbn0pIHtcbiAgcmV0dXJuIChcbiAgICBjb25maWd1cmF0aW9uLnZhbHVlTWFwW3ZhbHVlXT8uaWNvbkNvbmZpZz8uY2xhc3MgfHxcbiAgICBjb25maWd1cmF0aW9uLmdyb3VwTWFwLmdyb3Vwc1t2YWx1ZV0/Lmljb25Db25maWc/LmNsYXNzXG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IFJlc2VydmVkQmFzaWNEYXRhdHlwZSA9ICh7XG4gIHZhbHVlID0gW10sXG4gIG9uQ2hhbmdlLFxufToge1xuICB2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclsndmFsdWUnXVxuICBvbkNoYW5nZTogKHZhbHVlOiBCYXNpY0RhdGF0eXBlRmlsdGVyWyd2YWx1ZSddKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24gPSB1c2VEYXRhVHlwZXNDb25maWd1cmF0aW9uKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICB2YWxpZGF0ZVNoYXBlKHsgdmFsdWUsIG9uQ2hhbmdlIH0pXG4gIH0sIFtdKVxuXG4gIGlmICghaGFzVmFsaWRTaGFwZSh7IHZhbHVlIH0pKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxBdXRvY29tcGxldGVcbiAgICAgIGZ1bGxXaWR0aFxuICAgICAgbXVsdGlwbGVcbiAgICAgIG9wdGlvbnM9e2RhdGF0eXBlc0NvbmZpZ3VyYXRpb24uc29ydGVkVmFsdWVzfVxuICAgICAgZGlzYWJsZUNsb3NlT25TZWxlY3RcbiAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiBvcHRpb24ubGFiZWx9XG4gICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbiwgdmFsdWUpID0+IG9wdGlvbi52YWx1ZSA9PT0gdmFsdWUudmFsdWV9XG4gICAgICBvbkNoYW5nZT17KF9lLCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAvLyBzaG91bGQgdGVjaG5pY2FsbHkgb25seSBldmVyIGJlIG9uZSB2YWx1ZSwgc2luY2Ugd2UgZmlsdGVyIHRoZXNlIG91dCBhdCB0aGUgZW5kXG4gICAgICAgIGNvbnN0IGluY2x1ZGVkR3JvdXAgPSBuZXdWYWx1ZS5maW5kKCh2YWwpID0+IHtcbiAgICAgICAgICByZXR1cm4gZGF0YXR5cGVzQ29uZmlndXJhdGlvbi5rbm93bkdyb3Vwcy5pbmNsdWRlcyh2YWwudmFsdWUpXG4gICAgICAgIH0pPy52YWx1ZVxuXG4gICAgICAgIC8vIGRldGVybWluZSBpZiB3ZSBuZWVkIHRvIGRlc2VsZWN0IG9yIHNlbGVjdCBhbGwgdmFsdWVzIGluIGEgZ3JvdXBcbiAgICAgICAgaWYgKGluY2x1ZGVkR3JvdXApIHtcbiAgICAgICAgICAvLyBkZXRlcm1pbmUgaWYgZXZlcnl0aGluZyBpbiBhIGdyb3VwIGlzIHNlbGVjdGVkXG4gICAgICAgICAgY29uc3QgZ3JvdXBWYWx1ZXMgPVxuICAgICAgICAgICAgZGF0YXR5cGVzQ29uZmlndXJhdGlvbi5ncm91cHNUb1ZhbHVlc1tpbmNsdWRlZEdyb3VwXVxuICAgICAgICAgIGNvbnN0IGlzR3JvdXBTZWxlY3RlZCA9IGdyb3VwVmFsdWVzLmV2ZXJ5KCh2YWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5pbmNsdWRlcyh2YWwpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAoaXNHcm91cFNlbGVjdGVkKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IG5ld1ZhbHVlLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiAhZ3JvdXBWYWx1ZXMuaW5jbHVkZXModmFsLnZhbHVlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ3JvdXBWYWx1ZXMuZm9yRWFjaCgodmFsKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghbmV3VmFsdWUuZmluZCgodmFsdWUpID0+IHZhbHVlLnZhbHVlID09PSB2YWwpKSB7XG4gICAgICAgICAgICAgICAgbmV3VmFsdWUucHVzaCh7IGxhYmVsOiB2YWwsIHZhbHVlOiB2YWwgfSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgYW55IGdyb3VwcywgYXMgd2UgZG9uJ3QgYWN0dWFsbHkgd2FudCB0aGVzZSBpbiB0aGUgdmFsdWUgb3Igd2UgY2FuJ3QgcmVtb3ZlIG90aGVyIGNoaXBzIGluIHRoYXQgY2F0ZWdvcnkgb25jZSBpdCBnZXRzIGFkZGVkXG4gICAgICAgIG5ld1ZhbHVlID0gbmV3VmFsdWUuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgICAgICByZXR1cm4gIWRhdGF0eXBlc0NvbmZpZ3VyYXRpb24ua25vd25Hcm91cHMuaW5jbHVkZXModmFsLnZhbHVlKVxuICAgICAgICB9KVxuICAgICAgICBvbkNoYW5nZShuZXdWYWx1ZS5tYXAoKHZhbCkgPT4gdmFsLnZhbHVlKSlcbiAgICAgIH19XG4gICAgICBzaXplPVwic21hbGxcIlxuICAgICAgcmVuZGVyT3B0aW9uPXsocHJvcHMsIG9wdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBpc0dyb3VwID0gZGF0YXR5cGVzQ29uZmlndXJhdGlvbi5rbm93bkdyb3Vwcy5pbmNsdWRlcyhcbiAgICAgICAgICBvcHRpb24udmFsdWVcbiAgICAgICAgKVxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgZXZlcnl0aGluZyBpbiBhIGdyb3VwIGlzIHNlbGVjdGVkXG4gICAgICAgIGNvbnN0IGlzR3JvdXBTZWxlY3RlZCA9IGlzR3JvdXBcbiAgICAgICAgICA/IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24uZ3JvdXBzVG9WYWx1ZXNbb3B0aW9uLnZhbHVlXS5ldmVyeSgodmFsKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5pbmNsdWRlcyh2YWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIDogZmFsc2VcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGFueXRoaW5nIGluIGEgZ3JvdXAgaXMgc2VsZWN0ZWQgYnV0IG5vdCBldmVyeXRoaW5nXG4gICAgICAgIGNvbnN0IGlzR3JvdXBQYXJ0aWFsbHlTZWxlY3RlZCA9XG4gICAgICAgICAgaXNHcm91cCAmJiAhaXNHcm91cFNlbGVjdGVkXG4gICAgICAgICAgICA/IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24uZ3JvdXBzVG9WYWx1ZXNbb3B0aW9uLnZhbHVlXS5zb21lKFxuICAgICAgICAgICAgICAgICh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5pbmNsdWRlcyh2YWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICA6IGZhbHNlXG5cbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IHByb3BzWydhcmlhLXNlbGVjdGVkJ10gfHwgaXNHcm91cFNlbGVjdGVkXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGlcbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7cHJvcHMuY2xhc3NOYW1lfSAke2lzR3JvdXAgPyAnIXBsLTInIDogJyFwbC04J30gJHtcbiAgICAgICAgICAgICAgaXNHcm91cFNlbGVjdGVkID8gJycgOiAnJ1xuICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpc1NlbGVjdGVkfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtpc0dyb3VwID8gPD48Lz4gOiA8U3dhdGggY2xhc3NOYW1lPVwidy0xIGgtNlwiIC8+fVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC0yXCI+XG4gICAgICAgICAgICAgIHtpc0dyb3VwID8gKFxuICAgICAgICAgICAgICAgIGlzR3JvdXBTZWxlY3RlZCA/IChcbiAgICAgICAgICAgICAgICAgIDxDaGVja0JveEljb24gLz5cbiAgICAgICAgICAgICAgICApIDogaXNHcm91cFBhcnRpYWxseVNlbGVjdGVkID8gKFxuICAgICAgICAgICAgICAgICAgPEluZGV0ZXJtaW5hdGVDaGVja0JveEljb24gLz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPENoZWNrQm94T3V0bGluZUJsYW5rSWNvbiAvPlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IGlzU2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICAgICAgPENoZWNrQm94SWNvbiAvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxDaGVja0JveE91dGxpbmVCbGFua0ljb24gLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bwci0yIGljb24gJHtnZXRJY29uRm9yVmFsdWUoe1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb24udmFsdWUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbjogZGF0YXR5cGVzQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICB9KX1gfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtWzNweF1cIj4ge29wdGlvbi5sYWJlbH08L2Rpdj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApXG4gICAgICB9fVxuICAgICAgcmVuZGVyVGFncz17KHRhZ1ZhbHVlLCBnZXRUYWdQcm9wcykgPT5cbiAgICAgICAgdGFnVmFsdWUubWFwKChvcHRpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgPENoaXBcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cImRlZmF1bHRcIlxuICAgICAgICAgICAgbGFiZWw9e1xuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHByLTIgaWNvbiAke2dldEljb25Gb3JWYWx1ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRpb24udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICAgIH0pfWB9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHsuLi5nZXRUYWdQcm9wcyh7IGluZGV4IH0pfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpXG4gICAgICB9XG4gICAgICB2YWx1ZT17dmFsdWUubWFwKCh2YWwpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsYWJlbDogdmFsLFxuICAgICAgICAgIHZhbHVlOiB2YWwsXG4gICAgICAgIH1cbiAgICAgIH0pfVxuICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IDxUZXh0RmllbGQgey4uLnBhcmFtc30gdmFyaWFudD1cIm91dGxpbmVkXCIgLz59XG4gICAgLz5cbiAgKVxufVxuIl19