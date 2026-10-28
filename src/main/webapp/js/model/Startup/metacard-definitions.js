import { __assign, __extends, __read, __spreadArray } from "tslib";
import { BasicDataTypePropertyName } from '../../../component/filter-builder/reserved.properties';
import { Overridable, Subscribable } from '../Base/base-classes';
export var OverridableExtensionPointExtraFiltersAttributeMap = new Overridable({});
function sortMetacardTypes(metacardTypes) {
    if (metacardTypes === void 0) { metacardTypes = {}; }
    return Object.values(metacardTypes).sort(function (a, b) {
        var attrToCompareA = (a.alias || a.id).toLowerCase();
        var attrToCompareB = (b.alias || b.id).toLowerCase();
        if (attrToCompareA < attrToCompareB) {
            return -1;
        }
        if (attrToCompareA > attrToCompareB) {
            return 1;
        }
        return 0;
    });
}
var MetacardDefinitions = /** @class */ (function (_super) {
    __extends(MetacardDefinitions, _super);
    function MetacardDefinitions(startupData) {
        var _this = _super.call(this) || this;
        _this.extensionPointExtraFiltersAttributeMap = OverridableExtensionPointExtraFiltersAttributeMap.get();
        // each time a search is conducted, this is possible, as searches return types
        _this.addDynamicallyFoundMetacardDefinitionsFromSearchResults = function (definitions) {
            var unknownMetacardTypes = Object.keys(definitions).filter(_this.isUnknownMetacardType);
            if (unknownMetacardTypes.length === 0) {
                // don't do unnecessary work
                return;
            }
            var transformedDefinitions = Object.entries(definitions).reduce(function (blob, entry) {
                var _a = __read(entry, 2), key = _a[0], value = _a[1];
                blob[key] = Object.entries(value).reduce(function (innerBlob, innerEntry) {
                    var _a = __read(innerEntry, 2), innerKey = _a[0], innerValue = _a[1];
                    innerBlob[innerKey] = {
                        id: innerKey,
                        type: innerValue.format,
                        multivalued: innerValue.multivalued,
                        isInjected: false, // not sure we need this
                    };
                    return innerBlob;
                }, {});
                return blob;
            }, {});
            _this.addDynamicallyFoundMetacardDefinitions(transformedDefinitions);
        };
        _this.addDynamicallyFoundMetacardDefinitions = function (definitions) {
            var unknownMetacardTypes = Object.keys(definitions).filter(_this.isUnknownMetacardType);
            unknownMetacardTypes.forEach(function (type) {
                _this.addUnknownMetacardType({
                    name: type,
                    definition: definitions[type],
                });
            });
            var unknownAttributes = unknownMetacardTypes.reduce(function (blob, definitionName) {
                var mapOfUnknownAttributeDefinitionsFromUnknownType = Object.keys(definitions[definitionName])
                    .filter(_this.isUnknownAttribute)
                    .reduce(function (innerBlob, attributeName) {
                    innerBlob[attributeName] =
                        definitions[definitionName][attributeName];
                    return innerBlob;
                }, {});
                Object.assign(blob, mapOfUnknownAttributeDefinitionsFromUnknownType);
                return blob;
            }, {});
            _this.addUnknownAttributes(unknownAttributes);
            if (Object.keys(unknownAttributes).length > 0) {
                _this.resortKnownMetacardAttributes();
            }
        };
        _this.addUnknownMetacardType = function (_a) {
            var name = _a.name, definition = _a.definition;
            if (_this.metacardTypes) {
                _this.metacardTypes[name] = definition;
            }
        };
        _this.addUnknownAttributes = function (definition) {
            if (_this.attributeMap) {
                Object.entries(definition)
                    .filter(function (entry) { return _this.isUnknownAttribute(entry[0]); })
                    .forEach(function (entry) {
                    _this.addUnknownAttribute({
                        attributeName: entry[0],
                        attributeDefinition: entry[1],
                    });
                });
            }
        };
        _this.addUnknownAttribute = function (_a) {
            var attributeDefinition = _a.attributeDefinition, attributeName = _a.attributeName;
            if (_this.attributeMap) {
                _this.attributeMap[attributeName] = attributeDefinition;
            }
        };
        _this.isUnknownAttribute = function (attributeName) {
            if (_this.attributeMap) {
                return _this.attributeMap[attributeName] === undefined;
            }
            return true;
        };
        _this.isUnknownMetacardType = function (metacardType) {
            if (_this.metacardTypes) {
                return _this.metacardTypes[metacardType] === undefined;
            }
            return true;
        };
        _this.resortKnownMetacardAttributes = function () {
            _this.sortedAttributes = sortMetacardTypes(_this.attributeMap);
            _this._notifySubscribers({ thing: 'metacard-definitions-update' });
        };
        _this.isHiddenAttribute = function (id) {
            if (!_this.attributeMap) {
                return false;
            }
            return (_this.attributeMap[id] === undefined ||
                _this.attributeMap[id].hidden === true);
        };
        _this.getMetacardDefinition = function (metacardTypeName) {
            var _a;
            return ((_a = _this.metacardTypes) === null || _a === void 0 ? void 0 : _a[metacardTypeName]) || {};
        };
        _this.getRequired = function (metacardTypeName, attributeName) {
            var _a, _b, _c;
            return (((_c = (_b = (_a = _this.metacardTypes) === null || _a === void 0 ? void 0 : _a[metacardTypeName]) === null || _b === void 0 ? void 0 : _b[attributeName]) === null || _c === void 0 ? void 0 : _c.required) || false);
        };
        _this.getAlias = function (attributeName) {
            var _a, _b;
            return ((_b = (_a = _this.attributeMap) === null || _a === void 0 ? void 0 : _a[attributeName]) === null || _b === void 0 ? void 0 : _b.alias) || attributeName;
        };
        _this.getType = function (attributeName) {
            var _a, _b;
            return ((_b = (_a = _this.attributeMap) === null || _a === void 0 ? void 0 : _a[attributeName]) === null || _b === void 0 ? void 0 : _b.type) || 'STRING';
        };
        _this.isMulti = function (attributeName) {
            var _a, _b;
            return ((_b = (_a = _this.attributeMap) === null || _a === void 0 ? void 0 : _a[attributeName]) === null || _b === void 0 ? void 0 : _b.multivalued) || false;
        };
        _this.getEnum = function (attributeName) {
            var _a, _b;
            return ((_b = (_a = _this.attributeMap) === null || _a === void 0 ? void 0 : _a[attributeName]) === null || _b === void 0 ? void 0 : _b.enumerations) || [];
        };
        _this.getSearchOnlyAttributes = function () {
            return __spreadArray([
                'anyText',
                'anyGeo',
                'anyDate',
                BasicDataTypePropertyName
            ], __read(Object.keys(_this.extensionPointExtraFiltersAttributeMap)), false);
        };
        _this.getSortedAttributes = function () {
            return _this.sortedAttributes || [];
        };
        _this.getAttributeMap = function () {
            return _this.attributeMap || {};
        };
        _this.getAttributeDefinition = function (id) {
            var _a;
            return (_a = _this.attributeMap) === null || _a === void 0 ? void 0 : _a[id];
        };
        startupData === null || startupData === void 0 ? void 0 : startupData.subscribeTo({
            subscribableThing: 'fetched',
            callback: function (startupPayload) {
                // startupPayload overrides extension points on clash
                _this.attributeMap = __assign(__assign({}, _this.extensionPointExtraFiltersAttributeMap), startupPayload.attributeMap);
                _this.sortedAttributes = startupPayload.sortedAttributes;
                _this.metacardTypes = startupPayload.metacardTypes;
                _this._notifySubscribers({ thing: 'metacard-definitions-update' });
            },
        });
        OverridableExtensionPointExtraFiltersAttributeMap.subscribeTo({
            subscribableThing: 'override',
            callback: function (extensionPointExtraFiltersAttributeMap) {
                _this.extensionPointExtraFiltersAttributeMap =
                    extensionPointExtraFiltersAttributeMap;
                _this.attributeMap = __assign(__assign({}, _this.extensionPointExtraFiltersAttributeMap), _this.attributeMap);
                _this._notifySubscribers({ thing: 'metacard-definitions-update' });
            },
        });
        return _this;
    }
    return MetacardDefinitions;
}(Subscribable));
export { MetacardDefinitions };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWNhcmQtZGVmaW5pdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFBO0FBQ2pHLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFZaEUsTUFBTSxDQUFDLElBQU0saURBQWlELEdBQzVELElBQUksV0FBVyxDQUFtQixFQUFFLENBQUMsQ0FBQTtBQUV2QyxTQUFTLGlCQUFpQixDQUFDLGFBQW9DO0lBQXBDLDhCQUFBLEVBQUEsa0JBQW9DO0lBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxJQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3RELElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDdEQsSUFBSSxjQUFjLEdBQUcsY0FBYyxFQUFFLENBQUM7WUFDcEMsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUNYLENBQUM7UUFDRCxJQUFJLGNBQWMsR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUNwQyxPQUFPLENBQUMsQ0FBQTtRQUNWLENBQUM7UUFDRCxPQUFPLENBQUMsQ0FBQTtJQUNWLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVEO0lBQWtDLHVDQUVoQztJQU1BLDZCQUFZLFdBQXlCO1FBQ25DLFlBQUEsTUFBSyxXQUFFLFNBQUE7UUFIVCw0Q0FB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QVcsdUJBQVgsV0FBVyxDQUFFLFdBQVcsQ0FBQztZQUN2QixpQkFBaUIsRUFBRSxTQUFTO1lBQzVCLFFBQVEsRUFBRSxVQUFDLGNBQWM7Z0JBQ3ZCLHFEQUFxRDtnQkFDckQsS0FBSSxDQUFDLFlBQVkseUJBQ1osS0FBSSxDQUFDLHNDQUFzQyxHQUMzQyxjQUFjLENBQUMsWUFBWSxDQUMvQixDQUFBO2dCQUNELEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUE7Z0JBQ3ZELEtBQUksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQTtnQkFDakQsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsS0FBSyxFQUFFLDZCQUE2QixFQUFFLENBQUMsQ0FBQTtZQUNuRSxDQUFDO1NBQ0YsQ0FBQyxDQUFBO1FBQ0YsaURBQWlELENBQUMsV0FBVyxDQUFDO1lBQzVELGlCQUFpQixFQUFFLFVBQVU7WUFDN0IsUUFBUSxFQUFFLFVBQUMsc0NBQXNDO2dCQUMvQyxLQUFJLENBQUMsc0NBQXNDO29CQUN6QyxzQ0FBc0MsQ0FBQTtnQkFDeEMsS0FBSSxDQUFDLFlBQVkseUJBQ1osS0FBSSxDQUFDLHNDQUFzQyxHQUMzQyxLQUFJLENBQUMsWUFBWSxDQUNyQixDQUFBO2dCQUNELEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEtBQUssRUFBRSw2QkFBNkIsRUFBRSxDQUFDLENBQUE7WUFDbkUsQ0FBQztTQUNGLENBQUMsQ0FBQTs7SUFDSixDQUFDO0lBb0tILDBCQUFDO0FBQUQsQ0FBQyxBQXZNRCxDQUFrQyxZQUFZLEdBdU03QztBQUVELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZSB9IGZyb20gJy4uLy4uLy4uL2NvbXBvbmVudC9maWx0ZXItYnVpbGRlci9yZXNlcnZlZC5wcm9wZXJ0aWVzJ1xuaW1wb3J0IHsgT3ZlcnJpZGFibGUsIFN1YnNjcmliYWJsZSB9IGZyb20gJy4uL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGEgfSBmcm9tICcuL3N0YXJ0dXAnXG5pbXBvcnQge1xuICBBdHRyaWJ1dGVEZWZpbml0aW9uVHlwZSxcbiAgQXR0cmlidXRlTWFwVHlwZSxcbiAgTWV0YWNhcmREZWZpbml0aW9uVHlwZSxcbiAgTWV0YWNhcmREZWZpbml0aW9uc1R5cGUsXG4gIFNlYXJjaFJlc3VsdEF0dHJpYnV0ZURlZmluaXRpb25UeXBlLFxuICBTZWFyY2hSZXN1bHRNZXRhY2FyZERlZmluaXRpb25UeXBlLFxuICBTdGFydHVwUGF5bG9hZFR5cGUsXG59IGZyb20gJy4vc3RhcnR1cC50eXBlcydcblxuZXhwb3J0IGNvbnN0IE92ZXJyaWRhYmxlRXh0ZW5zaW9uUG9pbnRFeHRyYUZpbHRlcnNBdHRyaWJ1dGVNYXAgPVxuICBuZXcgT3ZlcnJpZGFibGU8QXR0cmlidXRlTWFwVHlwZT4oe30pXG5cbmZ1bmN0aW9uIHNvcnRNZXRhY2FyZFR5cGVzKG1ldGFjYXJkVHlwZXM6IEF0dHJpYnV0ZU1hcFR5cGUgPSB7fSkge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhtZXRhY2FyZFR5cGVzKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgY29uc3QgYXR0clRvQ29tcGFyZUEgPSAoYS5hbGlhcyB8fCBhLmlkKS50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgYXR0clRvQ29tcGFyZUIgPSAoYi5hbGlhcyB8fCBiLmlkKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGF0dHJUb0NvbXBhcmVBIDwgYXR0clRvQ29tcGFyZUIpIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICBpZiAoYXR0clRvQ29tcGFyZUEgPiBhdHRyVG9Db21wYXJlQikge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuY2xhc3MgTWV0YWNhcmREZWZpbml0aW9ucyBleHRlbmRzIFN1YnNjcmliYWJsZTx7XG4gIHRoaW5nOiAnbWV0YWNhcmQtZGVmaW5pdGlvbnMtdXBkYXRlJ1xufT4ge1xuICBhdHRyaWJ1dGVNYXA/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ2F0dHJpYnV0ZU1hcCddXG4gIHNvcnRlZEF0dHJpYnV0ZXM/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ3NvcnRlZEF0dHJpYnV0ZXMnXVxuICBtZXRhY2FyZFR5cGVzPzogU3RhcnR1cFBheWxvYWRUeXBlWydtZXRhY2FyZFR5cGVzJ11cbiAgZXh0ZW5zaW9uUG9pbnRFeHRyYUZpbHRlcnNBdHRyaWJ1dGVNYXA6IEF0dHJpYnV0ZU1hcFR5cGUgPVxuICAgIE92ZXJyaWRhYmxlRXh0ZW5zaW9uUG9pbnRFeHRyYUZpbHRlcnNBdHRyaWJ1dGVNYXAuZ2V0KClcbiAgY29uc3RydWN0b3Ioc3RhcnR1cERhdGE/OiBTdGFydHVwRGF0YSkge1xuICAgIHN1cGVyKClcbiAgICBzdGFydHVwRGF0YT8uc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmZXRjaGVkJyxcbiAgICAgIGNhbGxiYWNrOiAoc3RhcnR1cFBheWxvYWQpID0+IHtcbiAgICAgICAgLy8gc3RhcnR1cFBheWxvYWQgb3ZlcnJpZGVzIGV4dGVuc2lvbiBwb2ludHMgb24gY2xhc2hcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7XG4gICAgICAgICAgLi4udGhpcy5leHRlbnNpb25Qb2ludEV4dHJhRmlsdGVyc0F0dHJpYnV0ZU1hcCxcbiAgICAgICAgICAuLi5zdGFydHVwUGF5bG9hZC5hdHRyaWJ1dGVNYXAsXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zb3J0ZWRBdHRyaWJ1dGVzID0gc3RhcnR1cFBheWxvYWQuc29ydGVkQXR0cmlidXRlc1xuICAgICAgICB0aGlzLm1ldGFjYXJkVHlwZXMgPSBzdGFydHVwUGF5bG9hZC5tZXRhY2FyZFR5cGVzXG4gICAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdtZXRhY2FyZC1kZWZpbml0aW9ucy11cGRhdGUnIH0pXG4gICAgICB9LFxuICAgIH0pXG4gICAgT3ZlcnJpZGFibGVFeHRlbnNpb25Qb2ludEV4dHJhRmlsdGVyc0F0dHJpYnV0ZU1hcC5zdWJzY3JpYmVUbyh7XG4gICAgICBzdWJzY3JpYmFibGVUaGluZzogJ292ZXJyaWRlJyxcbiAgICAgIGNhbGxiYWNrOiAoZXh0ZW5zaW9uUG9pbnRFeHRyYUZpbHRlcnNBdHRyaWJ1dGVNYXApID0+IHtcbiAgICAgICAgdGhpcy5leHRlbnNpb25Qb2ludEV4dHJhRmlsdGVyc0F0dHJpYnV0ZU1hcCA9XG4gICAgICAgICAgZXh0ZW5zaW9uUG9pbnRFeHRyYUZpbHRlcnNBdHRyaWJ1dGVNYXBcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSB7XG4gICAgICAgICAgLi4udGhpcy5leHRlbnNpb25Qb2ludEV4dHJhRmlsdGVyc0F0dHJpYnV0ZU1hcCxcbiAgICAgICAgICAuLi50aGlzLmF0dHJpYnV0ZU1hcCxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnbWV0YWNhcmQtZGVmaW5pdGlvbnMtdXBkYXRlJyB9KVxuICAgICAgfSxcbiAgICB9KVxuICB9XG4gIC8vIGVhY2ggdGltZSBhIHNlYXJjaCBpcyBjb25kdWN0ZWQsIHRoaXMgaXMgcG9zc2libGUsIGFzIHNlYXJjaGVzIHJldHVybiB0eXBlc1xuICBhZGREeW5hbWljYWxseUZvdW5kTWV0YWNhcmREZWZpbml0aW9uc0Zyb21TZWFyY2hSZXN1bHRzID0gKFxuICAgIGRlZmluaXRpb25zOiBTZWFyY2hSZXN1bHRNZXRhY2FyZERlZmluaXRpb25UeXBlXG4gICkgPT4ge1xuICAgIGNvbnN0IHVua25vd25NZXRhY2FyZFR5cGVzID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgIHRoaXMuaXNVbmtub3duTWV0YWNhcmRUeXBlXG4gICAgKVxuICAgIGlmICh1bmtub3duTWV0YWNhcmRUeXBlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIGRvbid0IGRvIHVubmVjZXNzYXJ5IHdvcmtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB0cmFuc2Zvcm1lZERlZmluaXRpb25zID0gT2JqZWN0LmVudHJpZXMoZGVmaW5pdGlvbnMpLnJlZHVjZShcbiAgICAgIChibG9iLCBlbnRyeSkgPT4ge1xuICAgICAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBlbnRyeVxuICAgICAgICBibG9iW2tleV0gPSBPYmplY3QuZW50cmllcyh2YWx1ZSkucmVkdWNlKChpbm5lckJsb2IsIGlubmVyRW50cnkpID0+IHtcbiAgICAgICAgICBjb25zdCBbaW5uZXJLZXksIGlubmVyVmFsdWVdID0gaW5uZXJFbnRyeSBhcyB1bmtub3duIGFzIFtcbiAgICAgICAgICAgIHN0cmluZyxcbiAgICAgICAgICAgIFNlYXJjaFJlc3VsdEF0dHJpYnV0ZURlZmluaXRpb25UeXBlXG4gICAgICAgICAgXVxuICAgICAgICAgIGlubmVyQmxvYltpbm5lcktleV0gPSB7XG4gICAgICAgICAgICBpZDogaW5uZXJLZXksXG4gICAgICAgICAgICB0eXBlOiBpbm5lclZhbHVlLmZvcm1hdCxcbiAgICAgICAgICAgIG11bHRpdmFsdWVkOiBpbm5lclZhbHVlLm11bHRpdmFsdWVkLFxuICAgICAgICAgICAgaXNJbmplY3RlZDogZmFsc2UsIC8vIG5vdCBzdXJlIHdlIG5lZWQgdGhpc1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaW5uZXJCbG9iXG4gICAgICAgIH0sIHt9IGFzIEF0dHJpYnV0ZU1hcFR5cGUpXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAge30gYXMgTWV0YWNhcmREZWZpbml0aW9uc1R5cGVcbiAgICApXG4gICAgdGhpcy5hZGREeW5hbWljYWxseUZvdW5kTWV0YWNhcmREZWZpbml0aW9ucyh0cmFuc2Zvcm1lZERlZmluaXRpb25zKVxuICB9XG4gIGFkZER5bmFtaWNhbGx5Rm91bmRNZXRhY2FyZERlZmluaXRpb25zID0gKFxuICAgIGRlZmluaXRpb25zOiBNZXRhY2FyZERlZmluaXRpb25zVHlwZVxuICApID0+IHtcbiAgICBjb25zdCB1bmtub3duTWV0YWNhcmRUeXBlcyA9IE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICB0aGlzLmlzVW5rbm93bk1ldGFjYXJkVHlwZVxuICAgIClcbiAgICB1bmtub3duTWV0YWNhcmRUeXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICB0aGlzLmFkZFVua25vd25NZXRhY2FyZFR5cGUoe1xuICAgICAgICBuYW1lOiB0eXBlLFxuICAgICAgICBkZWZpbml0aW9uOiBkZWZpbml0aW9uc1t0eXBlXSxcbiAgICAgIH0pXG4gICAgfSlcbiAgICBjb25zdCB1bmtub3duQXR0cmlidXRlcyA9IHVua25vd25NZXRhY2FyZFR5cGVzLnJlZHVjZShcbiAgICAgIChibG9iLCBkZWZpbml0aW9uTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBtYXBPZlVua25vd25BdHRyaWJ1dGVEZWZpbml0aW9uc0Zyb21Vbmtub3duVHlwZSA9IE9iamVjdC5rZXlzKFxuICAgICAgICAgIGRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXVxuICAgICAgICApXG4gICAgICAgICAgLmZpbHRlcih0aGlzLmlzVW5rbm93bkF0dHJpYnV0ZSlcbiAgICAgICAgICAucmVkdWNlKChpbm5lckJsb2IsIGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGlubmVyQmxvYlthdHRyaWJ1dGVOYW1lXSA9XG4gICAgICAgICAgICAgIGRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXVthdHRyaWJ1dGVOYW1lXVxuICAgICAgICAgICAgcmV0dXJuIGlubmVyQmxvYlxuICAgICAgICAgIH0sIHt9IGFzIEF0dHJpYnV0ZU1hcFR5cGUpXG4gICAgICAgIE9iamVjdC5hc3NpZ24oYmxvYiwgbWFwT2ZVbmtub3duQXR0cmlidXRlRGVmaW5pdGlvbnNGcm9tVW5rbm93blR5cGUpXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LFxuICAgICAge30gYXMgQXR0cmlidXRlTWFwVHlwZVxuICAgIClcbiAgICB0aGlzLmFkZFVua25vd25BdHRyaWJ1dGVzKHVua25vd25BdHRyaWJ1dGVzKVxuICAgIGlmIChPYmplY3Qua2V5cyh1bmtub3duQXR0cmlidXRlcykubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5yZXNvcnRLbm93bk1ldGFjYXJkQXR0cmlidXRlcygpXG4gICAgfVxuICB9XG4gIGFkZFVua25vd25NZXRhY2FyZFR5cGUgPSAoe1xuICAgIG5hbWUsXG4gICAgZGVmaW5pdGlvbixcbiAgfToge1xuICAgIG5hbWU6IHN0cmluZ1xuICAgIGRlZmluaXRpb246IE1ldGFjYXJkRGVmaW5pdGlvblR5cGVcbiAgfSkgPT4ge1xuICAgIGlmICh0aGlzLm1ldGFjYXJkVHlwZXMpIHtcbiAgICAgIHRoaXMubWV0YWNhcmRUeXBlc1tuYW1lXSA9IGRlZmluaXRpb25cbiAgICB9XG4gIH1cbiAgYWRkVW5rbm93bkF0dHJpYnV0ZXMgPSAoZGVmaW5pdGlvbjogTWV0YWNhcmREZWZpbml0aW9uVHlwZSkgPT4ge1xuICAgIGlmICh0aGlzLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgT2JqZWN0LmVudHJpZXMoZGVmaW5pdGlvbilcbiAgICAgICAgLmZpbHRlcigoZW50cnkpID0+IHRoaXMuaXNVbmtub3duQXR0cmlidXRlKGVudHJ5WzBdKSlcbiAgICAgICAgLmZvckVhY2goKGVudHJ5KSA9PiB7XG4gICAgICAgICAgdGhpcy5hZGRVbmtub3duQXR0cmlidXRlKHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6IGVudHJ5WzBdLFxuICAgICAgICAgICAgYXR0cmlidXRlRGVmaW5pdGlvbjogZW50cnlbMV0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbiAgYWRkVW5rbm93bkF0dHJpYnV0ZSA9ICh7XG4gICAgYXR0cmlidXRlRGVmaW5pdGlvbixcbiAgICBhdHRyaWJ1dGVOYW1lLFxuICB9OiB7XG4gICAgYXR0cmlidXRlTmFtZTogc3RyaW5nXG4gICAgYXR0cmlidXRlRGVmaW5pdGlvbjogQXR0cmlidXRlRGVmaW5pdGlvblR5cGVcbiAgfSkgPT4ge1xuICAgIGlmICh0aGlzLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgdGhpcy5hdHRyaWJ1dGVNYXBbYXR0cmlidXRlTmFtZV0gPSBhdHRyaWJ1dGVEZWZpbml0aW9uXG4gICAgfVxuICB9XG4gIGlzVW5rbm93bkF0dHJpYnV0ZSA9IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICBpZiAodGhpcy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcFthdHRyaWJ1dGVOYW1lXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaXNVbmtub3duTWV0YWNhcmRUeXBlID0gKG1ldGFjYXJkVHlwZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKHRoaXMubWV0YWNhcmRUeXBlcykge1xuICAgICAgcmV0dXJuIHRoaXMubWV0YWNhcmRUeXBlc1ttZXRhY2FyZFR5cGVdID09PSB1bmRlZmluZWRcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXNvcnRLbm93bk1ldGFjYXJkQXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICB0aGlzLnNvcnRlZEF0dHJpYnV0ZXMgPSBzb3J0TWV0YWNhcmRUeXBlcyh0aGlzLmF0dHJpYnV0ZU1hcClcbiAgICB0aGlzLl9ub3RpZnlTdWJzY3JpYmVycyh7IHRoaW5nOiAnbWV0YWNhcmQtZGVmaW5pdGlvbnMtdXBkYXRlJyB9KVxuICB9XG4gIGlzSGlkZGVuQXR0cmlidXRlID0gKGlkOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIXRoaXMuYXR0cmlidXRlTWFwKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuYXR0cmlidXRlTWFwW2lkXSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICB0aGlzLmF0dHJpYnV0ZU1hcFtpZF0uaGlkZGVuID09PSB0cnVlXG4gICAgKVxuICB9XG4gIGdldE1ldGFjYXJkRGVmaW5pdGlvbiA9IChtZXRhY2FyZFR5cGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5tZXRhY2FyZFR5cGVzPy5bbWV0YWNhcmRUeXBlTmFtZV0gfHwge31cbiAgfVxuICBnZXRSZXF1aXJlZCA9IChtZXRhY2FyZFR5cGVOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1ldGFjYXJkVHlwZXM/LlttZXRhY2FyZFR5cGVOYW1lXT8uW2F0dHJpYnV0ZU5hbWVdPy5yZXF1aXJlZCB8fCBmYWxzZVxuICAgIClcbiAgfVxuICBnZXRBbGlhcyA9IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXA/LlthdHRyaWJ1dGVOYW1lXT8uYWxpYXMgfHwgYXR0cmlidXRlTmFtZVxuICB9XG4gIGdldFR5cGUgPSAoYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwPy5bYXR0cmlidXRlTmFtZV0/LnR5cGUgfHwgJ1NUUklORydcbiAgfVxuICBpc011bHRpID0gKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2F0dHJpYnV0ZU5hbWVdPy5tdWx0aXZhbHVlZCB8fCBmYWxzZVxuICB9XG4gIGdldEVudW0gPSAoYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwPy5bYXR0cmlidXRlTmFtZV0/LmVudW1lcmF0aW9ucyB8fCBbXVxuICB9XG4gIGdldFNlYXJjaE9ubHlBdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICAnYW55VGV4dCcsXG4gICAgICAnYW55R2VvJyxcbiAgICAgICdhbnlEYXRlJyxcbiAgICAgIEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWUsXG4gICAgICAuLi5PYmplY3Qua2V5cyh0aGlzLmV4dGVuc2lvblBvaW50RXh0cmFGaWx0ZXJzQXR0cmlidXRlTWFwKSxcbiAgICBdXG4gIH1cbiAgZ2V0U29ydGVkQXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5zb3J0ZWRBdHRyaWJ1dGVzIHx8IFtdXG4gIH1cbiAgZ2V0QXR0cmlidXRlTWFwID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcCB8fCB7fVxuICB9XG4gIGdldEF0dHJpYnV0ZURlZmluaXRpb24gPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2lkXVxuICB9XG59XG5cbmV4cG9ydCB7IE1ldGFjYXJkRGVmaW5pdGlvbnMgfVxuIl19