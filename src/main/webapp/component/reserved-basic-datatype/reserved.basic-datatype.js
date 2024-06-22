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
//# sourceMappingURL=reserved.basic-datatype.js.map