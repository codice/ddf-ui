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
//# sourceMappingURL=metacard-definitions.js.map