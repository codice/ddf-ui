/**
 * types for metacard defs
 */
import { hot } from 'react-hot-loader';
import Common from '../../../js/Common';
import metacardDefinitions from '../../singletons/metacard-definitions';
import properties from '../../../js/properties';
// window.metacardDefinitions = metacardDefinitions
export var TypedMetacardDefs = {
    /**
     * We exclude thumbnail because although it is a type of attribute (BINARY) we don't usually support viewing in the UI, we handle it
     */
    isHiddenTypeExceptThumbnail: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.isHiddenTypeExceptThumbnail(attr);
    },
    isHidden: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.isHiddenType(attr);
    },
    getAllKnownAttributes: function () {
        return [];
    },
    // types that aren't real, but facilitate searching.  Filter these out in things like inspector or table since they aren't real attributes.
    getSearchOnlyAttributes: function () {
        return ['anyText', 'anyGeo'];
    },
    getSortedMetacardTypes: function () {
        return metacardDefinitions.sortedMetacardTypes;
    },
    getType: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.metacardTypes[attr].type;
    },
    // O(1) lookup of attr alias
    getAlias: function (_a) {
        var attr = _a.attr;
        return properties.attributeAliases[attr] || attr;
    },
    isMulti: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.metacardTypes[attr].multivalued || false;
    },
    isReadonly: function (_a) {
        var attr = _a.attr;
        return properties.isReadOnly(attr) || false;
    },
    getImageSrc: function (_a) {
        var val = _a.val;
        if (typeof val === 'string' && val.substring(0, 4) !== 'http') {
            return val.split('?_=')[0];
        }
        return Common.getImageSrc(val);
    },
    getDefinition: function (_a) {
        var type = _a.type;
        return metacardDefinitions.metacardDefinitions[type] || {};
    },
    getEnum: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.enums[attr];
    },
    getDeprecatedEnum: function (_a) {
        var attr = _a.attr;
        return metacardDefinitions.deprecatedEnums[attr];
    },
    typesFetched: function () {
        return metacardDefinitions.typesFetched;
    },
    addMetacardDefinition: function (name, definition) {
        return metacardDefinitions.addMetacardDefinition(name, definition);
    },
    addMetacardDefinitions: function (definitions) {
        metacardDefinitions.addMetacardDefinitions(definitions);
    }
};
export default hot(module)(TypedMetacardDefs);
//# sourceMappingURL=metacardDefinitions.js.map