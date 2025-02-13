import { __extends, __read } from "tslib";
import { BasicDataTypePropertyName } from '../../../component/filter-builder/reserved.properties';
import { Subscribable } from '../Base/base-classes';
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
            return ['anyText', 'anyGeo', 'anyDate', BasicDataTypePropertyName];
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
                _this.attributeMap = startupPayload.attributeMap;
                _this.sortedAttributes = startupPayload.sortedAttributes;
                _this.metacardTypes = startupPayload.metacardTypes;
                _this._notifySubscribers({ thing: 'metacard-definitions-update' });
            },
        });
        return _this;
    }
    return MetacardDefinitions;
}(Subscribable));
export { MetacardDefinitions };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWNhcmQtZGVmaW5pdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFBO0FBQ2pHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQVluRCxTQUFTLGlCQUFpQixDQUFDLGFBQW9DO0lBQXBDLDhCQUFBLEVBQUEsa0JBQW9DO0lBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxJQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3RELElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDdEQsSUFBSSxjQUFjLEdBQUcsY0FBYyxFQUFFO1lBQ25DLE9BQU8sQ0FBQyxDQUFDLENBQUE7U0FDVjtRQUNELElBQUksY0FBYyxHQUFHLGNBQWMsRUFBRTtZQUNuQyxPQUFPLENBQUMsQ0FBQTtTQUNUO1FBQ0QsT0FBTyxDQUFDLENBQUE7SUFDVixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRDtJQUFrQyx1Q0FFaEM7SUFJQSw2QkFBWSxXQUF5QjtRQUFyQyxZQUNFLGlCQUFPLFNBVVI7UUFDRCw4RUFBOEU7UUFDOUUsNkRBQXVELEdBQUcsVUFDeEQsV0FBK0M7WUFFL0MsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FD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QUE2QixFQUFFLENBQUMsQ0FBQTtZQUNuRSxDQUFDO1NBQ0YsQ0FBQyxDQUFBOztJQUNKLENBQUM7SUE4SkgsMEJBQUM7QUFBRCxDQUFDLEFBL0tELENBQWtDLFlBQVksR0ErSzdDO0FBRUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCYXNpY0RhdGFUeXBlUHJvcGVydHlOYW1lIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL3Jlc2VydmVkLnByb3BlcnRpZXMnXG5pbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuLi9CYXNlL2Jhc2UtY2xhc3NlcydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhIH0gZnJvbSAnLi9zdGFydHVwJ1xuaW1wb3J0IHtcbiAgQXR0cmlidXRlRGVmaW5pdGlvblR5cGUsXG4gIEF0dHJpYnV0ZU1hcFR5cGUsXG4gIE1ldGFjYXJkRGVmaW5pdGlvblR5cGUsXG4gIE1ldGFjYXJkRGVmaW5pdGlvbnNUeXBlLFxuICBTZWFyY2hSZXN1bHRBdHRyaWJ1dGVEZWZpbml0aW9uVHlwZSxcbiAgU2VhcmNoUmVzdWx0TWV0YWNhcmREZWZpbml0aW9uVHlwZSxcbiAgU3RhcnR1cFBheWxvYWRUeXBlLFxufSBmcm9tICcuL3N0YXJ0dXAudHlwZXMnXG5cbmZ1bmN0aW9uIHNvcnRNZXRhY2FyZFR5cGVzKG1ldGFjYXJkVHlwZXM6IEF0dHJpYnV0ZU1hcFR5cGUgPSB7fSkge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhtZXRhY2FyZFR5cGVzKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgY29uc3QgYXR0clRvQ29tcGFyZUEgPSAoYS5hbGlhcyB8fCBhLmlkKS50b0xvd2VyQ2FzZSgpXG4gICAgY29uc3QgYXR0clRvQ29tcGFyZUIgPSAoYi5hbGlhcyB8fCBiLmlkKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGF0dHJUb0NvbXBhcmVBIDwgYXR0clRvQ29tcGFyZUIpIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICBpZiAoYXR0clRvQ29tcGFyZUEgPiBhdHRyVG9Db21wYXJlQikge1xuICAgICAgcmV0dXJuIDFcbiAgICB9XG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuY2xhc3MgTWV0YWNhcmREZWZpbml0aW9ucyBleHRlbmRzIFN1YnNjcmliYWJsZTx7XG4gIHRoaW5nOiAnbWV0YWNhcmQtZGVmaW5pdGlvbnMtdXBkYXRlJ1xufT4ge1xuICBhdHRyaWJ1dGVNYXA/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ2F0dHJpYnV0ZU1hcCddXG4gIHNvcnRlZEF0dHJpYnV0ZXM/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ3NvcnRlZEF0dHJpYnV0ZXMnXVxuICBtZXRhY2FyZFR5cGVzPzogU3RhcnR1cFBheWxvYWRUeXBlWydtZXRhY2FyZFR5cGVzJ11cbiAgY29uc3RydWN0b3Ioc3RhcnR1cERhdGE/OiBTdGFydHVwRGF0YSkge1xuICAgIHN1cGVyKClcbiAgICBzdGFydHVwRGF0YT8uc3Vic2NyaWJlVG8oe1xuICAgICAgc3Vic2NyaWJhYmxlVGhpbmc6ICdmZXRjaGVkJyxcbiAgICAgIGNhbGxiYWNrOiAoc3RhcnR1cFBheWxvYWQpID0+IHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVNYXAgPSBzdGFydHVwUGF5bG9hZC5hdHRyaWJ1dGVNYXBcbiAgICAgICAgdGhpcy5zb3J0ZWRBdHRyaWJ1dGVzID0gc3RhcnR1cFBheWxvYWQuc29ydGVkQXR0cmlidXRlc1xuICAgICAgICB0aGlzLm1ldGFjYXJkVHlwZXMgPSBzdGFydHVwUGF5bG9hZC5tZXRhY2FyZFR5cGVzXG4gICAgICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdtZXRhY2FyZC1kZWZpbml0aW9ucy11cGRhdGUnIH0pXG4gICAgICB9LFxuICAgIH0pXG4gIH1cbiAgLy8gZWFjaCB0aW1lIGEgc2VhcmNoIGlzIGNvbmR1Y3RlZCwgdGhpcyBpcyBwb3NzaWJsZSwgYXMgc2VhcmNoZXMgcmV0dXJuIHR5cGVzXG4gIGFkZER5bmFtaWNhbGx5Rm91bmRNZXRhY2FyZERlZmluaXRpb25zRnJvbVNlYXJjaFJlc3VsdHMgPSAoXG4gICAgZGVmaW5pdGlvbnM6IFNlYXJjaFJlc3VsdE1ldGFjYXJkRGVmaW5pdGlvblR5cGVcbiAgKSA9PiB7XG4gICAgY29uc3QgdW5rbm93bk1ldGFjYXJkVHlwZXMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgdGhpcy5pc1Vua25vd25NZXRhY2FyZFR5cGVcbiAgICApXG4gICAgaWYgKHVua25vd25NZXRhY2FyZFR5cGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gZG9uJ3QgZG8gdW5uZWNlc3Nhcnkgd29ya1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHRyYW5zZm9ybWVkRGVmaW5pdGlvbnMgPSBPYmplY3QuZW50cmllcyhkZWZpbml0aW9ucykucmVkdWNlKFxuICAgICAgKGJsb2IsIGVudHJ5KSA9PiB7XG4gICAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IGVudHJ5XG4gICAgICAgIGJsb2Jba2V5XSA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKS5yZWR1Y2UoKGlubmVyQmxvYiwgaW5uZXJFbnRyeSkgPT4ge1xuICAgICAgICAgIGNvbnN0IFtpbm5lcktleSwgaW5uZXJWYWx1ZV0gPSBpbm5lckVudHJ5IGFzIHVua25vd24gYXMgW1xuICAgICAgICAgICAgc3RyaW5nLFxuICAgICAgICAgICAgU2VhcmNoUmVzdWx0QXR0cmlidXRlRGVmaW5pdGlvblR5cGVcbiAgICAgICAgICBdXG4gICAgICAgICAgaW5uZXJCbG9iW2lubmVyS2V5XSA9IHtcbiAgICAgICAgICAgIGlkOiBpbm5lcktleSxcbiAgICAgICAgICAgIHR5cGU6IGlubmVyVmFsdWUuZm9ybWF0LFxuICAgICAgICAgICAgbXVsdGl2YWx1ZWQ6IGlubmVyVmFsdWUubXVsdGl2YWx1ZWQsXG4gICAgICAgICAgICBpc0luamVjdGVkOiBmYWxzZSwgLy8gbm90IHN1cmUgd2UgbmVlZCB0aGlzXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBpbm5lckJsb2JcbiAgICAgICAgfSwge30gYXMgQXR0cmlidXRlTWFwVHlwZSlcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7fSBhcyBNZXRhY2FyZERlZmluaXRpb25zVHlwZVxuICAgIClcbiAgICB0aGlzLmFkZER5bmFtaWNhbGx5Rm91bmRNZXRhY2FyZERlZmluaXRpb25zKHRyYW5zZm9ybWVkRGVmaW5pdGlvbnMpXG4gIH1cbiAgYWRkRHluYW1pY2FsbHlGb3VuZE1ldGFjYXJkRGVmaW5pdGlvbnMgPSAoXG4gICAgZGVmaW5pdGlvbnM6IE1ldGFjYXJkRGVmaW5pdGlvbnNUeXBlXG4gICkgPT4ge1xuICAgIGNvbnN0IHVua25vd25NZXRhY2FyZFR5cGVzID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbnMpLmZpbHRlcihcbiAgICAgIHRoaXMuaXNVbmtub3duTWV0YWNhcmRUeXBlXG4gICAgKVxuICAgIHVua25vd25NZXRhY2FyZFR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIHRoaXMuYWRkVW5rbm93bk1ldGFjYXJkVHlwZSh7XG4gICAgICAgIG5hbWU6IHR5cGUsXG4gICAgICAgIGRlZmluaXRpb246IGRlZmluaXRpb25zW3R5cGVdLFxuICAgICAgfSlcbiAgICB9KVxuICAgIGNvbnN0IHVua25vd25BdHRyaWJ1dGVzID0gdW5rbm93bk1ldGFjYXJkVHlwZXMucmVkdWNlKFxuICAgICAgKGJsb2IsIGRlZmluaXRpb25OYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcE9mVW5rbm93bkF0dHJpYnV0ZURlZmluaXRpb25zRnJvbVVua25vd25UeXBlID0gT2JqZWN0LmtleXMoXG4gICAgICAgICAgZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdXG4gICAgICAgIClcbiAgICAgICAgICAuZmlsdGVyKHRoaXMuaXNVbmtub3duQXR0cmlidXRlKVxuICAgICAgICAgIC5yZWR1Y2UoKGlubmVyQmxvYiwgYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgICAgICAgaW5uZXJCbG9iW2F0dHJpYnV0ZU5hbWVdID1cbiAgICAgICAgICAgICAgZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdW2F0dHJpYnV0ZU5hbWVdXG4gICAgICAgICAgICByZXR1cm4gaW5uZXJCbG9iXG4gICAgICAgICAgfSwge30gYXMgQXR0cmlidXRlTWFwVHlwZSlcbiAgICAgICAgT2JqZWN0LmFzc2lnbihibG9iLCBtYXBPZlVua25vd25BdHRyaWJ1dGVEZWZpbml0aW9uc0Zyb21Vbmtub3duVHlwZSlcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sXG4gICAgICB7fSBhcyBBdHRyaWJ1dGVNYXBUeXBlXG4gICAgKVxuICAgIHRoaXMuYWRkVW5rbm93bkF0dHJpYnV0ZXModW5rbm93bkF0dHJpYnV0ZXMpXG4gICAgaWYgKE9iamVjdC5rZXlzKHVua25vd25BdHRyaWJ1dGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnJlc29ydEtub3duTWV0YWNhcmRBdHRyaWJ1dGVzKClcbiAgICB9XG4gIH1cbiAgYWRkVW5rbm93bk1ldGFjYXJkVHlwZSA9ICh7XG4gICAgbmFtZSxcbiAgICBkZWZpbml0aW9uLFxuICB9OiB7XG4gICAgbmFtZTogc3RyaW5nXG4gICAgZGVmaW5pdGlvbjogTWV0YWNhcmREZWZpbml0aW9uVHlwZVxuICB9KSA9PiB7XG4gICAgaWYgKHRoaXMubWV0YWNhcmRUeXBlcykge1xuICAgICAgdGhpcy5tZXRhY2FyZFR5cGVzW25hbWVdID0gZGVmaW5pdGlvblxuICAgIH1cbiAgfVxuICBhZGRVbmtub3duQXR0cmlidXRlcyA9IChkZWZpbml0aW9uOiBNZXRhY2FyZERlZmluaXRpb25UeXBlKSA9PiB7XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlTWFwKSB7XG4gICAgICBPYmplY3QuZW50cmllcyhkZWZpbml0aW9uKVxuICAgICAgICAuZmlsdGVyKChlbnRyeSkgPT4gdGhpcy5pc1Vua25vd25BdHRyaWJ1dGUoZW50cnlbMF0pKVxuICAgICAgICAuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICB0aGlzLmFkZFVua25vd25BdHRyaWJ1dGUoe1xuICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogZW50cnlbMF0sXG4gICAgICAgICAgICBhdHRyaWJ1dGVEZWZpbml0aW9uOiBlbnRyeVsxXSxcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuICBhZGRVbmtub3duQXR0cmlidXRlID0gKHtcbiAgICBhdHRyaWJ1dGVEZWZpbml0aW9uLFxuICAgIGF0dHJpYnV0ZU5hbWUsXG4gIH06IHtcbiAgICBhdHRyaWJ1dGVOYW1lOiBzdHJpbmdcbiAgICBhdHRyaWJ1dGVEZWZpbml0aW9uOiBBdHRyaWJ1dGVEZWZpbml0aW9uVHlwZVxuICB9KSA9PiB7XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlTWFwKSB7XG4gICAgICB0aGlzLmF0dHJpYnV0ZU1hcFthdHRyaWJ1dGVOYW1lXSA9IGF0dHJpYnV0ZURlZmluaXRpb25cbiAgICB9XG4gIH1cbiAgaXNVbmtub3duQXR0cmlidXRlID0gKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIGlmICh0aGlzLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwW2F0dHJpYnV0ZU5hbWVdID09PSB1bmRlZmluZWRcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpc1Vua25vd25NZXRhY2FyZFR5cGUgPSAobWV0YWNhcmRUeXBlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAodGhpcy5tZXRhY2FyZFR5cGVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZXRhY2FyZFR5cGVzW21ldGFjYXJkVHlwZV0gPT09IHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJlc29ydEtub3duTWV0YWNhcmRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIHRoaXMuc29ydGVkQXR0cmlidXRlcyA9IHNvcnRNZXRhY2FyZFR5cGVzKHRoaXMuYXR0cmlidXRlTWFwKVxuICAgIHRoaXMuX25vdGlmeVN1YnNjcmliZXJzKHsgdGhpbmc6ICdtZXRhY2FyZC1kZWZpbml0aW9ucy11cGRhdGUnIH0pXG4gIH1cbiAgaXNIaWRkZW5BdHRyaWJ1dGUgPSAoaWQ6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICghdGhpcy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hdHRyaWJ1dGVNYXBbaWRdID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMuYXR0cmlidXRlTWFwW2lkXS5oaWRkZW4gPT09IHRydWVcbiAgICApXG4gIH1cbiAgZ2V0TWV0YWNhcmREZWZpbml0aW9uID0gKG1ldGFjYXJkVHlwZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLm1ldGFjYXJkVHlwZXM/LlttZXRhY2FyZFR5cGVOYW1lXSB8fCB7fVxuICB9XG4gIGdldFJlcXVpcmVkID0gKG1ldGFjYXJkVHlwZU5hbWU6IHN0cmluZywgYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMubWV0YWNhcmRUeXBlcz8uW21ldGFjYXJkVHlwZU5hbWVdPy5bYXR0cmlidXRlTmFtZV0/LnJlcXVpcmVkIHx8IGZhbHNlXG4gICAgKVxuICB9XG4gIGdldEFsaWFzID0gKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2F0dHJpYnV0ZU5hbWVdPy5hbGlhcyB8fCBhdHRyaWJ1dGVOYW1lXG4gIH1cbiAgZ2V0VHlwZSA9IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXA/LlthdHRyaWJ1dGVOYW1lXT8udHlwZSB8fCAnU1RSSU5HJ1xuICB9XG4gIGlzTXVsdGkgPSAoYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwPy5bYXR0cmlidXRlTmFtZV0/Lm11bHRpdmFsdWVkIHx8IGZhbHNlXG4gIH1cbiAgZ2V0RW51bSA9IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXA/LlthdHRyaWJ1dGVOYW1lXT8uZW51bWVyYXRpb25zIHx8IFtdXG4gIH1cbiAgZ2V0U2VhcmNoT25seUF0dHJpYnV0ZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFsnYW55VGV4dCcsICdhbnlHZW8nLCAnYW55RGF0ZScsIEJhc2ljRGF0YVR5cGVQcm9wZXJ0eU5hbWVdXG4gIH1cbiAgZ2V0U29ydGVkQXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5zb3J0ZWRBdHRyaWJ1dGVzIHx8IFtdXG4gIH1cbiAgZ2V0QXR0cmlidXRlTWFwID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcCB8fCB7fVxuICB9XG4gIGdldEF0dHJpYnV0ZURlZmluaXRpb24gPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2lkXVxuICB9XG59XG5cbmV4cG9ydCB7IE1ldGFjYXJkRGVmaW5pdGlvbnMgfVxuIl19