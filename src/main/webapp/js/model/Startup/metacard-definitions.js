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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWNhcmQtZGVmaW5pdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVEQUF1RCxDQUFBO0FBQ2pHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQVluRCxTQUFTLGlCQUFpQixDQUFDLGFBQW9DO0lBQXBDLDhCQUFBLEVBQUEsa0JBQW9DO0lBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztRQUM1QyxJQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3RELElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDdEQsSUFBSSxjQUFjLEdBQUcsY0FBYyxFQUFFO1lBQ25DLE9BQU8sQ0FBQyxDQUFDLENBQUE7U0FDVjtRQUNELElBQUksY0FBYyxHQUFHLGNBQWMsRUFBRTtZQUNuQyxPQUFPLENBQUMsQ0FBQTtTQUNUO1FBQ0QsT0FBTyxDQUFDLENBQUE7SUFDVixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRDtJQUFrQyx1Q0FFaEM7SUFJQSw2QkFBWSxXQUF5QjtRQUFyQyxZQUNFLGlCQUFPLFNBVVI7UUFDRCw4RUFBOEU7UUFDOUUsNkRBQXVELEdBQUcsVUFDeEQsV0FBK0M7WUFFL0MsSUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FD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YVR5cGVQcm9wZXJ0eU5hbWUgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvcmVzZXJ2ZWQucHJvcGVydGllcydcbmltcG9ydCB7IFN1YnNjcmliYWJsZSB9IGZyb20gJy4uL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGEgfSBmcm9tICcuL3N0YXJ0dXAnXG5pbXBvcnQge1xuICBBdHRyaWJ1dGVEZWZpbml0aW9uVHlwZSxcbiAgQXR0cmlidXRlTWFwVHlwZSxcbiAgTWV0YWNhcmREZWZpbml0aW9uVHlwZSxcbiAgTWV0YWNhcmREZWZpbml0aW9uc1R5cGUsXG4gIFNlYXJjaFJlc3VsdEF0dHJpYnV0ZURlZmluaXRpb25UeXBlLFxuICBTZWFyY2hSZXN1bHRNZXRhY2FyZERlZmluaXRpb25UeXBlLFxuICBTdGFydHVwUGF5bG9hZFR5cGUsXG59IGZyb20gJy4vc3RhcnR1cC50eXBlcydcblxuZnVuY3Rpb24gc29ydE1ldGFjYXJkVHlwZXMobWV0YWNhcmRUeXBlczogQXR0cmlidXRlTWFwVHlwZSA9IHt9KSB7XG4gIHJldHVybiBPYmplY3QudmFsdWVzKG1ldGFjYXJkVHlwZXMpLnNvcnQoKGEsIGIpID0+IHtcbiAgICBjb25zdCBhdHRyVG9Db21wYXJlQSA9IChhLmFsaWFzIHx8IGEuaWQpLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBhdHRyVG9Db21wYXJlQiA9IChiLmFsaWFzIHx8IGIuaWQpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoYXR0clRvQ29tcGFyZUEgPCBhdHRyVG9Db21wYXJlQikge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIGlmIChhdHRyVG9Db21wYXJlQSA+IGF0dHJUb0NvbXBhcmVCKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgICByZXR1cm4gMFxuICB9KVxufVxuXG5jbGFzcyBNZXRhY2FyZERlZmluaXRpb25zIGV4dGVuZHMgU3Vic2NyaWJhYmxlPHtcbiAgdGhpbmc6ICdtZXRhY2FyZC1kZWZpbml0aW9ucy11cGRhdGUnXG59PiB7XG4gIGF0dHJpYnV0ZU1hcD86IFN0YXJ0dXBQYXlsb2FkVHlwZVsnYXR0cmlidXRlTWFwJ11cbiAgc29ydGVkQXR0cmlidXRlcz86IFN0YXJ0dXBQYXlsb2FkVHlwZVsnc29ydGVkQXR0cmlidXRlcyddXG4gIG1ldGFjYXJkVHlwZXM/OiBTdGFydHVwUGF5bG9hZFR5cGVbJ21ldGFjYXJkVHlwZXMnXVxuICBjb25zdHJ1Y3RvcihzdGFydHVwRGF0YT86IFN0YXJ0dXBEYXRhKSB7XG4gICAgc3VwZXIoKVxuICAgIHN0YXJ0dXBEYXRhPy5zdWJzY3JpYmVUbyh7XG4gICAgICBzdWJzY3JpYmFibGVUaGluZzogJ2ZldGNoZWQnLFxuICAgICAgY2FsbGJhY2s6IChzdGFydHVwUGF5bG9hZCkgPT4ge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZU1hcCA9IHN0YXJ0dXBQYXlsb2FkLmF0dHJpYnV0ZU1hcFxuICAgICAgICB0aGlzLnNvcnRlZEF0dHJpYnV0ZXMgPSBzdGFydHVwUGF5bG9hZC5zb3J0ZWRBdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMubWV0YWNhcmRUeXBlcyA9IHN0YXJ0dXBQYXlsb2FkLm1ldGFjYXJkVHlwZXNcbiAgICAgICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ21ldGFjYXJkLWRlZmluaXRpb25zLXVwZGF0ZScgfSlcbiAgICAgIH0sXG4gICAgfSlcbiAgfVxuICAvLyBlYWNoIHRpbWUgYSBzZWFyY2ggaXMgY29uZHVjdGVkLCB0aGlzIGlzIHBvc3NpYmxlLCBhcyBzZWFyY2hlcyByZXR1cm4gdHlwZXNcbiAgYWRkRHluYW1pY2FsbHlGb3VuZE1ldGFjYXJkRGVmaW5pdGlvbnNGcm9tU2VhcmNoUmVzdWx0cyA9IChcbiAgICBkZWZpbml0aW9uczogU2VhcmNoUmVzdWx0TWV0YWNhcmREZWZpbml0aW9uVHlwZVxuICApID0+IHtcbiAgICBjb25zdCB1bmtub3duTWV0YWNhcmRUeXBlcyA9IE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5maWx0ZXIoXG4gICAgICB0aGlzLmlzVW5rbm93bk1ldGFjYXJkVHlwZVxuICAgIClcbiAgICBpZiAodW5rbm93bk1ldGFjYXJkVHlwZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBkb24ndCBkbyB1bm5lY2Vzc2FyeSB3b3JrXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdHJhbnNmb3JtZWREZWZpbml0aW9ucyA9IE9iamVjdC5lbnRyaWVzKGRlZmluaXRpb25zKS5yZWR1Y2UoXG4gICAgICAoYmxvYiwgZW50cnkpID0+IHtcbiAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gZW50cnlcbiAgICAgICAgYmxvYltrZXldID0gT2JqZWN0LmVudHJpZXModmFsdWUpLnJlZHVjZSgoaW5uZXJCbG9iLCBpbm5lckVudHJ5KSA9PiB7XG4gICAgICAgICAgY29uc3QgW2lubmVyS2V5LCBpbm5lclZhbHVlXSA9IGlubmVyRW50cnkgYXMgdW5rbm93biBhcyBbXG4gICAgICAgICAgICBzdHJpbmcsXG4gICAgICAgICAgICBTZWFyY2hSZXN1bHRBdHRyaWJ1dGVEZWZpbml0aW9uVHlwZVxuICAgICAgICAgIF1cbiAgICAgICAgICBpbm5lckJsb2JbaW5uZXJLZXldID0ge1xuICAgICAgICAgICAgaWQ6IGlubmVyS2V5LFxuICAgICAgICAgICAgdHlwZTogaW5uZXJWYWx1ZS5mb3JtYXQsXG4gICAgICAgICAgICBtdWx0aXZhbHVlZDogaW5uZXJWYWx1ZS5tdWx0aXZhbHVlZCxcbiAgICAgICAgICAgIGlzSW5qZWN0ZWQ6IGZhbHNlLCAvLyBub3Qgc3VyZSB3ZSBuZWVkIHRoaXNcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGlubmVyQmxvYlxuICAgICAgICB9LCB7fSBhcyBBdHRyaWJ1dGVNYXBUeXBlKVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSxcbiAgICAgIHt9IGFzIE1ldGFjYXJkRGVmaW5pdGlvbnNUeXBlXG4gICAgKVxuICAgIHRoaXMuYWRkRHluYW1pY2FsbHlGb3VuZE1ldGFjYXJkRGVmaW5pdGlvbnModHJhbnNmb3JtZWREZWZpbml0aW9ucylcbiAgfVxuICBhZGREeW5hbWljYWxseUZvdW5kTWV0YWNhcmREZWZpbml0aW9ucyA9IChcbiAgICBkZWZpbml0aW9uczogTWV0YWNhcmREZWZpbml0aW9uc1R5cGVcbiAgKSA9PiB7XG4gICAgY29uc3QgdW5rbm93bk1ldGFjYXJkVHlwZXMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9ucykuZmlsdGVyKFxuICAgICAgdGhpcy5pc1Vua25vd25NZXRhY2FyZFR5cGVcbiAgICApXG4gICAgdW5rbm93bk1ldGFjYXJkVHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgdGhpcy5hZGRVbmtub3duTWV0YWNhcmRUeXBlKHtcbiAgICAgICAgbmFtZTogdHlwZSxcbiAgICAgICAgZGVmaW5pdGlvbjogZGVmaW5pdGlvbnNbdHlwZV0sXG4gICAgICB9KVxuICAgIH0pXG4gICAgY29uc3QgdW5rbm93bkF0dHJpYnV0ZXMgPSB1bmtub3duTWV0YWNhcmRUeXBlcy5yZWR1Y2UoXG4gICAgICAoYmxvYiwgZGVmaW5pdGlvbk5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgbWFwT2ZVbmtub3duQXR0cmlidXRlRGVmaW5pdGlvbnNGcm9tVW5rbm93blR5cGUgPSBPYmplY3Qua2V5cyhcbiAgICAgICAgICBkZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV1cbiAgICAgICAgKVxuICAgICAgICAgIC5maWx0ZXIodGhpcy5pc1Vua25vd25BdHRyaWJ1dGUpXG4gICAgICAgICAgLnJlZHVjZSgoaW5uZXJCbG9iLCBhdHRyaWJ1dGVOYW1lKSA9PiB7XG4gICAgICAgICAgICBpbm5lckJsb2JbYXR0cmlidXRlTmFtZV0gPVxuICAgICAgICAgICAgICBkZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV1bYXR0cmlidXRlTmFtZV1cbiAgICAgICAgICAgIHJldHVybiBpbm5lckJsb2JcbiAgICAgICAgICB9LCB7fSBhcyBBdHRyaWJ1dGVNYXBUeXBlKVxuICAgICAgICBPYmplY3QuYXNzaWduKGJsb2IsIG1hcE9mVW5rbm93bkF0dHJpYnV0ZURlZmluaXRpb25zRnJvbVVua25vd25UeXBlKVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSxcbiAgICAgIHt9IGFzIEF0dHJpYnV0ZU1hcFR5cGVcbiAgICApXG4gICAgdGhpcy5hZGRVbmtub3duQXR0cmlidXRlcyh1bmtub3duQXR0cmlidXRlcylcbiAgICBpZiAoT2JqZWN0LmtleXModW5rbm93bkF0dHJpYnV0ZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucmVzb3J0S25vd25NZXRhY2FyZEF0dHJpYnV0ZXMoKVxuICAgIH1cbiAgfVxuICBhZGRVbmtub3duTWV0YWNhcmRUeXBlID0gKHtcbiAgICBuYW1lLFxuICAgIGRlZmluaXRpb24sXG4gIH06IHtcbiAgICBuYW1lOiBzdHJpbmdcbiAgICBkZWZpbml0aW9uOiBNZXRhY2FyZERlZmluaXRpb25UeXBlXG4gIH0pID0+IHtcbiAgICBpZiAodGhpcy5tZXRhY2FyZFR5cGVzKSB7XG4gICAgICB0aGlzLm1ldGFjYXJkVHlwZXNbbmFtZV0gPSBkZWZpbml0aW9uXG4gICAgfVxuICB9XG4gIGFkZFVua25vd25BdHRyaWJ1dGVzID0gKGRlZmluaXRpb246IE1ldGFjYXJkRGVmaW5pdGlvblR5cGUpID0+IHtcbiAgICBpZiAodGhpcy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIE9iamVjdC5lbnRyaWVzKGRlZmluaXRpb24pXG4gICAgICAgIC5maWx0ZXIoKGVudHJ5KSA9PiB0aGlzLmlzVW5rbm93bkF0dHJpYnV0ZShlbnRyeVswXSkpXG4gICAgICAgIC5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICAgIHRoaXMuYWRkVW5rbm93bkF0dHJpYnV0ZSh7XG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiBlbnRyeVswXSxcbiAgICAgICAgICAgIGF0dHJpYnV0ZURlZmluaXRpb246IGVudHJ5WzFdLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICB9XG4gIGFkZFVua25vd25BdHRyaWJ1dGUgPSAoe1xuICAgIGF0dHJpYnV0ZURlZmluaXRpb24sXG4gICAgYXR0cmlidXRlTmFtZSxcbiAgfToge1xuICAgIGF0dHJpYnV0ZU5hbWU6IHN0cmluZ1xuICAgIGF0dHJpYnV0ZURlZmluaXRpb246IEF0dHJpYnV0ZURlZmluaXRpb25UeXBlXG4gIH0pID0+IHtcbiAgICBpZiAodGhpcy5hdHRyaWJ1dGVNYXApIHtcbiAgICAgIHRoaXMuYXR0cmlidXRlTWFwW2F0dHJpYnV0ZU5hbWVdID0gYXR0cmlidXRlRGVmaW5pdGlvblxuICAgIH1cbiAgfVxuICBpc1Vua25vd25BdHRyaWJ1dGUgPSAoYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlTWFwKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXBbYXR0cmlidXRlTmFtZV0gPT09IHVuZGVmaW5lZFxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlzVW5rbm93bk1ldGFjYXJkVHlwZSA9IChtZXRhY2FyZFR5cGU6IHN0cmluZykgPT4ge1xuICAgIGlmICh0aGlzLm1ldGFjYXJkVHlwZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLm1ldGFjYXJkVHlwZXNbbWV0YWNhcmRUeXBlXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmVzb3J0S25vd25NZXRhY2FyZEF0dHJpYnV0ZXMgPSAoKSA9PiB7XG4gICAgdGhpcy5zb3J0ZWRBdHRyaWJ1dGVzID0gc29ydE1ldGFjYXJkVHlwZXModGhpcy5hdHRyaWJ1dGVNYXApXG4gICAgdGhpcy5fbm90aWZ5U3Vic2NyaWJlcnMoeyB0aGluZzogJ21ldGFjYXJkLWRlZmluaXRpb25zLXVwZGF0ZScgfSlcbiAgfVxuICBpc0hpZGRlbkF0dHJpYnV0ZSA9IChpZDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCF0aGlzLmF0dHJpYnV0ZU1hcCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmF0dHJpYnV0ZU1hcFtpZF0gPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5hdHRyaWJ1dGVNYXBbaWRdLmhpZGRlbiA9PT0gdHJ1ZVxuICAgIClcbiAgfVxuICBnZXRNZXRhY2FyZERlZmluaXRpb24gPSAobWV0YWNhcmRUeXBlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMubWV0YWNhcmRUeXBlcz8uW21ldGFjYXJkVHlwZU5hbWVdIHx8IHt9XG4gIH1cbiAgZ2V0QWxpYXMgPSAoYXR0cmlidXRlTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwPy5bYXR0cmlidXRlTmFtZV0/LmFsaWFzIHx8IGF0dHJpYnV0ZU5hbWVcbiAgfVxuICBnZXRUeXBlID0gKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2F0dHJpYnV0ZU5hbWVdPy50eXBlIHx8ICdTVFJJTkcnXG4gIH1cbiAgaXNNdWx0aSA9IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVNYXA/LlthdHRyaWJ1dGVOYW1lXT8ubXVsdGl2YWx1ZWQgfHwgZmFsc2VcbiAgfVxuICBnZXRFbnVtID0gKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZU1hcD8uW2F0dHJpYnV0ZU5hbWVdPy5lbnVtZXJhdGlvbnMgfHwgW11cbiAgfVxuICBnZXRTZWFyY2hPbmx5QXR0cmlidXRlcyA9ICgpID0+IHtcbiAgICByZXR1cm4gWydhbnlUZXh0JywgJ2FueUdlbycsICdhbnlEYXRlJywgQmFzaWNEYXRhVHlwZVByb3BlcnR5TmFtZV1cbiAgfVxuICBnZXRTb3J0ZWRBdHRyaWJ1dGVzID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnNvcnRlZEF0dHJpYnV0ZXMgfHwgW11cbiAgfVxuICBnZXRBdHRyaWJ1dGVNYXAgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwIHx8IHt9XG4gIH1cbiAgZ2V0QXR0cmlidXRlRGVmaW5pdGlvbiA9IChpZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlTWFwPy5baWRdXG4gIH1cbn1cblxuZXhwb3J0IHsgTWV0YWNhcmREZWZpbml0aW9ucyB9XG4iXX0=