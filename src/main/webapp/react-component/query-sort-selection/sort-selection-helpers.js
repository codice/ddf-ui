import { __values } from "tslib";
import { StartupDataStore } from '../../js/model/Startup/startup';
var blacklist = ['anyText', 'anyGeo'];
export var getLabel = function (value) {
    var label = StartupDataStore.MetacardDefinitions.getAlias(value);
    if (label === 'RELEVANCE') {
        return 'Best Text Match';
    }
    return label;
};
export var getSortAttributeOptions = function (currentSelections) {
    var currentAttributes = currentSelections && currentSelections.length ? currentSelections : [];
    var attributes = StartupDataStore.MetacardDefinitions.getSortedAttributes();
    var options = attributes
        .filter(function (type) { return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(type.id); })
        .filter(function (type) { return !blacklist.includes(type.id); })
        .filter(function (type) { return !currentAttributes.includes(type.id); })
        .map(function (type) { return ({
        label: type.alias || type.id,
        value: type.id,
    }); });
    var showBestTextValue = 'RELEVANCE';
    options.unshift({
        label: 'Best Text Match',
        value: showBestTextValue,
    });
    return options;
};
export var getSortDirectionOptions = function (attributeVal) {
    var ascendingLabel, descendingLabel;
    if (StartupDataStore.MetacardDefinitions.getAttributeMap()[attributeVal] ===
        undefined) {
        ascendingLabel = descendingLabel = '';
    }
    else {
        switch (StartupDataStore.MetacardDefinitions.getAttributeMap()[attributeVal].type) {
            case 'DATE':
                ascendingLabel = 'Oldest to Latest';
                descendingLabel = 'Latest to Oldest';
                break;
            case 'BOOLEAN':
                ascendingLabel = 'True to False'; //Truthiest
                descendingLabel = 'False to True'; //Falsiest
                break;
            case 'LONG':
            case 'DOUBLE':
            case 'FLOAT':
            case 'INTEGER':
            case 'SHORT':
                ascendingLabel = 'Smallest to Largest';
                descendingLabel = 'Largest to Smallest';
                break;
            case 'STRING':
                ascendingLabel = 'A to Z';
                descendingLabel = 'Z to A';
                break;
            case 'GEOMETRY':
                ascendingLabel = 'Closest to Furthest';
                descendingLabel = 'Furthest to Closest';
                break;
            case 'XML':
            case 'BINARY':
            default:
                ascendingLabel = 'Ascending';
                descendingLabel = 'Descending';
                break;
        }
    }
    var ascendingOption = {
        label: ascendingLabel,
        value: 'ascending',
    };
    var descendingOption = {
        label: descendingLabel,
        value: 'descending',
    };
    return [ascendingOption, descendingOption];
};
export var getNextAttribute = function (collection, options) {
    var e_1, _a;
    var attributes = collection.map(function (type) { return type.attribute.value; });
    try {
        for (var options_1 = __values(options), options_1_1 = options_1.next(); !options_1_1.done; options_1_1 = options_1.next()) {
            var option = options_1_1.value;
            if (!attributes.includes(option.value)) {
                return option.value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (options_1_1 && !options_1_1.done && (_a = options_1.return)) _a.call(options_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return options[0].value;
};
export var isDirectionalSort = function (attribute) {
    return (StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute] !==
        undefined);
};
//# sourceMappingURL=sort-selection-helpers.js.map