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
    if (value === undefined || value === null || !Array.isArray(value)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3Jlc2VydmVkLWJhc2ljLWRhdGF0eXBlL3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQUVKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLHFCQUFxQixDQUFBO0FBQzVDLE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sWUFBWSxNQUFNLDhCQUE4QixDQUFBO0FBQ3ZELE9BQU8sd0JBQXdCLE1BQU0sMENBQTBDLENBQUE7QUFDL0UsT0FBTyx5QkFBeUIsTUFBTSwyQ0FBMkMsQ0FBQTtBQUVqRixPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUcxRixPQUFPLEtBQUssTUFBTSxnQkFBZ0IsQ0FBQTtBQU1sQyxTQUFTLHFCQUFxQjtJQUM1QixPQUFPLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUMzRCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLEVBQUUsQ0FDekQ7UUFDQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixFQUFFO1FBQzFELENBQUMsQ0FBQyxVQUFVLENBQUE7QUFDaEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQUMsRUFNeEI7UUFMQyxhQUFh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QUFVLEVBQUUsVUFBQyxRQUFRLEVBQUUsV0FBVztZQUNoQyxPQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNLEVBQUUsS0FBSyxJQUFLLE9BQUEsQ0FDOUIsb0JBQUMsSUFBSSxhQUNILE9BQU8sRUFBQyxVQUFVLEVBQ2xCLEtBQUssRUFBQyxTQUFTLEVBQ2YsS0FBSyxFQUNIO29CQUNFLDZCQUNFLFNBQVMsRUFBRSxvQkFBYSxlQUFlLENBQUM7NEJBQ3RDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSzs0QkFDbkIsYUFBYSxFQUFFLHNCQUFzQixDQUFDLGFBQWE7eUJBQ3BELENBQUMsQ0FBRSxHQUNKO29CQUNELE1BQU0sQ0FBQyxLQUFLLENBQ1osSUFFRCxXQUFXLENBQUMsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLEVBQzFCLENBQ0gsRUFqQitCLENBaUIvQixDQUFDO1FBakJGLENBaUJFLEVBRUosS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHO1lBQ25CLE9BQU87Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsS0FBSyxFQUFFLEdBQUc7YUFDWCxDQUFBO1FBQ0gsQ0FBQyxDQUFDLEVBQ0YsV0FBVyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsb0JBQUMsU0FBUyxlQUFLLE1BQU0sSUFBRSxPQUFPLEVBQUMsVUFBVSxJQUFHLEVBQTVDLENBQTRDLEdBQ3JFLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBJY29uSGVscGVyIGZyb20gJy4uLy4uL2pzL0ljb25IZWxwZXInXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IENoZWNrQm94SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94J1xuaW1wb3J0IENoZWNrQm94T3V0bGluZUJsYW5rSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94T3V0bGluZUJsYW5rJ1xuaW1wb3J0IEluZGV0ZXJtaW5hdGVDaGVja0JveEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9JbmRldGVybWluYXRlQ2hlY2tCb3gnXG5cbmltcG9ydCBDaGlwIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2hpcCdcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgeyB1c2VDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9jb25maWd1cmF0aW9uLmhvb2tzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IHsgQmFzaWNEYXRhdHlwZUZpbHRlciB9IGZyb20gJy4uL2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5cbmltcG9ydCBTd2F0aCBmcm9tICcuLi9zd2F0aC9zd2F0aCdcbmltcG9ydCB7XG4gIERhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG4gIFJldmVyc2VEYXRhVHlwZXNDb25maWd1cmF0aW9uLFxufSBmcm9tICcuLi9kYXRhdHlwZXMvZGF0YXR5cGVzJ1xuXG5mdW5jdGlvbiBnZXRNYXRjaFR5cGVBdHRyaWJ1dGUoKSB7XG4gIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEJhc2ljU2VhcmNoTWF0Y2hUeXBlKClcbiAgXVxuICAgID8gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEJhc2ljU2VhcmNoTWF0Y2hUeXBlKClcbiAgICA6ICdkYXRhdHlwZSdcbn1cblxuLyoqXG4gKiAgSWYgdGhlIGNvbmZpZ3VyYXRpb24gaXMgZW1wdHksIHdlIGdlbmVyYXRlIGEgY29uZmlndXJhdGlvbiBiYXNlZCBvZmYgdGhlIGVudW0gaW5zdGVhZFxuICovXG5mdW5jdGlvbiBnZXRUeXBlc01hcHBpbmcoe1xuICBDb25maWd1cmF0aW9uLFxuICBNZXRhY2FyZERlZmluaXRpb25zLFxufToge1xuICBDb25maWd1cmF0aW9uOiBSZXR1cm5UeXBlPHR5cGVvZiB1c2VDb25maWd1cmF0aW9uPlxuICBNZXRhY2FyZERlZmluaXRpb25zOiBSZXR1cm5UeXBlPHR5cGVvZiB1c2VNZXRhY2FyZERlZmluaXRpb25zPlxufSk6IERhdGFUeXBlc0NvbmZpZ3VyYXRpb24ge1xuICBjb25zdCBjdXN0b21UeXBlc0NvbmZpZyA9IENvbmZpZ3VyYXRpb24uZ2V0RGF0YVR5cGVzKClcbiAgaWYgKE9iamVjdC5rZXlzKGN1c3RvbVR5cGVzQ29uZmlnLmdyb3VwcykubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBjdXN0b21UeXBlc0NvbmZpZ1xuICB9XG4gIGNvbnN0IG1hdGNoVHlwZUF0dHIgPSBnZXRNYXRjaFR5cGVBdHRyaWJ1dGUoKVxuICBjb25zdCB2YWxpZFR5cGVzID0gTWV0YWNhcmREZWZpbml0aW9ucy5nZXRFbnVtKG1hdGNoVHlwZUF0dHIpXG4gIGNvbnN0IGRlZmF1bHRUeXBlc01hcHBpbmcgPSB2YWxpZFR5cGVzLnJlZHVjZShcbiAgICAoYmxvYiwgdmFsdWU6IGFueSkgPT4ge1xuICAgICAgY29uc3QgaWNvbkNsYXNzID0gSWNvbkhlbHBlci5nZXRDbGFzc0J5TmFtZSh2YWx1ZSlcbiAgICAgIGJsb2IuZ3JvdXBzWydPdGhlciddID0gYmxvYi5ncm91cHNbJ090aGVyJ10gfHwge31cbiAgICAgIGJsb2IuZ3JvdXBzWydPdGhlciddLnZhbHVlcyA9IGJsb2IuZ3JvdXBzWydPdGhlciddLnZhbHVlcyB8fCB7fVxuXG4gICAgICBibG9iLmdyb3Vwc1snT3RoZXInXS52YWx1ZXNbdmFsdWVdID0ge1xuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgZGF0YXR5cGU6IFt2YWx1ZV0sXG4gICAgICAgICAgJ21ldGFkYXRhLWNvbnRlbnQtdHlwZSc6IFt2YWx1ZV0sXG4gICAgICAgIH0sXG4gICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICBjbGFzczogaWNvbkNsYXNzLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2JcbiAgICB9LFxuICAgIHtcbiAgICAgIGdyb3Vwczoge30sXG4gICAgfSBhcyBSZXR1cm5UeXBlPHR5cGVvZiBDb25maWd1cmF0aW9uLmdldERhdGFUeXBlcz5cbiAgKVxuICByZXR1cm4gZGVmYXVsdFR5cGVzTWFwcGluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbih7XG4gIENvbmZpZ3VyYXRpb24sXG4gIE1ldGFjYXJkRGVmaW5pdGlvbnMsXG59OiB7XG4gIENvbmZpZ3VyYXRpb246IFJldHVyblR5cGU8dHlwZW9mIHVzZUNvbmZpZ3VyYXRpb24+XG4gIE1ldGFjYXJkRGVmaW5pdGlvbnM6IFJldHVyblR5cGU8dHlwZW9mIHVzZU1ldGFjYXJkRGVmaW5pdGlvbnM+XG59KToge1xuICBncm91cE1hcDogRGF0YVR5cGVzQ29uZmlndXJhdGlvblxuICB2YWx1ZU1hcDogUmV2ZXJzZURhdGFUeXBlc0NvbmZpZ3VyYXRpb25cbn0ge1xuICBjb25zdCB0eXBlc01hcHBpbmcgPSBnZXRUeXBlc01hcHBpbmcoeyBDb25maWd1cmF0aW9uLCBNZXRhY2FyZERlZmluaXRpb25zIH0pXG4gIGNvbnN0IHJldmVyc2VNYXBwaW5nID0gT2JqZWN0LmVudHJpZXModHlwZXNNYXBwaW5nLmdyb3VwcykucmVkdWNlKFxuICAgIChibG9iLCBbZ3JvdXBOYW1lLCBncm91cEluZm9dKSA9PiB7XG4gICAgICBPYmplY3QuZW50cmllcyhncm91cEluZm8udmFsdWVzKS5mb3JFYWNoKChbdmFsdWVOYW1lLCB2YWx1ZUluZm9dKSA9PiB7XG4gICAgICAgIGJsb2JbdmFsdWVOYW1lXSA9IHtcbiAgICAgICAgICBncm91cDoge1xuICAgICAgICAgICAgbmFtZTogZ3JvdXBOYW1lLFxuICAgICAgICAgICAgaWNvbkNvbmZpZzogZ3JvdXBJbmZvLmljb25Db25maWcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICAuLi52YWx1ZUluZm8sXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gYmxvYlxuICAgIH0sXG4gICAge30gYXMgUmV2ZXJzZURhdGFUeXBlc0NvbmZpZ3VyYXRpb25cbiAgKVxuXG4gIHJldHVybiB7XG4gICAgZ3JvdXBNYXA6IHR5cGVzTWFwcGluZyxcbiAgICB2YWx1ZU1hcDogcmV2ZXJzZU1hcHBpbmcsXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0R3JvdXBGcm9tVmFsdWUoe1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uLFxuICB2YWx1ZSxcbiAgb3JkZXJlZEdyb3Vwcyxcbn06IHtcbiAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbj5cbiAgdmFsdWU6IHN0cmluZ1xuICBvcmRlcmVkR3JvdXBzOiBzdHJpbmdbXVxufSkge1xuICBjb25zdCBncm91cE5hbWUgPSBkYXRhVHlwZXNDb25maWd1cmF0aW9uLnZhbHVlTWFwW3ZhbHVlXT8uZ3JvdXAubmFtZVxuICByZXR1cm4gb3JkZXJlZEdyb3Vwcy5pbmNsdWRlcyhncm91cE5hbWUpXG4gICAgPyBncm91cE5hbWVcbiAgICA6IG9yZGVyZWRHcm91cHMuaW5jbHVkZXModmFsdWUpXG4gICAgPyB2YWx1ZVxuICAgIDogbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTb3J0ZWRWYWx1ZXMoe1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uLFxufToge1xuICBkYXRhVHlwZXNDb25maWd1cmF0aW9uOiBSZXR1cm5UeXBlPHR5cGVvZiBnZXREYXRhVHlwZXNDb25maWd1cmF0aW9uPlxufSkge1xuICBjb25zdCBvcmRlcmVkR3JvdXBzID0gT2JqZWN0LmtleXMoZGF0YVR5cGVzQ29uZmlndXJhdGlvbi5ncm91cE1hcC5ncm91cHMpXG4gIHJldHVybiBPYmplY3Qua2V5cyhkYXRhVHlwZXNDb25maWd1cmF0aW9uLnZhbHVlTWFwKVxuICAgIC5jb25jYXQob3JkZXJlZEdyb3VwcylcbiAgICAuc29ydCgoYSwgYikgPT4ge1xuICAgICAgY29uc3QgZ3JvdXBBID0gZ2V0R3JvdXBGcm9tVmFsdWUoe1xuICAgICAgICBkYXRhVHlwZXNDb25maWd1cmF0aW9uLFxuICAgICAgICB2YWx1ZTogYSxcbiAgICAgICAgb3JkZXJlZEdyb3VwcyxcbiAgICAgIH0pXG4gICAgICBjb25zdCBncm91cEIgPSBnZXRHcm91cEZyb21WYWx1ZSh7XG4gICAgICAgIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG4gICAgICAgIHZhbHVlOiBiLFxuICAgICAgICBvcmRlcmVkR3JvdXBzLFxuICAgICAgfSlcblxuICAgICAgLy8gSGFuZGxlIGNhc2VzIHdoZXJlIG9uZSB2YWx1ZSBoYXMgYSBncm91cCBhbmQgdGhlIG90aGVyIGRvZXNuJ3QgKGdyb3VwZWQgY29tZXMgZmlyc3QpXG4gICAgICBpZiAoZ3JvdXBBICYmICFncm91cEIpIHJldHVybiAtMVxuICAgICAgaWYgKCFncm91cEEgJiYgZ3JvdXBCKSByZXR1cm4gMVxuXG4gICAgICAvLyBTb3J0IGJ5IGdyb3VwIGlmIGJvdGggdmFsdWVzIGhhdmUgZGlmZmVyZW50IGdyb3VwcyAoZ3JvdXAgb3JkZXIgbWF0dGVycylcbiAgICAgIGlmIChncm91cEEgJiYgZ3JvdXBCICYmIGdyb3VwQSAhPT0gZ3JvdXBCKSB7XG4gICAgICAgIHJldHVybiBvcmRlcmVkR3JvdXBzLmluZGV4T2YoZ3JvdXBBKSAtIG9yZGVyZWRHcm91cHMuaW5kZXhPZihncm91cEIpXG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZXkgYXJlIGluIHRoZSBzYW1lIGdyb3VwLCBzb3J0IGJ5IHdoZXRoZXIgdGhlIHZhbHVlIGl0c2VsZiBpcyB0aGUgZ3JvdXAgKGlmIGl0J3MgdGhlIGdyb3VwLCBpdCBjb21lcyBmaXJzdClcbiAgICAgIGlmIChncm91cEEgPT09IGdyb3VwQikge1xuICAgICAgICBpZiAoYSA9PT0gZ3JvdXBBKSByZXR1cm4gLTFcbiAgICAgICAgaWYgKGIgPT09IGdyb3VwQikgcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiKSAvLyBTdWItc29ydCBhbHBoYWJldGljYWxseSBpZiBub3QgdGhlIGdyb3VwIGl0c2VsZlxuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBncm91cHMgYXJlIGludm9sdmVkLCBzb3J0IGFscGhhYmV0aWNhbGx5XG4gICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpXG4gICAgfSlcbiAgICAubWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGFiZWw6IHZhbHVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgIH1cbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVHcm91cHNUb1ZhbHVlcyh7XG4gIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24sXG59OiB7XG4gIGRhdGFUeXBlc0NvbmZpZ3VyYXRpb246IFJldHVyblR5cGU8dHlwZW9mIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24+XG59KSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhkYXRhVHlwZXNDb25maWd1cmF0aW9uLmdyb3VwTWFwLmdyb3VwcykucmVkdWNlKFxuICAgIChncm91cHNUb1ZhbHVlc01hcHBpbmcsIGdyb3VwTmFtZSkgPT4ge1xuICAgICAgZ3JvdXBzVG9WYWx1ZXNNYXBwaW5nW2dyb3VwTmFtZV0gPSBPYmplY3Qua2V5cyhcbiAgICAgICAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbi5ncm91cE1hcC5ncm91cHNbZ3JvdXBOYW1lXS52YWx1ZXNcbiAgICAgIClcbiAgICAgIHJldHVybiBncm91cHNUb1ZhbHVlc01hcHBpbmdcbiAgICB9LFxuICAgIHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfVxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUtub3duR3JvdXBzKHtcbiAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbn06IHtcbiAgZGF0YVR5cGVzQ29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbj5cbn0pIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24uZ3JvdXBNYXAuZ3JvdXBzKVxufVxuXG5mdW5jdGlvbiB1c2VEYXRhVHlwZXNDb25maWd1cmF0aW9uKCk6IHtcbiAgY29uZmlndXJhdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbj5cbiAgc29ydGVkVmFsdWVzOiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfVtdXG4gIGdyb3Vwc1RvVmFsdWVzOiB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nW11cbiAgfVxuICBrbm93bkdyb3Vwczogc3RyaW5nW11cbn0ge1xuICBjb25zdCBDb25maWd1cmF0aW9uID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IE1ldGFjYXJkRGVmaW5pdGlvbnMgPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcblxuICBjb25zdCBkYXRhVHlwZXNDb25maWd1cmF0aW9uID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24oeyBDb25maWd1cmF0aW9uLCBNZXRhY2FyZERlZmluaXRpb25zIH0pXG4gIH0sIFtDb25maWd1cmF0aW9uLmdldERhdGFUeXBlcygpLCBNZXRhY2FyZERlZmluaXRpb25zXSlcblxuICBjb25zdCBzb3J0ZWRWYWx1ZXMgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gZ2VuZXJhdGVTb3J0ZWRWYWx1ZXMoeyBkYXRhVHlwZXNDb25maWd1cmF0aW9uIH0pXG4gIH0sIFtkYXRhVHlwZXNDb25maWd1cmF0aW9uXSlcblxuICBjb25zdCBncm91cHNUb1ZhbHVlcyA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBnZW5lcmF0ZUdyb3Vwc1RvVmFsdWVzKHsgZGF0YVR5cGVzQ29uZmlndXJhdGlvbiB9KVxuICB9LCBbZGF0YVR5cGVzQ29uZmlndXJhdGlvbl0pXG5cbiAgY29uc3Qga25vd25Hcm91cHMgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gZ2VuZXJhdGVLbm93bkdyb3Vwcyh7IGRhdGFUeXBlc0NvbmZpZ3VyYXRpb24gfSlcbiAgfSwgW2RhdGFUeXBlc0NvbmZpZ3VyYXRpb25dKVxuXG4gIHJldHVybiB7XG4gICAgY29uZmlndXJhdGlvbjogZGF0YVR5cGVzQ29uZmlndXJhdGlvbixcbiAgICBzb3J0ZWRWYWx1ZXMsXG4gICAgZ3JvdXBzVG9WYWx1ZXMsXG4gICAga25vd25Hcm91cHMsXG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTaGFwZSh7XG4gIHZhbHVlLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgdmFsdWU6IEJhc2ljRGF0YXR5cGVGaWx0ZXJbJ3ZhbHVlJ11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclsndmFsdWUnXSkgPT4gdm9pZFxufSkge1xuICBpZiAoIWhhc1ZhbGlkU2hhcGUoeyB2YWx1ZSB9KSkge1xuICAgIG9uQ2hhbmdlKFtdKVxuICB9XG59XG5cbmZ1bmN0aW9uIGhhc1ZhbGlkU2hhcGUoe1xuICB2YWx1ZSxcbn06IHtcbiAgdmFsdWU6IEJhc2ljRGF0YXR5cGVGaWx0ZXJbJ3ZhbHVlJ11cbn0pOiBib29sZWFuIHtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHZhbHVlLmZpbmQoKHN1YnZhbHVlKSA9PiB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygc3VidmFsdWUgIT09ICdzdHJpbmcnXG4gICAgICB9KSA9PT0gdW5kZWZpbmVkXG4gICAgKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEljb25Gb3JWYWx1ZSh7XG4gIHZhbHVlLFxuICBjb25maWd1cmF0aW9uLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIGNvbmZpZ3VyYXRpb246IFJldHVyblR5cGU8dHlwZW9mIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24+XG59KSB7XG4gIHJldHVybiAoXG4gICAgY29uZmlndXJhdGlvbi52YWx1ZU1hcFt2YWx1ZV0/Lmljb25Db25maWc/LmNsYXNzIHx8XG4gICAgY29uZmlndXJhdGlvbi5ncm91cE1hcC5ncm91cHNbdmFsdWVdPy5pY29uQ29uZmlnPy5jbGFzc1xuICApXG59XG5cbmV4cG9ydCBjb25zdCBSZXNlcnZlZEJhc2ljRGF0YXR5cGUgPSAoe1xuICB2YWx1ZSA9IFtdLFxuICBvbkNoYW5nZSxcbn06IHtcbiAgdmFsdWU6IEJhc2ljRGF0YXR5cGVGaWx0ZXJbJ3ZhbHVlJ11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogQmFzaWNEYXRhdHlwZUZpbHRlclsndmFsdWUnXSkgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBkYXRhdHlwZXNDb25maWd1cmF0aW9uID0gdXNlRGF0YVR5cGVzQ29uZmlndXJhdGlvbigpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdmFsaWRhdGVTaGFwZSh7IHZhbHVlLCBvbkNoYW5nZSB9KVxuICB9LCBbXSlcblxuICBpZiAoIWhhc1ZhbGlkU2hhcGUoeyB2YWx1ZSB9KSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8QXV0b2NvbXBsZXRlXG4gICAgICBmdWxsV2lkdGhcbiAgICAgIG11bHRpcGxlXG4gICAgICBvcHRpb25zPXtkYXRhdHlwZXNDb25maWd1cmF0aW9uLnNvcnRlZFZhbHVlc31cbiAgICAgIGRpc2FibGVDbG9zZU9uU2VsZWN0XG4gICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4gb3B0aW9uLmxhYmVsfVxuICAgICAgaXNPcHRpb25FcXVhbFRvVmFsdWU9eyhvcHRpb24sIHZhbHVlKSA9PiBvcHRpb24udmFsdWUgPT09IHZhbHVlLnZhbHVlfVxuICAgICAgb25DaGFuZ2U9eyhfZSwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgLy8gc2hvdWxkIHRlY2huaWNhbGx5IG9ubHkgZXZlciBiZSBvbmUgdmFsdWUsIHNpbmNlIHdlIGZpbHRlciB0aGVzZSBvdXQgYXQgdGhlIGVuZFxuICAgICAgICBjb25zdCBpbmNsdWRlZEdyb3VwID0gbmV3VmFsdWUuZmluZCgodmFsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24ua25vd25Hcm91cHMuaW5jbHVkZXModmFsLnZhbHVlKVxuICAgICAgICB9KT8udmFsdWVcblxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgd2UgbmVlZCB0byBkZXNlbGVjdCBvciBzZWxlY3QgYWxsIHZhbHVlcyBpbiBhIGdyb3VwXG4gICAgICAgIGlmIChpbmNsdWRlZEdyb3VwKSB7XG4gICAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGV2ZXJ5dGhpbmcgaW4gYSBncm91cCBpcyBzZWxlY3RlZFxuICAgICAgICAgIGNvbnN0IGdyb3VwVmFsdWVzID1cbiAgICAgICAgICAgIGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24uZ3JvdXBzVG9WYWx1ZXNbaW5jbHVkZWRHcm91cF1cbiAgICAgICAgICBjb25zdCBpc0dyb3VwU2VsZWN0ZWQgPSBncm91cFZhbHVlcy5ldmVyeSgodmFsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuaW5jbHVkZXModmFsKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgaWYgKGlzR3JvdXBTZWxlY3RlZCkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBuZXdWYWx1ZS5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gIWdyb3VwVmFsdWVzLmluY2x1ZGVzKHZhbC52YWx1ZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzLmZvckVhY2goKHZhbCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoIW5ld1ZhbHVlLmZpbmQoKHZhbHVlKSA9PiB2YWx1ZS52YWx1ZSA9PT0gdmFsKSkge1xuICAgICAgICAgICAgICAgIG5ld1ZhbHVlLnB1c2goeyBsYWJlbDogdmFsLCB2YWx1ZTogdmFsIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGFueSBncm91cHMsIGFzIHdlIGRvbid0IGFjdHVhbGx5IHdhbnQgdGhlc2UgaW4gdGhlIHZhbHVlIG9yIHdlIGNhbid0IHJlbW92ZSBvdGhlciBjaGlwcyBpbiB0aGF0IGNhdGVnb3J5IG9uY2UgaXQgZ2V0cyBhZGRlZFxuICAgICAgICBuZXdWYWx1ZSA9IG5ld1ZhbHVlLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICFkYXRhdHlwZXNDb25maWd1cmF0aW9uLmtub3duR3JvdXBzLmluY2x1ZGVzKHZhbC52YWx1ZSlcbiAgICAgICAgfSlcbiAgICAgICAgb25DaGFuZ2UobmV3VmFsdWUubWFwKCh2YWwpID0+IHZhbC52YWx1ZSkpXG4gICAgICB9fVxuICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgIHJlbmRlck9wdGlvbj17KHByb3BzLCBvcHRpb24pID0+IHtcbiAgICAgICAgY29uc3QgaXNHcm91cCA9IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24ua25vd25Hcm91cHMuaW5jbHVkZXMoXG4gICAgICAgICAgb3B0aW9uLnZhbHVlXG4gICAgICAgIClcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGlmIGV2ZXJ5dGhpbmcgaW4gYSBncm91cCBpcyBzZWxlY3RlZFxuICAgICAgICBjb25zdCBpc0dyb3VwU2VsZWN0ZWQgPSBpc0dyb3VwXG4gICAgICAgICAgPyBkYXRhdHlwZXNDb25maWd1cmF0aW9uLmdyb3Vwc1RvVmFsdWVzW29wdGlvbi52YWx1ZV0uZXZlcnkoKHZhbCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuaW5jbHVkZXModmFsKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IGZhbHNlXG4gICAgICAgIC8vIGRldGVybWluZSBpZiBhbnl0aGluZyBpbiBhIGdyb3VwIGlzIHNlbGVjdGVkIGJ1dCBub3QgZXZlcnl0aGluZ1xuICAgICAgICBjb25zdCBpc0dyb3VwUGFydGlhbGx5U2VsZWN0ZWQgPVxuICAgICAgICAgIGlzR3JvdXAgJiYgIWlzR3JvdXBTZWxlY3RlZFxuICAgICAgICAgICAgPyBkYXRhdHlwZXNDb25maWd1cmF0aW9uLmdyb3Vwc1RvVmFsdWVzW29wdGlvbi52YWx1ZV0uc29tZShcbiAgICAgICAgICAgICAgICAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuaW5jbHVkZXModmFsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgOiBmYWxzZVxuXG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBwcm9wc1snYXJpYS1zZWxlY3RlZCddIHx8IGlzR3JvdXBTZWxlY3RlZFxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpXG4gICAgICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake3Byb3BzLmNsYXNzTmFtZX0gJHtpc0dyb3VwID8gJyFwbC0yJyA6ICchcGwtOCd9ICR7XG4gICAgICAgICAgICAgIGlzR3JvdXBTZWxlY3RlZCA/ICcnIDogJydcbiAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17aXNTZWxlY3RlZH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7aXNHcm91cCA/IDw+PC8+IDogPFN3YXRoIGNsYXNzTmFtZT1cInctMSBoLTZcIiAvPn1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtMlwiPlxuICAgICAgICAgICAgICB7aXNHcm91cCA/IChcbiAgICAgICAgICAgICAgICBpc0dyb3VwU2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICAgICAgICA8Q2hlY2tCb3hJY29uIC8+XG4gICAgICAgICAgICAgICAgKSA6IGlzR3JvdXBQYXJ0aWFsbHlTZWxlY3RlZCA/IChcbiAgICAgICAgICAgICAgICAgIDxJbmRldGVybWluYXRlQ2hlY2tCb3hJY29uIC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxDaGVja0JveE91dGxpbmVCbGFua0ljb24gLz5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBpc1NlbGVjdGVkID8gKFxuICAgICAgICAgICAgICAgIDxDaGVja0JveEljb24gLz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8Q2hlY2tCb3hPdXRsaW5lQmxhbmtJY29uIC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcHItMiBpY29uICR7Z2V0SWNvbkZvclZhbHVlKHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9uLnZhbHVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IGRhdGF0eXBlc0NvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgfSl9YH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LVszcHhdXCI+IHtvcHRpb24ubGFiZWx9PC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfX1cbiAgICAgIHJlbmRlclRhZ3M9eyh0YWdWYWx1ZSwgZ2V0VGFnUHJvcHMpID0+XG4gICAgICAgIHRhZ1ZhbHVlLm1hcCgob3B0aW9uLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxDaGlwXG4gICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgY29sb3I9XCJkZWZhdWx0XCJcbiAgICAgICAgICAgIGxhYmVsPXtcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bwci0yIGljb24gJHtnZXRJY29uRm9yVmFsdWUoe1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9uLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uOiBkYXRhdHlwZXNDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgICB9KX1gfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAge29wdGlvbi5sYWJlbH1cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB7Li4uZ2V0VGFnUHJvcHMoeyBpbmRleCB9KX1cbiAgICAgICAgICAvPlxuICAgICAgICApKVxuICAgICAgfVxuICAgICAgdmFsdWU9e3ZhbHVlLm1hcCgodmFsKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbGFiZWw6IHZhbCxcbiAgICAgICAgICB2YWx1ZTogdmFsLFxuICAgICAgICB9XG4gICAgICB9KX1cbiAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IHZhcmlhbnQ9XCJvdXRsaW5lZFwiIC8+fVxuICAgIC8+XG4gIClcbn1cbiJdfQ==