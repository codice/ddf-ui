import { __assign } from "tslib";
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
/* Copyright (c) 2006-2015 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
import { CQLStandardFilterBuilderClass, deserialize, FilterBuilderClass, FilterClass, isBasicDatatypeClass, isFilterBuilderClass, isCQLStandardFilterBuilderClass, serialize, shouldBeFilterBuilderClass, convertResourceSizeFilterClassValueToBytes, isResourceSizeFilterClass, isResourceSizeRangeFilterClass, convertResourceSizeRangeFilterClassValueToBytes, } from '../component/filter-builder/filter.structure';
import { getDataTypesConfiguration } from '../component/reserved-basic-datatype/reserved.basic-datatype';
import CQLUtils from './CQLUtils';
import _cloneDeep from 'lodash/cloneDeep';
import wkx from 'wkx';
import { StartupDataStore } from './model/Startup/startup';
var getPointRadiusFilter = function (point, property, radius) {
    var value = {
        mode: 'circle',
        type: 'POINTRADIUS',
        lat: point[1],
        lon: point[0],
    };
    return new FilterClass({
        type: 'GEOMETRY',
        value: (radius ? __assign(__assign({}, value), { radius: radius }) : value),
        property: property,
    });
};
var getLinestringFilter = function (line, property, buffer) {
    var value = {
        mode: 'line',
        type: 'LINE',
        line: line,
    };
    return new FilterClass({
        type: 'GEOMETRY',
        value: (buffer
            ? __assign(__assign({}, value), { lineWidth: buffer }) : value),
        property: property,
    });
};
var getPolygonFilter = function (poly, property, buffer) {
    var value = {
        mode: 'poly',
        type: 'POLYGON',
        polygon: poly,
    };
    return new FilterClass({
        type: 'GEOMETRY',
        value: (buffer
            ? __assign(__assign({}, value), { polygonBufferWidth: buffer }) : value),
        property: property,
    });
};
var ANYTEXT_WILDCARD = '"anyText" ILIKE \'%\'';
var timePattern = /((([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?)|^'')/i, patterns = {
    //Allows for non-standard single-quoted property names
    PROPERTY: /^([_a-zA-Z]\w*|"[^"]+"|'[^']+')/,
    COMPARISON: /^(=|<>|<=|<|>=|>|LIKE|ILIKE)/i,
    IS_NULL: /^IS NULL/i,
    COMMA: /^,/,
    LOGICAL: /^(AND|OR)/i,
    VALUE: /^('([^']|'')*'|-?\d+(\.\d*)?|\.\d+)/,
    FILTER_FUNCTION: /^[a-z]\w+\(/,
    BOOLEAN: /^(false|true)/i,
    LPAREN: /^\(/,
    RPAREN: /^\)/,
    SPATIAL: /^(BBOX|INTERSECTS|DWITHIN|WITHIN|CONTAINS)/i,
    UNITS: /^(meters)/i,
    NOT: /^NOT/i,
    BETWEEN: /^BETWEEN/i,
    BEFORE: /^BEFORE/i,
    AFTER: /^AFTER/i,
    DURING: /^DURING/i,
    RELATIVE: /^'RELATIVE\([A-Za-z0-9.]*\)'/i,
    TIME: new RegExp('^' + timePattern.source),
    TIME_PERIOD: new RegExp('^' + timePattern.source + '/' + timePattern.source),
    GEOMETRY: function (text) {
        var type = /^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)/.exec(text);
        if (type) {
            var len = text.length;
            var idx = text.indexOf('(', type[0].length);
            if (idx > -1) {
                var depth = 1;
                while (idx < len && depth > 0) {
                    idx++;
                    switch (text.charAt(idx)) {
                        case '(':
                            depth++;
                            break;
                        case ')':
                            depth--;
                            break;
                        default:
                        // in default case, do nothing
                    }
                }
            }
            return [text.substr(0, idx + 1)];
        }
        return null;
    },
    END: /^$/,
}, follows = {
    ROOT_NODE: [
        'NOT',
        'GEOMETRY',
        'SPATIAL',
        'FILTER_FUNCTION',
        'PROPERTY',
        'LPAREN',
    ],
    LPAREN: [
        'NOT',
        'GEOMETRY',
        'SPATIAL',
        'FILTER_FUNCTION',
        'PROPERTY',
        'VALUE',
        'LPAREN',
    ],
    RPAREN: ['NOT', 'LOGICAL', 'END', 'RPAREN', 'COMPARISON', 'COMMA'],
    PROPERTY: [
        'COMPARISON',
        'BETWEEN',
        'COMMA',
        'IS_NULL',
        'BEFORE',
        'AFTER',
        'DURING',
        'RPAREN',
    ],
    BETWEEN: ['VALUE'],
    IS_NULL: ['RPAREN', 'LOGICAL', '[', ']'],
    COMPARISON: ['RELATIVE', 'VALUE', 'BOOLEAN'],
    COMMA: ['FILTER_FUNCTION', 'GEOMETRY', 'VALUE', 'UNITS', 'PROPERTY'],
    VALUE: ['LOGICAL', 'COMMA', 'RPAREN', 'END'],
    BOOLEAN: ['RPAREN'],
    SPATIAL: ['LPAREN'],
    UNITS: ['RPAREN'],
    LOGICAL: [
        'FILTER_FUNCTION',
        'NOT',
        'VALUE',
        'SPATIAL',
        'PROPERTY',
        'LPAREN',
    ],
    NOT: ['PROPERTY', 'LPAREN'],
    GEOMETRY: ['COMMA', 'RPAREN'],
    BEFORE: ['TIME'],
    AFTER: ['TIME'],
    DURING: ['TIME_PERIOD'],
    TIME: ['LOGICAL', 'RPAREN', 'END'],
    TIME_PERIOD: ['LOGICAL', 'RPAREN', 'END'],
    RELATIVE: ['RPAREN', 'END'],
    FILTER_FUNCTION: ['LPAREN', 'PROPERTY', 'VALUE', 'RPAREN'],
    END: [],
}, precedence = {
    RPAREN: 3,
    LOGICAL: 2,
    COMPARISON: 1,
}, 
// as an improvement, these could be figured out while building the syntax tree
filterFunctionParamCount = {
    proximity: 3,
    pi: 0,
}, dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
function tryToken(text, pattern) {
    if (pattern instanceof RegExp) {
        return pattern.exec(text);
    }
    else {
        return pattern(text);
    }
}
function nextToken(text, tokens) {
    var i, token, len = tokens.length;
    for (i = 0; i < len; i++) {
        token = tokens[i];
        var pat = patterns[token];
        var matches = tryToken(text, pat);
        if (matches) {
            var match = matches[0];
            var remainder = text.substr(match.length).replace(/^\s*/, '');
            return {
                type: token,
                text: match,
                remainder: remainder,
            };
        }
    }
    var msg = 'ERROR: In parsing: [' + text + '], expected one of: ';
    for (i = 0; i < len; i++) {
        token = tokens[i];
        msg += '\n    ' + token + ': ' + patterns[token];
    }
    throw new Error(msg);
}
function tokenize(text) {
    var results = [];
    var token = undefined;
    var expect = follows['ROOT_NODE'];
    do {
        token = nextToken(text, expect);
        text = token.remainder;
        expect = follows[token.type];
        if (token.type !== 'END' && !expect) {
            throw new Error('No follows list for ' + token.type);
        }
        results.push(token);
    } while (token.type !== 'END');
    return results;
}
// Mapping of Intrigue's query language syntax to CQL syntax
var userqlToCql = {
    '*': '%',
    '?': '_',
    '%': '\\%',
    _: '\\_',
};
var translateUserqlToCql = function (str) {
    return str.replace(/([^*?%_])?([*?%_])/g, function (_, a, b) {
        if (a === void 0) { a = ''; }
        return a + (a === '\\' ? b : userqlToCql[b]);
    });
};
//Mapping of CQL syntax to Intrigue's query language syntax
var cqlToUserql = {
    '%': '*',
    _: '?',
};
var translateCqlToUserql = function (str) {
    return str.replace(/([^%_])?([%_])/g, function (_, a, b) {
        if (a === void 0) { a = ''; }
        return a === '\\' ? b : a + cqlToUserql[b];
    });
};
var getNextToken = function (postfix) {
    if (postfix[postfix.length - 3] &&
        postfix[postfix.length - 3].type === 'FILTER_FUNCTION') {
        // first two are useless
        postfix.pop();
        postfix.pop();
        return postfix.pop();
    }
    if (postfix[postfix.length - 2] &&
        postfix[postfix.length - 2].type === 'RELATIVE') {
        // first one is useless
        postfix.pop();
        return postfix.pop();
    }
    return postfix.pop();
};
var getGeoFilters = function (wkt, property, buffer) {
    if (wkt.startsWith('GEOMETRYCOLLECTION')) {
        var parsedWkt = wkx.Geometry.parse(wkt);
        var geoJson = parsedWkt.toGeoJSON();
        var innerWkts = geoJson.geometries.map(function (geometry) {
            return wkx.Geometry.parseGeoJSON(geometry).toWkt();
        });
        return new FilterBuilderClass({
            type: 'OR',
            filters: innerWkts.map(function (wkt) { return getGeoFilters(wkt, property, buffer); }),
        });
    }
    else if (wkt.startsWith('LINESTRING')) {
        var line = CQLUtils.arrayFromLinestringWkt(wkt);
        return getLinestringFilter(line, property, buffer);
    }
    else if (wkt.startsWith('MULTILINESTRING')) {
        return new FilterBuilderClass({
            type: 'OR',
            filters: CQLUtils.arrayFromMultilinestringWkt(wkt).map(function (line) { return getLinestringFilter(line, property, buffer); }),
        });
    }
    else if (wkt.startsWith('POLYGON')) {
        var poly = CQLUtils.arrayFromPolygonWkt(wkt);
        return getPolygonFilter(poly, property, buffer);
    }
    else if (wkt.startsWith('MULTIPOLYGON')) {
        return new FilterBuilderClass({
            type: 'OR',
            filters: CQLUtils.arrayFromPolygonWkt(wkt).map(function (poly) {
                return getPolygonFilter(poly, property, buffer);
            }),
        });
    }
    else if (wkt.startsWith('POINT')) {
        var point = CQLUtils.arrayFromPointWkt(wkt)[0];
        return getPointRadiusFilter(point, property, buffer);
    }
    else if (wkt.startsWith('MULTIPOINT')) {
        return new FilterBuilderClass({
            type: 'OR',
            filters: CQLUtils.arrayFromPointWkt(wkt).map(function (point) {
                return getPointRadiusFilter(point, property, buffer);
            }),
        });
    }
    throw new Error('Unknown spatial type encountered');
};
function buildTree(postfix) {
    var value, property, tok = getNextToken(postfix);
    var tokenType = tok.type;
    switch (tokenType) {
        case 'LOGICAL':
            var rhs = buildTree(postfix), lhs = buildTree(postfix);
            return new FilterBuilderClass({
                filters: [lhs, rhs],
                type: tok.text.toUpperCase(),
            });
        case 'NOT':
            var peekToken = postfix[postfix.length - 1];
            if (peekToken.type === 'LOGICAL') {
                return new FilterBuilderClass(__assign(__assign({}, buildTree(postfix)), { negated: true }));
            }
            else if (peekToken.type === 'NOT') {
                return new FilterBuilderClass({
                    filters: [buildTree(postfix)],
                    type: 'AND',
                    negated: true,
                });
            }
            else {
                return new FilterClass(__assign(__assign({}, buildTree(postfix)), { negated: true }));
            }
        case 'BETWEEN': // works
            var min = void 0, max = void 0;
            postfix.pop(); // unneeded AND token here
            max = buildTree(postfix);
            min = buildTree(postfix);
            property = buildTree(postfix);
            return new FilterClass({
                property: property,
                value: {
                    start: min,
                    end: max,
                },
                type: tokenType,
            });
        case 'BEFORE': // works
        case 'AFTER': // works
            value = buildTree(postfix);
            property = buildTree(postfix);
            return new FilterClass({
                property: property,
                value: value,
                type: tok.text.toUpperCase(),
            });
        case 'DURING': // technically between for dates, works
            var dates = buildTree(postfix).split('/');
            property = buildTree(postfix);
            return new FilterClass({
                property: property,
                value: {
                    start: dates[0],
                    end: dates[1],
                },
                type: tok.text.toUpperCase(),
            });
        case 'COMPARISON': // works
            value = buildTree(postfix);
            property = buildTree(postfix);
            return new FilterClass({
                property: property,
                value: value,
                type: tok.text.toUpperCase(),
            });
        case 'IS_NULL': // works
            property = buildTree(postfix);
            return new FilterClass({
                property: property,
                type: tok.text.toUpperCase(),
            });
        case 'VALUE': //works
            var match = tok.text.match(/^'(.*)'$/);
            if (match) {
                if (unwrap(postfix[0].text) === 'id') {
                    // don't escape ids
                    return match[1].replace(/''/g, "'");
                }
                else {
                    return translateCqlToUserql(match[1].replace(/''/g, "'"));
                }
            }
            else {
                return Number(tok.text);
            }
        case 'BOOLEAN': // works
            switch (tok.text.toUpperCase()) {
                case 'TRUE':
                    return true;
                default:
                    return false;
            }
        case 'SPATIAL': // working
            // next token tells us whether this is DWITHIN or INTERSECTS
            switch (tok.text) {
                case 'INTERSECTS': {
                    // things without buffers, could be poly or line
                    var valueToken = postfix.pop();
                    var propertyToken = postfix.pop();
                    return getGeoFilters(valueToken.text, propertyToken.text, undefined);
                }
                case 'DWITHIN': {
                    // things with buffers, could be poly, line or point
                    var bufferToken = postfix.pop();
                    var valueToken = postfix.pop();
                    var propertyToken = postfix.pop();
                    return getGeoFilters(valueToken.text, propertyToken.text, bufferToken.text);
                }
                default:
                    throw new Error('Unknown spatial type encountered');
            }
        case 'GEOMETRY':
            return {
                type: tokenType,
                value: tok.text,
            };
        case 'RELATIVE':
            return new FilterClass({
                type: 'RELATIVE',
                value: deserialize.dateRelative(tok.text),
                property: postfix.pop().text,
            });
        case 'FILTER_FUNCTION': // working
            var filterFunctionName = tok.text.slice(0, -1); // remove trailing '('
            var paramCount = filterFunctionParamCount[filterFunctionName];
            if (paramCount === undefined) {
                throw new Error('Unsupported filter function: ' + filterFunctionName);
            }
            var params = Array.apply(null, Array(paramCount))
                .map(function () { return buildTree(postfix); })
                .reverse();
            switch (filterFunctionName) {
                case 'proximity':
                    var proximityStrings = params[2];
                    return new FilterClass({
                        type: 'FILTER FUNCTION proximity',
                        property: params[0],
                        value: {
                            first: proximityStrings.split(' ')[0],
                            second: proximityStrings.split(' ')[1],
                            distance: params[1],
                        },
                    });
                default:
                    throw new Error('Unknown filter function');
            }
        case 'TIME_PERIOD':
            return tok.text;
        default:
            return tok.text;
    }
}
function buildAst(tokens) {
    var operatorStack = [], postfix = [];
    while (tokens.length) {
        var tok = tokens.shift();
        switch (tok.type) {
            case 'PROPERTY':
                tok.text = unwrap(tok.text);
            case 'GEOMETRY':
            case 'VALUE':
            case 'TIME':
            case 'TIME_PERIOD':
            case 'RELATIVE':
            case 'BOOLEAN':
                postfix.push(tok);
                break;
            case 'COMPARISON':
            case 'BETWEEN':
            case 'IS_NULL':
            case 'LOGICAL':
            case 'BEFORE':
            case 'AFTER':
            case 'DURING':
                var p = precedence[tok.type];
                while (operatorStack.length > 0 &&
                    precedence[operatorStack[operatorStack.length - 1].type] <= p) {
                    postfix.push(operatorStack.pop());
                }
                operatorStack.push(tok);
                break;
            case 'SPATIAL':
            case 'NOT':
            case 'LPAREN':
                operatorStack.push(tok);
                break;
            case 'FILTER_FUNCTION':
                operatorStack.push(tok);
                // insert a '(' manually because we lost the original LPAREN matching the FILTER_FUNCTION regex
                operatorStack.push({ type: 'LPAREN' });
                break;
            case 'RPAREN':
                while (operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
                    postfix.push(operatorStack.pop());
                }
                operatorStack.pop(); // toss out the LPAREN
                // if this right parenthesis ends a function argument list (it's not for a logical grouping),
                // it's now time to add that function to the postfix-ordered list
                var lastOperatorType = operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1].type;
                if (lastOperatorType === 'SPATIAL' ||
                    lastOperatorType === 'FILTER_FUNCTION') {
                    postfix.push(operatorStack.pop());
                }
                break;
            case 'COMMA':
            case 'END':
            case 'UNITS':
                break;
            default:
                throw new Error('Unknown token type ' + tok.type);
        }
    }
    while (operatorStack.length > 0) {
        postfix.push(operatorStack.pop());
    }
    var result = buildTree(postfix);
    if (postfix.length > 0) {
        var msg = 'Remaining tokens after building AST: \n';
        for (var i = postfix.length - 1; i >= 0; i--) {
            msg += postfix[i].type + ': ' + postfix[i].text + '\n';
        }
        throw new Error(msg);
    }
    return result;
}
function wrap(property) {
    var wrapped = property;
    if (!wrapped.startsWith('"')) {
        wrapped = '"' + wrapped;
    }
    if (!wrapped.endsWith('"')) {
        wrapped = wrapped + '"';
    }
    return wrapped;
}
function unwrap(property) {
    // Remove single and double quotes if they exist in property name
    return property.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
}
// really could use some refactoring to enable better typing, right now it's recursive and calls itself with so many different types / return types
function write(filter) {
    switch (filter.type) {
        // spatialClass
        case 'BBOX':
            var xmin = filter.value[0], ymin = filter.value[1], xmax = filter.value[2], ymax = filter.value[3];
            return ('BBOX(' +
                wrap(filter.property) +
                ',' +
                xmin +
                ',' +
                ymin +
                ',' +
                xmax +
                ',' +
                ymax +
                ')');
        // verified line, polygon, point radius
        case 'DWITHIN':
            return "DWITHIN(".concat(wrap(filter.property), ", ").concat(filter.value, ", ").concat(filter.distance, ", meters)");
        // unused at the moment
        case 'WITHIN':
            return ('WITHIN(' + wrap(filter.property) + ', ' + write(filter.value) + ')');
        // verified bbox
        case 'INTERSECTS':
            return 'INTERSECTS(' + wrap(filter.property) + ', ' + filter.value + ')';
        // unused at the moment
        case 'CONTAINS':
            return ('CONTAINS(' + wrap(filter.property) + ', ' + write(filter.value) + ')');
        // all "geo" filters pass through this first, which serializes them into a form that cql understands
        // this is only done here on the fly because the transformation involves a loss of information
        // (such as the units [meters or miles?] and coordinate system [dms or mgrs?])
        case 'GEOMETRY':
            return write(serialize.location(filter.property, filter.value));
        // logicalClass
        case 'AND':
        case 'OR':
            var res = '(';
            var first = true;
            for (var i = 0; i < filter.filters.length; i++) {
                var writtenFilter = write(filter.filters[i]);
                if (writtenFilter) {
                    if (first) {
                        first = false;
                    }
                    else {
                        res += ') ' + filter.type + ' (';
                    }
                    res += writtenFilter;
                }
            }
            return res + ')';
        case 'NOT':
            // TODO: deal with precedence of logical operators to
            // avoid extra parentheses (not urgent)
            return 'NOT (' + write(filter.filters[0]) + ')';
        // comparisonClass
        case 'IS NULL':
            return "(\"".concat(filter.property, "\" ").concat(filter.type, ")");
        case 'BETWEEN':
            return (wrap(filter.property) +
                ' BETWEEN ' +
                write(Math.min(filter.value.start, filter.value.end)) +
                ' AND ' +
                write(Math.max(filter.value.start, filter.value.end)));
        case '=':
        case '<>':
        case '<':
        case '<=':
        case '>':
        case '>=':
        case 'LIKE':
        case 'ILIKE':
            var property = typeof filter.property === 'object'
                ? write(filter.property)
                : wrap(unwrap(filter.property)); // unwrap first, because technically only "" is supported (so swap '' for "")
            if (filter.value === null) {
                return "".concat(property, " ").concat(filter.type);
            }
            return "".concat(property, " ").concat(filter.type, " ").concat(unwrap(filter.property) === 'id'
                ? "'".concat(filter.value, "'")
                : write(filter.value)); // don't escape ids
        // temporalClass
        case 'RELATIVE':
            // weird thing I noticed is you have to wrap the value in single quotes, double quotes don't work
            return "".concat(wrap(filter.property), " = '").concat(serialize.dateRelative(filter.value), "'");
        case 'AROUND':
            return "".concat(wrap(filter.property), " ").concat(serialize.dateAround(filter.value));
        case 'BEFORE':
        case 'AFTER':
            return (wrap(filter.property) +
                ' ' +
                filter.type +
                ' ' +
                (filter.value ? filter.value.toString(dateTimeFormat) : "''"));
        case 'DURING':
            return "".concat(wrap(filter.property), " ").concat(filter.type, " ").concat(filter.value.start, "/").concat(filter.value.end);
        // filterFunctionClass
        case 'FILTER FUNCTION proximity':
            // not sure why we need the = true part but without it the backend fails to parse
            return "proximity(".concat(write(filter.property), ",").concat(write(filter.value.distance), ",").concat(write("".concat(filter.value.first, " ").concat(filter.value.second)), ") = true");
            break;
        case 'BOOLEAN_TEXT_SEARCH':
            var booleanTextSearchFilter = filter.value;
            if (booleanTextSearchFilter.error) {
                return;
            }
            else if (booleanTextSearchFilter.cql === '') {
                return "(anyText ILIKE '*')";
            }
            else {
                return booleanTextSearchFilter.cql;
            }
            break;
        case undefined:
            if (typeof filter === 'string') {
                return translateUserqlToCql("'" + filter.replace(/'/g, "''") + "'");
            }
            else if (typeof filter === 'number') {
                return String(filter);
            }
            else if (typeof filter === 'boolean') {
                return Boolean(filter);
            }
            break;
        default:
            throw new Error("Can't encode: " + filter.type + ' ' + filter);
    }
}
function simplifyFilters(cqlAst) {
    for (var i = 0; i < cqlAst.filters.length; i++) {
        if (simplifyAst(cqlAst.filters[i], cqlAst)) {
            cqlAst.filters.splice.apply(cqlAst.filters, [i, 1].concat(cqlAst.filters[i].filters));
        }
    }
    return cqlAst;
}
/**
 * The current read function for cql produces an unoptimized tree.  While it's possible we could
 * fix the output there, I'm not sure of how.  It ends up producing very nested filter trees from
 * relatively simple cql.
 * @param cqlAst
 * @param parentNode
 */
function simplifyAst(cqlAst, parentNode) {
    if (!isFilterBuilderClass(cqlAst) && parentNode) {
        return false;
    }
    else if (!parentNode) {
        if (isFilterBuilderClass(cqlAst)) {
            simplifyFilters(cqlAst);
        }
        return cqlAst;
    }
    else {
        simplifyFilters(cqlAst);
        if (cqlAst.type === parentNode.type && !cqlAst.negated) {
            // these are the only simplifications we can make based on boolean algebra rules
            return true;
        }
        else {
            return false;
        }
    }
}
function uncollapseNOTs(_a) {
    var cqlAst = _a.cqlAst;
    if (isFilterBuilderClass(cqlAst)) {
        if (cqlAst.negated) {
            return new CQLStandardFilterBuilderClass({
                type: 'NOT',
                filters: [
                    new CQLStandardFilterBuilderClass({
                        type: cqlAst.type,
                        filters: cqlAst.filters.map(function (filter) {
                            return uncollapseNOTs({ cqlAst: filter });
                        }),
                    }),
                ],
            });
        }
        else {
            return new CQLStandardFilterBuilderClass({
                type: cqlAst.type,
                filters: cqlAst.filters.map(function (filter) {
                    return uncollapseNOTs({ cqlAst: filter });
                }),
            });
        }
    }
    else {
        if (cqlAst.negated) {
            var clonedFieldFilter = _cloneDeep(cqlAst);
            return new CQLStandardFilterBuilderClass({
                type: 'NOT',
                filters: [
                    new CQLStandardFilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass(__assign({}, clonedFieldFilter)),
                        ],
                    }),
                ],
            });
        }
        else {
            return cqlAst;
        }
    }
}
function getDataTypesConfigurationUsingStartupStore() {
    return getDataTypesConfiguration({
        Configuration: StartupDataStore.Configuration,
        MetacardDefinitions: StartupDataStore.MetacardDefinitions,
    });
}
function handleAllFilterTypes(cqlAst) {
    if (isCQLStandardFilterBuilderClass(cqlAst) || isFilterBuilderClass(cqlAst)) {
        return new CQLStandardFilterBuilderClass({
            type: cqlAst.type,
            filters: cqlAst.filters.map(function (filter) { return handleAllFilterTypes(filter); }),
        });
    }
    else if (isBasicDatatypeClass(cqlAst)) {
        var dataTypeConfiguration_1 = getDataTypesConfigurationUsingStartupStore();
        var datatypeFilters_1 = [];
        cqlAst.value.map(function (value) {
            var relevantAttributes = dataTypeConfiguration_1.valueMap[value];
            if (relevantAttributes) {
                Object.keys(relevantAttributes.attributes).map(function (attribute) {
                    var relevantValues = relevantAttributes.attributes[attribute];
                    relevantValues.forEach(function (relevantValue) {
                        datatypeFilters_1.push(new FilterClass({
                            property: attribute,
                            value: relevantValue,
                            type: 'ILIKE',
                        }));
                    });
                });
            }
        });
        return new CQLStandardFilterBuilderClass({
            type: 'AND',
            filters: [
                new CQLStandardFilterBuilderClass({
                    type: 'OR',
                    filters: datatypeFilters_1,
                }),
            ],
        });
    }
    else if (isResourceSizeFilterClass(cqlAst)) {
        var bytesValue = convertResourceSizeFilterClassValueToBytes(cqlAst);
        return new FilterClass(__assign(__assign({}, cqlAst), { value: bytesValue }));
    }
    else if (isResourceSizeRangeFilterClass(cqlAst)) {
        var bytesValue = convertResourceSizeRangeFilterClassValueToBytes(cqlAst);
        return new FilterClass(__assign(__assign({}, cqlAst), { value: bytesValue }));
    }
    else {
        return cqlAst;
    }
}
/**
 * For now, all this does is remove anyDate from cql since that's purely for the UI to track the query basic view state correctly.
 * We might want to reconsider how we do the basic query in order to avoid this necessity (it's really the checkbox).
 *
 * This will only ever happen with a specific structure, so we don't need to recurse or anything.
 */
function removeInvalidFilters(cqlAst) {
    // loop over filters, splicing out invalid ones, at end of loop if all filters gone, remove self?
    if (isFilterBuilderClass(cqlAst) ||
        shouldBeFilterBuilderClass(cqlAst) ||
        isCQLStandardFilterBuilderClass(cqlAst)) {
        var i = cqlAst.filters.length;
        while (i--) {
            var currentFilter = cqlAst.filters[i];
            var validFilter = removeInvalidFilters(currentFilter);
            if (!validFilter) {
                cqlAst.filters.splice(i, 1);
            }
        }
        if (cqlAst.filters.length === 0) {
            return false;
        }
    }
    else {
        if (cqlAst.property === 'anyDate') {
            return false;
        }
        if (cqlAst.type === 'BOOLEAN_TEXT_SEARCH') {
            var booleanTextValue = cqlAst.value;
            if (booleanTextValue.error) {
                return false;
            }
        }
    }
    return cqlAst;
}
function iterativelySimplify(cqlAst) {
    var prevAst = _cloneDeep(cqlAst);
    simplifyAst(cqlAst);
    while (JSON.stringify(prevAst) !== JSON.stringify(cqlAst)) {
        prevAst = _cloneDeep(cqlAst);
        simplifyAst(cqlAst);
    }
    return cqlAst;
}
export default {
    /**
     * This function should be used only to test reconstitution, or as a last resort to handle upgrades from a system where the filter tree is
     * no longer compatible.  No loss of accuracy will occur, but nice UX touches like remembering coordinate systems and units will.
     *
     * Also, it may group things slightly different (we do our best effort, but the postfix notation technically causes parens around everything, and from there
     * we do a simplification, which means the resulting filter tree may look simpler than you remember).  However, once again, the accuracy and
     * results returned by the search will remain the same.
     * @param cql
     */
    read: function (cql) {
        if (cql === undefined || cql.length === 0) {
            return new FilterBuilderClass({
                type: 'AND',
                filters: [],
            });
        }
        // if anything goes wrong, simply log the error and move on (return a default filter tree).
        try {
            var reconstructedFilter = this.simplify(buildAst(tokenize(cql)));
            if (isFilterBuilderClass(reconstructedFilter) ||
                shouldBeFilterBuilderClass(reconstructedFilter)) {
                return new FilterBuilderClass(reconstructedFilter);
            }
            else {
                return new FilterBuilderClass({
                    type: 'AND',
                    filters: [reconstructedFilter],
                });
            }
        }
        catch (err) {
            console.error(err);
            return new FilterBuilderClass({ type: 'AND', filters: [] });
        }
    },
    write: function (filter) {
        try {
            var standardCqlAst = handleAllFilterTypes(uncollapseNOTs({
                cqlAst: filter,
            }));
            removeInvalidFilters(standardCqlAst);
            return write(standardCqlAst);
        }
        catch (err) {
            console.error(err);
            return write(new FilterBuilderClass({
                type: 'AND',
                filters: [],
            }));
        }
    },
    removeInvalidFilters: removeInvalidFilters,
    simplify: function (cqlAst) {
        return iterativelySimplify(cqlAst);
    },
    translateCqlToUserql: translateCqlToUserql,
    translateUserqlToCql: translateUserqlToCql,
    ANYTEXT_WILDCARD: ANYTEXT_WILDCARD,
    getGeoFilters: getGeoFilters,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL2NxbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSjs7OytCQUcrQjtBQUMvQixPQUFPLEVBRUwsNkJBQTZCLEVBQzdCLFdBQVcsRUFDWCxrQkFBa0IsRUFDbEIsV0FBVyxFQUNYLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsK0JBQStCLEVBQy9CLFNBQVMsRUFDVCwwQkFBMEIsRUFFMUIsMENBQTBDLEVBQzFDLHlCQUF5QixFQUN6Qiw4QkFBOEIsRUFDOUIsK0NBQStDLEdBQ2hELE1BQU0sOENBQThDLENBQUE7QUFDckQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOERBQThELENBQUE7QUFDeEcsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQTtBQUNyQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUUxRCxJQUFNLG9CQUFvQixHQUFHLFVBQzNCLEtBQXVCLEVBQ3ZCLFFBQWdCLEVBQ2hCLE1BQWU7SUFFZixJQUFNLEtBQUssR0FBRztRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFLGFBQWE7UUFDbkIsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDYixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUNkLENBQUE7SUFFRCxPQUFPLElBQUksV0FBVyxDQUFDO1FBQ3JCLElBQUksRUFBRSxVQUFVO1FBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLHVCQUFNLEtBQUssS0FBRSxNQUFNLFFBQUEsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUEyQjtRQUN4RSxRQUFRLFVBQUE7S0FDVCxDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFNLG1CQUFtQixHQUFHLFVBQzFCLElBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLE1BQWU7SUFFZixJQUFNLEtBQUssR0FBRztRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsSUFBSTtLQUNYLENBQUE7SUFFRCxPQUFPLElBQUksV0FBVyxDQUFDO1FBQ3JCLElBQUksRUFBRSxVQUFVO1FBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU07WUFDWixDQUFDLHVCQUFNLEtBQUssS0FBRSxTQUFTLEVBQUUsTUFBTSxJQUMvQixDQUFDLENBQUMsS0FBSyxDQUEyQjtRQUNwQyxRQUFRLFVBQUE7S0FDVCxDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFNLGdCQUFnQixHQUFHLFVBQ3ZCLElBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLE1BQWU7SUFFZixJQUFNLEtBQUssR0FBRztRQUNaLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtLQUNkLENBQUE7SUFFRCxPQUFPLElBQUksV0FBVyxDQUFDO1FBQ3JCLElBQUksRUFBRSxVQUFVO1FBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU07WUFDWixDQUFDLHVCQUFNLEtBQUssS0FBRSxrQkFBa0IsRUFBRSxNQUFNLElBQ3hDLENBQUMsQ0FBQyxLQUFLLENBQTJCO1FBQ3BDLFFBQVEsVUFBQTtLQUNULENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQTtBQUNELElBQU0sZ0JBQWdCLEdBQUcsdUJBQXVCLENBQUE7QUE0QmhELElBQU0sV0FBVyxHQUNiLHVJQUF1SSxFQUN6SSxRQUFRLEdBQUc7SUFDVCxzREFBc0Q7SUFDdEQsUUFBUSxFQUFFLGlDQUFpQztJQUMzQyxVQUFVLEVBQUUsK0JBQStCO0lBQzNDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLEtBQUssRUFBRSxJQUFJO0lBQ1gsT0FBTyxFQUFFLFlBQVk7SUFDckIsS0FBSyxFQUFFLHFDQUFxQztJQUM1QyxlQUFlLEVBQUUsYUFBYTtJQUM5QixPQUFPLEVBQUUsZ0JBQWdCO0lBQ3pCLE1BQU0sRUFBRSxLQUFLO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixPQUFPLEVBQUUsNkNBQTZDO0lBQ3RELEtBQUssRUFBRSxZQUFZO0lBQ25CLEdBQUcsRUFBRSxPQUFPO0lBQ1osT0FBTyxFQUFFLFdBQVc7SUFDcEIsTUFBTSxFQUFFLFVBQVU7SUFDbEIsS0FBSyxFQUFFLFNBQVM7SUFDaEIsTUFBTSxFQUFFLFVBQVU7SUFDbEIsUUFBUSxFQUFFLCtCQUErQjtJQUN6QyxJQUFJLEVBQUUsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7SUFDMUMsV0FBVyxFQUFFLElBQUksTUFBTSxDQUNyQixHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FDcEQ7SUFDRCxRQUFRLFlBQUMsSUFBWTtRQUNuQixJQUFNLElBQUksR0FDUix3RkFBd0YsQ0FBQyxJQUFJLENBQzNGLElBQUksQ0FDTCxDQUFBO1FBQ0gsSUFBSSxJQUFJLEVBQUU7WUFDUixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBO1lBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUMzQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDWixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUE7Z0JBQ2IsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQzdCLEdBQUcsRUFBRSxDQUFBO29CQUNMLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDeEIsS0FBSyxHQUFHOzRCQUNOLEtBQUssRUFBRSxDQUFBOzRCQUNQLE1BQUs7d0JBQ1AsS0FBSyxHQUFHOzRCQUNOLEtBQUssRUFBRSxDQUFBOzRCQUNQLE1BQUs7d0JBQ1AsUUFBUTt3QkFDUiw4QkFBOEI7cUJBQy9CO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDakM7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFDRCxHQUFHLEVBQUUsSUFBSTtDQUM2QyxFQUN4RCxPQUFPLEdBQUc7SUFDUixTQUFTLEVBQUU7UUFDVCxLQUFLO1FBQ0wsVUFBVTtRQUNWLFNBQVM7UUFDVCxpQkFBaUI7UUFDakIsVUFBVTtRQUNWLFFBQVE7S0FDVDtJQUNELE1BQU0sRUFBRTtRQUNOLEtBQUs7UUFDTCxVQUFVO1FBQ1YsU0FBUztRQUNULGlCQUFpQjtRQUNqQixVQUFVO1FBQ1YsT0FBTztRQUNQLFFBQVE7S0FDVDtJQUNELE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDO0lBQ2xFLFFBQVEsRUFBRTtRQUNSLFlBQVk7UUFDWixTQUFTO1FBQ1QsT0FBTztRQUNQLFNBQVM7UUFDVCxRQUFRO1FBQ1IsT0FBTztRQUNQLFFBQVE7UUFDUixRQUFRO0tBQ1Q7SUFDRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7SUFDbEIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ3hDLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDO0lBQzVDLEtBQUssRUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztJQUNwRSxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUM7SUFDNUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQ25CLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNuQixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDakIsT0FBTyxFQUFFO1FBQ1AsaUJBQWlCO1FBQ2pCLEtBQUs7UUFDTCxPQUFPO1FBQ1AsU0FBUztRQUNULFVBQVU7UUFDVixRQUFRO0tBQ1Q7SUFDRCxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDO0lBQzNCLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7SUFDN0IsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNmLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQztJQUN2QixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQztJQUNsQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQztJQUN6QyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO0lBQzNCLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUMxRCxHQUFHLEVBQUUsRUFBRTtDQUlSLEVBQ0QsVUFBVSxHQUFHO0lBQ1gsTUFBTSxFQUFFLENBQUM7SUFDVCxPQUFPLEVBQUUsQ0FBQztJQUNWLFVBQVUsRUFBRSxDQUFDO0NBQ3FCO0FBQ3BDLCtFQUErRTtBQUMvRSx3QkFBd0IsR0FBRztJQUN6QixTQUFTLEVBQUUsQ0FBQztJQUNaLEVBQUUsRUFBRSxDQUFDO0NBQ2lDLEVBQ3hDLGNBQWMsR0FBRyw4QkFBOEIsQ0FBQTtBQUVqRCxTQUFTLFFBQVEsQ0FBQyxJQUFZLEVBQUUsT0FBMEI7SUFDeEQsSUFBSSxPQUFPLFlBQVksTUFBTSxFQUFFO1FBQzdCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMxQjtTQUFNO1FBQ0wsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckI7QUFDSCxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBWSxFQUFFLE1BQXVDO0lBQ3RFLElBQUksQ0FBQyxFQUNILEtBQUssRUFDTCxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtJQUNyQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QixLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMzQixJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ25DLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3hCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDL0QsT0FBTztnQkFDTCxJQUFJLEVBQUUsS0FBSztnQkFDWCxJQUFJLEVBQUUsS0FBSztnQkFDWCxTQUFTLFdBQUE7YUFDVixDQUFBO1NBQ0Y7S0FDRjtJQUVELElBQUksR0FBRyxHQUFHLHNCQUFzQixHQUFHLElBQUksR0FBRyxzQkFBc0IsQ0FBQTtJQUNoRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QixLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pCLEdBQUcsSUFBSSxRQUFRLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDakQ7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLENBQUM7QUFRRCxTQUFTLFFBQVEsQ0FBQyxJQUFZO0lBQzVCLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNsQixJQUFJLEtBQUssR0FBRyxTQUFrQyxDQUFBO0lBQzlDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUVqQyxHQUFHO1FBQ0QsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUE7UUFDdEIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDNUIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNyRDtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDcEIsUUFBUSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBQztJQUM5QixPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBSUQsNERBQTREO0FBQzVELElBQU0sV0FBVyxHQUFHO0lBQ2xCLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsS0FBSztJQUNWLENBQUMsRUFBRSxLQUFLO0NBQ1QsQ0FBQTtBQUVELElBQU0sb0JBQW9CLEdBQUcsVUFBQyxHQUFXO0lBQ3ZDLE9BQUEsR0FBRyxDQUFDLE9BQU8sQ0FDVCxxQkFBcUIsRUFDckIsVUFBQyxDQUFDLEVBQUUsQ0FBTSxFQUFFLENBQUM7UUFBVCxrQkFBQSxFQUFBLE1BQU07UUFDUixPQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQXlCLENBQUMsQ0FBQztJQUE3RCxDQUE2RCxDQUNoRTtBQUpELENBSUMsQ0FBQTtBQUVILDJEQUEyRDtBQUMzRCxJQUFNLFdBQVcsR0FBRztJQUNsQixHQUFHLEVBQUUsR0FBRztJQUNSLENBQUMsRUFBRSxHQUFHO0NBQ2lDLENBQUE7QUFFekMsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLEdBQVc7SUFDdkMsT0FBQSxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQU0sRUFBRSxDQUFDO1FBQVQsa0JBQUEsRUFBQSxNQUFNO1FBQ3ZDLE9BQUEsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQXlCLENBQUM7SUFBM0QsQ0FBMkQsQ0FDNUQ7QUFGRCxDQUVDLENBQUE7QUFFSCxJQUFNLFlBQVksR0FBRyxVQUFDLE9BQXlCO0lBQzdDLElBQ0UsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxpQkFBaUIsRUFDdEQ7UUFDQSx3QkFBd0I7UUFDeEIsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2IsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2IsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFlLENBQUE7S0FDbEM7SUFDRCxJQUNFLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzQixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUMvQztRQUNBLHVCQUF1QjtRQUN2QixPQUFPLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDYixPQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQWUsQ0FBQTtLQUNsQztJQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsRUFBZSxDQUFBO0FBQ25DLENBQUMsQ0FBQTtBQUVELElBQU0sYUFBYSxHQUFHLFVBQ3BCLEdBQVcsRUFDWCxRQUFnQixFQUNoQixNQUFlO0lBRWYsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7UUFDeEMsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDekMsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBUyxDQUFBO1FBQzVDLElBQU0sU0FBUyxHQUFhLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUMsUUFBYTtZQUMvRCxPQUFBLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRTtRQUEzQyxDQUEyQyxDQUM1QyxDQUFBO1FBQ0QsT0FBTyxJQUFJLGtCQUFrQixDQUFDO1lBQzVCLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQyxHQUFHLElBQUssT0FBQSxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQztTQUN0RSxDQUFDLENBQUE7S0FDSDtTQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUN2QyxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakQsT0FBTyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0tBQ25EO1NBQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7UUFDNUMsT0FBTyxJQUFJLGtCQUFrQixDQUFDO1lBQzVCLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQ3BELFVBQUMsSUFBZ0IsSUFBSyxPQUFBLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQTNDLENBQTJDLENBQ2xFO1NBQ0YsQ0FBQyxDQUFBO0tBQ0g7U0FBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDcEMsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlDLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtLQUNoRDtTQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtRQUN6QyxPQUFPLElBQUksa0JBQWtCLENBQUM7WUFDNUIsSUFBSSxFQUFFLElBQUk7WUFDVixPQUFPLEVBQUUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQWdCO2dCQUM5RCxPQUFBLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQXhDLENBQXdDLENBQ3pDO1NBQ0YsQ0FBQyxDQUFBO0tBQ0g7U0FBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDbEMsSUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hELE9BQU8sb0JBQW9CLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtLQUNyRDtTQUFNLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUN2QyxPQUFPLElBQUksa0JBQWtCLENBQUM7WUFDNUIsSUFBSSxFQUFFLElBQUk7WUFDVixPQUFPLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQXVCO2dCQUNuRSxPQUFBLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQTdDLENBQTZDLENBQzlDO1NBQ0YsQ0FBQyxDQUFBO0tBQ0g7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7QUFDckQsQ0FBQyxDQUFBO0FBRUQsU0FBUyxTQUFTLENBQUMsT0FBeUI7SUFDMUMsSUFBSSxLQUFLLEVBQ1AsUUFBUSxFQUNSLEdBQUcsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDN0IsSUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtJQUMxQixRQUFRLFNBQVMsRUFBRTtRQUNqQixLQUFLLFNBQVM7WUFDWixJQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQzVCLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDMUIsT0FBTyxJQUFJLGtCQUFrQixDQUFDO2dCQUM1QixPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO2dCQUNuQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQWdDO2FBQzNELENBQUMsQ0FBQTtRQUNKLEtBQUssS0FBSztZQUNSLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBYyxDQUFBO1lBQzFELElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ2hDLE9BQU8sSUFBSSxrQkFBa0IsdUJBQ3hCLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FDckIsT0FBTyxFQUFFLElBQUksSUFDYixDQUFBO2FBQ0g7aUJBQU0sSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtnQkFDbkMsT0FBTyxJQUFJLGtCQUFrQixDQUFDO29CQUM1QixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdCLElBQUksRUFBRSxLQUFLO29CQUNYLE9BQU8sRUFBRSxJQUFJO2lCQUNkLENBQUMsQ0FBQTthQUNIO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxXQUFXLHVCQUNqQixTQUFTLENBQUMsT0FBTyxDQUFDLEtBQ3JCLE9BQU8sRUFBRSxJQUFJLElBQ2IsQ0FBQTthQUNIO1FBQ0gsS0FBSyxTQUFTLEVBQUUsUUFBUTtZQUN0QixJQUFJLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBQSxDQUFBO1lBQ1osT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBLENBQUMsMEJBQTBCO1lBQ3hDLEdBQUcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDeEIsR0FBRyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUN4QixRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzdCLE9BQU8sSUFBSSxXQUFXLENBQUM7Z0JBQ3JCLFFBQVEsVUFBQTtnQkFDUixLQUFLLEVBQUU7b0JBQ0wsS0FBSyxFQUFFLEdBQUc7b0JBQ1YsR0FBRyxFQUFFLEdBQUc7aUJBQ2dCO2dCQUMxQixJQUFJLEVBQUUsU0FBZ0M7YUFDdkMsQ0FBQyxDQUFBO1FBQ0osS0FBSyxRQUFRLENBQUMsQ0FBQyxRQUFRO1FBQ3ZCLEtBQUssT0FBTyxFQUFFLFFBQVE7WUFDcEIsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUMxQixRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzdCLE9BQU8sSUFBSSxXQUFXLENBQUM7Z0JBQ3JCLFFBQVEsVUFBQTtnQkFDUixLQUFLLEVBQUUsS0FBMkI7Z0JBQ2xDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBeUI7YUFDcEQsQ0FBQyxDQUFBO1FBQ0osS0FBSyxRQUFRLEVBQUUsdUNBQXVDO1lBQ3BELElBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDM0MsUUFBUSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUM3QixPQUFPLElBQUksV0FBVyxDQUFDO2dCQUNyQixRQUFRLFVBQUE7Z0JBQ1IsS0FBSyxFQUFFO29CQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNmLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUNVO2dCQUN6QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQXlCO2FBQ3BELENBQUMsQ0FBQTtRQUNKLEtBQUssWUFBWSxFQUFFLFFBQVE7WUFDekIsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQTBCLENBQUE7WUFDbkQsUUFBUSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUM3QixPQUFPLElBQUksV0FBVyxDQUFDO2dCQUNyQixRQUFRLFVBQUE7Z0JBQ1IsS0FBSyxPQUFBO2dCQUNMLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBeUI7YUFDcEQsQ0FBQyxDQUFBO1FBQ0osS0FBSyxTQUFTLEVBQUUsUUFBUTtZQUN0QixRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQzdCLE9BQU8sSUFBSSxXQUFXLENBQUM7Z0JBQ3JCLFFBQVEsVUFBQTtnQkFDUixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQXlCO2FBQ3BELENBQUMsQ0FBQTtRQUNKLEtBQUssT0FBTyxFQUFFLE9BQU87WUFDbkIsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDeEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDcEMsbUJBQW1CO29CQUNuQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO2lCQUNwQztxQkFBTTtvQkFDTCxPQUFPLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7aUJBQzFEO2FBQ0Y7aUJBQU07Z0JBQ0wsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQ3hCO1FBQ0gsS0FBSyxTQUFTLEVBQUUsUUFBUTtZQUN0QixRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzlCLEtBQUssTUFBTTtvQkFDVCxPQUFPLElBQUksQ0FBQTtnQkFDYjtvQkFDRSxPQUFPLEtBQUssQ0FBQTthQUNmO1FBQ0gsS0FBSyxTQUFTLEVBQUUsVUFBVTtZQUN4Qiw0REFBNEQ7WUFDNUQsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO2dCQUNoQixLQUFLLFlBQVksQ0FBQyxDQUFDO29CQUNqQixnREFBZ0Q7b0JBQ2hELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQWUsQ0FBQTtvQkFDN0MsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBZSxDQUFBO29CQUNoRCxPQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7aUJBQ3JFO2dCQUNELEtBQUssU0FBUyxDQUFDLENBQUM7b0JBQ2Qsb0RBQW9EO29CQUNwRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFlLENBQUE7b0JBQzlDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQWUsQ0FBQTtvQkFDN0MsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBZSxDQUFBO29CQUNoRCxPQUFPLGFBQWEsQ0FDbEIsVUFBVSxDQUFDLElBQUksRUFDZixhQUFhLENBQUMsSUFBSSxFQUNsQixXQUFXLENBQUMsSUFBSSxDQUNqQixDQUFBO2lCQUNGO2dCQUNEO29CQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQTthQUN0RDtRQUNILEtBQUssVUFBVTtZQUNiLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJO2FBQ2hCLENBQUE7UUFDSCxLQUFLLFVBQVU7WUFDYixPQUFPLElBQUksV0FBVyxDQUFDO2dCQUNyQixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDekMsUUFBUSxFQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQWdCLENBQUMsSUFBSTthQUM1QyxDQUFDLENBQUE7UUFDSixLQUFLLGlCQUFpQixFQUFFLFVBQVU7WUFDaEMsSUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLHNCQUFzQjtZQUN2RSxJQUFNLFVBQVUsR0FDZCx3QkFBd0IsQ0FBQyxrQkFBeUMsQ0FBQyxDQUFBO1lBQ3JFLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxrQkFBa0IsQ0FBQyxDQUFBO2FBQ3RFO1lBQ0QsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNoRCxHQUFHLENBQUMsY0FBTSxPQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQztpQkFDN0IsT0FBTyxFQUFFLENBQUE7WUFDWixRQUFRLGtCQUFrQixFQUFFO2dCQUMxQixLQUFLLFdBQVc7b0JBQ2QsSUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFXLENBQUE7b0JBQzVDLE9BQU8sSUFBSSxXQUFXLENBQUM7d0JBQ3JCLElBQUksRUFBRSwyQkFBMkI7d0JBQ2pDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNuQixLQUFLLEVBQUU7NEJBQ0wsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3JDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN0QyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzt5QkFDTztxQkFDN0IsQ0FBQyxDQUFBO2dCQUNKO29CQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQTthQUM3QztRQUNILEtBQUssYUFBYTtZQUNoQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUE7UUFDakI7WUFDRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUE7S0FDbEI7QUFDSCxDQUFDO0FBRUQsU0FBUyxRQUFRLENBQUMsTUFBbUI7SUFDbkMsSUFBTSxhQUFhLEdBQUcsRUFBc0IsRUFDMUMsT0FBTyxHQUFHLEVBQXNCLENBQUE7SUFFbEMsT0FBTyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3BCLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQWUsQ0FBQTtRQUN2QyxRQUFRLEdBQUcsQ0FBQyxJQUFJLEVBQUU7WUFDaEIsS0FBSyxVQUFVO2dCQUNiLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUM3QixLQUFLLFVBQVUsQ0FBQztZQUNoQixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxhQUFhLENBQUM7WUFDbkIsS0FBSyxVQUFVLENBQUM7WUFDaEIsS0FBSyxTQUFTO2dCQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2pCLE1BQUs7WUFDUCxLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxTQUFTLENBQUM7WUFDZixLQUFLLFFBQVEsQ0FBQztZQUNkLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxRQUFRO2dCQUNYLElBQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBdUIsQ0FBQyxDQUFBO2dCQUVqRCxPQUNFLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDeEIsVUFBVSxDQUNSLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQXVCLENBQ2hFLElBQUksQ0FBQyxFQUNOO29CQUNBLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBZSxDQUFDLENBQUE7aUJBQy9DO2dCQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3ZCLE1BQUs7WUFDUCxLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxRQUFRO2dCQUNYLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3ZCLE1BQUs7WUFDUCxLQUFLLGlCQUFpQjtnQkFDcEIsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDdkIsK0ZBQStGO2dCQUMvRixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBZSxDQUFDLENBQUE7Z0JBQ25ELE1BQUs7WUFDUCxLQUFLLFFBQVE7Z0JBQ1gsT0FDRSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3hCLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQ3pEO29CQUNBLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBZSxDQUFDLENBQUE7aUJBQy9DO2dCQUNELGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQSxDQUFDLHNCQUFzQjtnQkFFMUMsNkZBQTZGO2dCQUM3RixpRUFBaUU7Z0JBQ2pFLElBQU0sZ0JBQWdCLEdBQ3BCLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDeEIsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO2dCQUM5QyxJQUNFLGdCQUFnQixLQUFLLFNBQVM7b0JBQzlCLGdCQUFnQixLQUFLLGlCQUFpQixFQUN0QztvQkFDQSxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQWUsQ0FBQyxDQUFBO2lCQUMvQztnQkFDRCxNQUFLO1lBQ1AsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssT0FBTztnQkFDVixNQUFLO1lBQ1A7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDcEQ7S0FDRjtJQUVELE9BQU8sYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFlLENBQUMsQ0FBQTtLQUMvQztJQUVELElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNqQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3RCLElBQUksR0FBRyxHQUFHLHlDQUF5QyxDQUFBO1FBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7U0FDdkQ7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ3JCO0lBRUQsT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDO0FBRUQsU0FBUyxJQUFJLENBQUMsUUFBZ0I7SUFDNUIsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFBO0lBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzVCLE9BQU8sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFBO0tBQ3hCO0lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUE7S0FDeEI7SUFDRCxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUMsUUFBZ0I7SUFDOUIsaUVBQWlFO0lBQ2pFLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM3RCxDQUFDO0FBRUQsbUpBQW1KO0FBQ25KLFNBQVMsS0FBSyxDQUFDLE1BQVc7SUFDeEIsUUFBUSxNQUFNLENBQUMsSUFBSSxFQUFFO1FBQ25CLGVBQWU7UUFDZixLQUFLLE1BQU07WUFDVCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUMxQixJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ3RCLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3hCLE9BQU8sQ0FDTCxPQUFPO2dCQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUNyQixHQUFHO2dCQUNILElBQUk7Z0JBQ0osR0FBRztnQkFDSCxJQUFJO2dCQUNKLEdBQUc7Z0JBQ0gsSUFBSTtnQkFDSixHQUFHO2dCQUNILElBQUk7Z0JBQ0osR0FBRyxDQUNKLENBQUE7UUFDSCx1Q0FBdUM7UUFDdkMsS0FBSyxTQUFTO1lBQ1osT0FBTyxrQkFBVyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFLLE1BQU0sQ0FBQyxLQUFLLGVBQ3RELE1BQU0sQ0FBQyxRQUFRLGNBQ04sQ0FBQTtRQUNiLHVCQUF1QjtRQUN2QixLQUFLLFFBQVE7WUFDWCxPQUFPLENBQ0wsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUNyRSxDQUFBO1FBQ0gsZ0JBQWdCO1FBQ2hCLEtBQUssWUFBWTtZQUNmLE9BQU8sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFBO1FBQzFFLHVCQUF1QjtRQUN2QixLQUFLLFVBQVU7WUFDYixPQUFPLENBQ0wsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUN2RSxDQUFBO1FBQ0gsb0dBQW9HO1FBQ3BHLDhGQUE4RjtRQUM5Riw4RUFBOEU7UUFDOUUsS0FBSyxVQUFVO1lBQ2IsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ2pFLGVBQWU7UUFDZixLQUFLLEtBQUssQ0FBQztRQUNYLEtBQUssSUFBSTtZQUNQLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQTtZQUNiLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQTtZQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLElBQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQzlDLElBQUksYUFBYSxFQUFFO29CQUNqQixJQUFJLEtBQUssRUFBRTt3QkFDVCxLQUFLLEdBQUcsS0FBSyxDQUFBO3FCQUNkO3lCQUFNO3dCQUNMLEdBQUcsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7cUJBQ2pDO29CQUNELEdBQUcsSUFBSSxhQUFhLENBQUE7aUJBQ3JCO2FBQ0Y7WUFDRCxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDbEIsS0FBSyxLQUFLO1lBQ1IscURBQXFEO1lBQ3JELHVDQUF1QztZQUN2QyxPQUFPLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtRQUNqRCxrQkFBa0I7UUFDbEIsS0FBSyxTQUFTO1lBQ1osT0FBTyxhQUFLLE1BQU0sQ0FBQyxRQUFRLGdCQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQUcsQ0FBQTtRQUNoRCxLQUFLLFNBQVM7WUFDWixPQUFPLENBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3JCLFdBQVc7Z0JBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckQsT0FBTztnQkFDUCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQ3RELENBQUE7UUFDSCxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssT0FBTztZQUNWLElBQUksUUFBUSxHQUNWLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRO2dCQUNqQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBLENBQUMsNkVBQTZFO1lBRWpILElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ3pCLE9BQU8sVUFBRyxRQUFRLGNBQUksTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFBO2FBQ3BDO1lBRUQsT0FBTyxVQUFHLFFBQVEsY0FBSSxNQUFNLENBQUMsSUFBSSxjQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUk7Z0JBQzlCLENBQUMsQ0FBQyxXQUFJLE1BQU0sQ0FBQyxLQUFLLE1BQUc7Z0JBQ3JCLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUN2QixDQUFBLENBQUMsbUJBQW1CO1FBQ3hCLGdCQUFnQjtRQUNoQixLQUFLLFVBQVU7WUFDYixpR0FBaUc7WUFDakcsT0FBTyxVQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFPLFNBQVMsQ0FBQyxZQUFZLENBQzFELE1BQU0sQ0FBQyxLQUFLLENBQ2IsTUFBRyxDQUFBO1FBQ04sS0FBSyxRQUFRO1lBQ1gsT0FBTyxVQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQTtRQUN6RSxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssT0FBTztZQUNWLE9BQU8sQ0FDTCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDckIsR0FBRztnQkFDSCxNQUFNLENBQUMsSUFBSTtnQkFDWCxHQUFHO2dCQUNILENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUM5RCxDQUFBO1FBQ0gsS0FBSyxRQUFRO1lBQ1gsT0FBTyxVQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQUksTUFBTSxDQUFDLElBQUksY0FBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssY0FDbEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQ2hCLENBQUE7UUFDSixzQkFBc0I7UUFDdEIsS0FBSywyQkFBMkI7WUFDOUIsaUZBQWlGO1lBQ2pGLE9BQU8sb0JBQWEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBSSxLQUFLLENBQ2pELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUN0QixjQUFJLEtBQUssQ0FBQyxVQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxjQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFFLENBQUMsYUFBVSxDQUFBO1lBQ3BFLE1BQUs7UUFDUCxLQUFLLHFCQUFxQjtZQUN4QixJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyxLQUF3QixDQUFBO1lBQy9ELElBQUksdUJBQXVCLENBQUMsS0FBSyxFQUFFO2dCQUNqQyxPQUFNO2FBQ1A7aUJBQU0sSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFO2dCQUM3QyxPQUFPLHFCQUFxQixDQUFBO2FBQzdCO2lCQUFNO2dCQUNMLE9BQU8sdUJBQXVCLENBQUMsR0FBRyxDQUFBO2FBQ25DO1lBQ0QsTUFBSztRQUNQLEtBQUssU0FBUztZQUNaLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUM5QixPQUFPLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTthQUNwRTtpQkFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDckMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDdEI7aUJBQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3RDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQ3ZCO1lBQ0QsTUFBSztRQUNQO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQTtLQUNqRTtBQUNILENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUEwQjtJQUNqRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDOUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ3pCLE1BQU0sQ0FBQyxPQUFPLEVBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFXLENBQUMsTUFBTSxDQUNyQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBd0IsQ0FBQyxPQUFPLENBQ2xELENBQ0YsQ0FBQTtTQUNGO0tBQ0Y7SUFDRCxPQUFPLE1BQU0sQ0FBQTtBQUNmLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFTLFdBQVcsQ0FDbEIsTUFBd0MsRUFDeEMsVUFBK0I7SUFFL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxJQUFJLFVBQVUsRUFBRTtRQUMvQyxPQUFPLEtBQUssQ0FBQTtLQUNiO1NBQU0sSUFBSSxDQUFDLFVBQVUsRUFBRTtRQUN0QixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN4QjtRQUNELE9BQU8sTUFBTSxDQUFBO0tBQ2Q7U0FBTTtRQUNMLGVBQWUsQ0FBQyxNQUE0QixDQUFDLENBQUE7UUFDN0MsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ3RELGdGQUFnRjtZQUNoRixPQUFPLElBQUksQ0FBQTtTQUNaO2FBQU07WUFDTCxPQUFPLEtBQUssQ0FBQTtTQUNiO0tBQ0Y7QUFDSCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsRUFJdkI7UUFIQyxNQUFNLFlBQUE7SUFJTixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2hDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNsQixPQUFPLElBQUksNkJBQTZCLENBQUM7Z0JBQ3ZDLElBQUksRUFBRSxLQUFLO2dCQUNYLE9BQU8sRUFBRTtvQkFDUCxJQUFJLDZCQUE2QixDQUFDO3dCQUNoQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7d0JBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07NEJBQ2pDLE9BQUEsY0FBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO3dCQUFsQyxDQUFrQyxDQUNuQztxQkFDRixDQUFDO2lCQUNIO2FBQ0YsQ0FBQyxDQUFBO1NBQ0g7YUFBTTtZQUNMLE9BQU8sSUFBSSw2QkFBNkIsQ0FBQztnQkFDdkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxNQUFNO29CQUNqQyxPQUFBLGNBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztnQkFBbEMsQ0FBa0MsQ0FDbkM7YUFDRixDQUFDLENBQUE7U0FDSDtLQUNGO1NBQU07UUFDTCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDNUMsT0FBTyxJQUFJLDZCQUE2QixDQUFDO2dCQUN2QyxJQUFJLEVBQUUsS0FBSztnQkFDWCxPQUFPLEVBQUU7b0JBQ1AsSUFBSSw2QkFBNkIsQ0FBQzt3QkFDaEMsSUFBSSxFQUFFLEtBQUs7d0JBQ1gsT0FBTyxFQUFFOzRCQUNQLElBQUksV0FBVyxjQUNWLGlCQUFpQixFQUNwQjt5QkFDSDtxQkFDRixDQUFDO2lCQUNIO2FBQ0YsQ0FBQyxDQUFBO1NBQ0g7YUFBTTtZQUNMLE9BQU8sTUFBTSxDQUFBO1NBQ2Q7S0FDRjtBQUNILENBQUM7QUFFRCxTQUFTLDBDQUEwQztJQUNqRCxPQUFPLHlCQUF5QixDQUFDO1FBQy9CLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxhQUFhO1FBQzdDLG1CQUFtQixFQUFFLGdCQUFnQixDQUFDLG1CQUFtQjtLQUMxRCxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FDM0IsTUFBd0U7SUFFeEUsSUFBSSwrQkFBK0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUMzRSxPQUFPLElBQUksNkJBQTZCLENBQUM7WUFDdkMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1lBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUE1QixDQUE0QixDQUFDO1NBQ3RFLENBQUMsQ0FBQTtLQUNIO1NBQU0sSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN2QyxJQUFNLHVCQUFxQixHQUFHLDBDQUEwQyxFQUFFLENBQUE7UUFDMUUsSUFBTSxpQkFBZSxHQUFrQixFQUFFLENBQUE7UUFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLO1lBQ3JCLElBQU0sa0JBQWtCLEdBQUcsdUJBQXFCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2hFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsU0FBUztvQkFDdkQsSUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUMvRCxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsYUFBYTt3QkFDbkMsaUJBQWUsQ0FBQyxJQUFJLENBQ2xCLElBQUksV0FBVyxDQUFDOzRCQUNkLFFBQVEsRUFBRSxTQUFTOzRCQUNuQixLQUFLLEVBQUUsYUFBYTs0QkFDcEIsSUFBSSxFQUFFLE9BQU87eUJBQ2QsQ0FBQyxDQUNILENBQUE7b0JBQ0gsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7YUFDSDtRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxJQUFJLDZCQUE2QixDQUFDO1lBQ3ZDLElBQUksRUFBRSxLQUFLO1lBQ1gsT0FBTyxFQUFFO2dCQUNQLElBQUksNkJBQTZCLENBQUM7b0JBQ2hDLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxpQkFBZTtpQkFDekIsQ0FBQzthQUNIO1NBQ0YsQ0FBQyxDQUFBO0tBQ0g7U0FBTSxJQUFJLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQzVDLElBQU0sVUFBVSxHQUFHLDBDQUEwQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3JFLE9BQU8sSUFBSSxXQUFXLHVCQUNqQixNQUFNLEtBQ1QsS0FBSyxFQUFFLFVBQVUsSUFDakIsQ0FBQTtLQUNIO1NBQU0sSUFBSSw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqRCxJQUFNLFVBQVUsR0FBRywrQ0FBK0MsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMxRSxPQUFPLElBQUksV0FBVyx1QkFDakIsTUFBTSxLQUNULEtBQUssRUFBRSxVQUFVLElBQ2pCLENBQUE7S0FDSDtTQUFNO1FBQ0wsT0FBTyxNQUFNLENBQUE7S0FDZDtBQUNILENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsb0JBQW9CLENBQzNCLE1BQXdFO0lBRXhFLGlHQUFpRztJQUNqRyxJQUNFLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztRQUM1QiwwQkFBMEIsQ0FBQyxNQUFNLENBQUM7UUFDbEMsK0JBQStCLENBQUMsTUFBTSxDQUFDLEVBQ3ZDO1FBQ0EsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFDN0IsT0FBTyxDQUFDLEVBQUUsRUFBRTtZQUNWLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDdkMsSUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdkQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQzVCO1NBQ0Y7UUFDRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQTtTQUNiO0tBQ0Y7U0FBTTtRQUNMLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDakMsT0FBTyxLQUFLLENBQUE7U0FDYjtRQUNELElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxxQkFBcUIsRUFBRTtZQUN6QyxJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxLQUF3QixDQUFBO1lBQ3hELElBQUksZ0JBQWdCLENBQUMsS0FBSyxFQUFFO2dCQUMxQixPQUFPLEtBQUssQ0FBQTthQUNiO1NBQ0Y7S0FDRjtJQUNELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsTUFBMEI7SUFDckQsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2hDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN6RCxPQUFPLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzVCLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNwQjtJQUNELE9BQU8sTUFBTSxDQUFBO0FBQ2YsQ0FBQztBQUVELGVBQWU7SUFDYjs7Ozs7Ozs7T0FRRztJQUNILElBQUksWUFBQyxHQUFZO1FBQ2YsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztnQkFDNUIsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsT0FBTyxFQUFFLEVBQUU7YUFDWixDQUFDLENBQUE7U0FDSDtRQUNELDJGQUEyRjtRQUMzRixJQUFJO1lBQ0YsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xFLElBQ0Usb0JBQW9CLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3pDLDBCQUEwQixDQUFDLG1CQUFtQixDQUFDLEVBQy9DO2dCQUNBLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO2FBQ25EO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztvQkFDNUIsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsT0FBTyxFQUFFLENBQUMsbUJBQWtDLENBQUM7aUJBQzlDLENBQUMsQ0FBQTthQUNIO1NBQ0Y7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbEIsT0FBTyxJQUFJLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtTQUM1RDtJQUNILENBQUM7SUFDRCxLQUFLLFlBQUMsTUFBMEI7UUFDOUIsSUFBSTtZQUNGLElBQU0sY0FBYyxHQUFHLG9CQUFvQixDQUN6QyxjQUFjLENBQUM7Z0JBQ2IsTUFBTSxFQUFFLE1BQU07YUFDZixDQUFDLENBQ0gsQ0FBQTtZQUNELG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQ3BDLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1NBQzdCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xCLE9BQU8sS0FBSyxDQUNWLElBQUksa0JBQWtCLENBQUM7Z0JBQ3JCLElBQUksRUFBRSxLQUFLO2dCQUNYLE9BQU8sRUFBRSxFQUFFO2FBQ1osQ0FBQyxDQUNILENBQUE7U0FDRjtJQUNILENBQUM7SUFDRCxvQkFBb0Isc0JBQUE7SUFDcEIsUUFBUSxZQUFDLE1BQTBCO1FBQ2pDLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNELG9CQUFvQixzQkFBQTtJQUNwQixvQkFBb0Isc0JBQUE7SUFDcEIsZ0JBQWdCLGtCQUFBO0lBQ2hCLGFBQWEsZUFBQTtDQUNkLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIENvcHlyaWdodCAoYykgMjAwNi0yMDE1IGJ5IE9wZW5MYXllcnMgQ29udHJpYnV0b3JzIChzZWUgYXV0aG9ycy50eHQgZm9yXG4gKiBmdWxsIGxpc3Qgb2YgY29udHJpYnV0b3JzKS4gUHVibGlzaGVkIHVuZGVyIHRoZSAyLWNsYXVzZSBCU0QgbGljZW5zZS5cbiAqIFNlZSBsaWNlbnNlLnR4dCBpbiB0aGUgT3BlbkxheWVycyBkaXN0cmlidXRpb24gb3IgcmVwb3NpdG9yeSBmb3IgdGhlXG4gKiBmdWxsIHRleHQgb2YgdGhlIGxpY2Vuc2UuICovXG5pbXBvcnQge1xuICBCb29sZWFuVGV4dFR5cGUsXG4gIENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzLFxuICBkZXNlcmlhbGl6ZSxcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbiAgaXNCYXNpY0RhdGF0eXBlQ2xhc3MsXG4gIGlzRmlsdGVyQnVpbGRlckNsYXNzLFxuICBpc0NRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzLFxuICBzZXJpYWxpemUsXG4gIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzLFxuICBWYWx1ZVR5cGVzLFxuICBjb252ZXJ0UmVzb3VyY2VTaXplRmlsdGVyQ2xhc3NWYWx1ZVRvQnl0ZXMsXG4gIGlzUmVzb3VyY2VTaXplRmlsdGVyQ2xhc3MsXG4gIGlzUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyxcbiAgY29udmVydFJlc291cmNlU2l6ZVJhbmdlRmlsdGVyQ2xhc3NWYWx1ZVRvQnl0ZXMsXG59IGZyb20gJy4uL2NvbXBvbmVudC9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbXBvbmVudC9yZXNlcnZlZC1iYXNpYy1kYXRhdHlwZS9yZXNlcnZlZC5iYXNpYy1kYXRhdHlwZSdcbmltcG9ydCBDUUxVdGlscyBmcm9tICcuL0NRTFV0aWxzJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCB3a3ggZnJvbSAnd2t4J1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuXG5jb25zdCBnZXRQb2ludFJhZGl1c0ZpbHRlciA9IChcbiAgcG9pbnQ6IFtudW1iZXIsIG51bWJlcl0sXG4gIHByb3BlcnR5OiBzdHJpbmcsXG4gIHJhZGl1cz86IHN0cmluZ1xuKSA9PiB7XG4gIGNvbnN0IHZhbHVlID0ge1xuICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgbGF0OiBwb2ludFsxXSxcbiAgICBsb246IHBvaW50WzBdLFxuICB9XG5cbiAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICB2YWx1ZTogKHJhZGl1cyA/IHsgLi4udmFsdWUsIHJhZGl1cyB9IDogdmFsdWUpIGFzIFZhbHVlVHlwZXNbJ2xvY2F0aW9uJ10sXG4gICAgcHJvcGVydHksXG4gIH0pXG59XG5cbmNvbnN0IGdldExpbmVzdHJpbmdGaWx0ZXIgPSAoXG4gIGxpbmU6IG51bWJlcltdW10sXG4gIHByb3BlcnR5OiBzdHJpbmcsXG4gIGJ1ZmZlcj86IHN0cmluZ1xuKSA9PiB7XG4gIGNvbnN0IHZhbHVlID0ge1xuICAgIG1vZGU6ICdsaW5lJyxcbiAgICB0eXBlOiAnTElORScsXG4gICAgbGluZTogbGluZSxcbiAgfVxuXG4gIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgdmFsdWU6IChidWZmZXJcbiAgICAgID8geyAuLi52YWx1ZSwgbGluZVdpZHRoOiBidWZmZXIgfVxuICAgICAgOiB2YWx1ZSkgYXMgVmFsdWVUeXBlc1snbG9jYXRpb24nXSxcbiAgICBwcm9wZXJ0eSxcbiAgfSlcbn1cblxuY29uc3QgZ2V0UG9seWdvbkZpbHRlciA9IChcbiAgcG9seTogbnVtYmVyW11bXSxcbiAgcHJvcGVydHk6IHN0cmluZyxcbiAgYnVmZmVyPzogc3RyaW5nXG4pID0+IHtcbiAgY29uc3QgdmFsdWUgPSB7XG4gICAgbW9kZTogJ3BvbHknLFxuICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICBwb2x5Z29uOiBwb2x5LFxuICB9XG5cbiAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICB2YWx1ZTogKGJ1ZmZlclxuICAgICAgPyB7IC4uLnZhbHVlLCBwb2x5Z29uQnVmZmVyV2lkdGg6IGJ1ZmZlciB9XG4gICAgICA6IHZhbHVlKSBhcyBWYWx1ZVR5cGVzWydsb2NhdGlvbiddLFxuICAgIHByb3BlcnR5LFxuICB9KVxufVxuY29uc3QgQU5ZVEVYVF9XSUxEQ0FSRCA9ICdcImFueVRleHRcIiBJTElLRSBcXCclXFwnJ1xudHlwZSBQcmVjZW5kZW5jZVR5cGUgPSAnUlBBUkVOJyB8ICdMT0dJQ0FMJyB8ICdDT01QQVJJU09OJ1xudHlwZSBGaWx0ZXJGdW5jdGlvbk5hbWVzID0gJ3Byb3hpbWl0eScgfCAncGknXG50eXBlIFBhdHRlcm5SZXR1cm5UeXBlID0gUmVnRXhwIHwgKCh0ZXh0OiBzdHJpbmcpID0+IHN0cmluZ1tdIHwgbnVsbClcblxudHlwZSBQYXR0ZXJuTmFtZXNUeXBlID1cbiAgfCAnUFJPUEVSVFknXG4gIHwgJ0NPTVBBUklTT04nXG4gIHwgJ0lTX05VTEwnXG4gIHwgJ0NPTU1BJ1xuICB8ICdMT0dJQ0FMJ1xuICB8ICdWQUxVRSdcbiAgfCAnRklMVEVSX0ZVTkNUSU9OJ1xuICB8ICdCT09MRUFOJ1xuICB8ICdMUEFSRU4nXG4gIHwgJ1JQQVJFTidcbiAgfCAnU1BBVElBTCdcbiAgfCAnVU5JVFMnXG4gIHwgJ05PVCdcbiAgfCAnQkVUV0VFTidcbiAgfCAnQkVGT1JFJ1xuICB8ICdBRlRFUidcbiAgfCAnRFVSSU5HJ1xuICB8ICdSRUxBVElWRSdcbiAgfCAnVElNRSdcbiAgfCAnVElNRV9QRVJJT0QnXG4gIHwgJ0dFT01FVFJZJ1xuXG5jb25zdCB0aW1lUGF0dGVybiA9XG4gICAgLygoKFswLTldezR9KSgtKFswLTldezJ9KSgtKFswLTldezJ9KShUKFswLTldezJ9KTooWzAtOV17Mn0pKDooWzAtOV17Mn0pKFxcLihbMC05XSspKT8pPyhafCgoWy0rXSkoWzAtOV17Mn0pOihbMC05XXsyfSkpKT8pPyk/KT8pfF4nJykvaSxcbiAgcGF0dGVybnMgPSB7XG4gICAgLy9BbGxvd3MgZm9yIG5vbi1zdGFuZGFyZCBzaW5nbGUtcXVvdGVkIHByb3BlcnR5IG5hbWVzXG4gICAgUFJPUEVSVFk6IC9eKFtfYS16QS1aXVxcdyp8XCJbXlwiXStcInwnW14nXSsnKS8sXG4gICAgQ09NUEFSSVNPTjogL14oPXw8Pnw8PXw8fD49fD58TElLRXxJTElLRSkvaSxcbiAgICBJU19OVUxMOiAvXklTIE5VTEwvaSxcbiAgICBDT01NQTogL14sLyxcbiAgICBMT0dJQ0FMOiAvXihBTkR8T1IpL2ksXG4gICAgVkFMVUU6IC9eKCcoW14nXXwnJykqJ3wtP1xcZCsoXFwuXFxkKik/fFxcLlxcZCspLyxcbiAgICBGSUxURVJfRlVOQ1RJT046IC9eW2Etel1cXHcrXFwoLyxcbiAgICBCT09MRUFOOiAvXihmYWxzZXx0cnVlKS9pLFxuICAgIExQQVJFTjogL15cXCgvLFxuICAgIFJQQVJFTjogL15cXCkvLFxuICAgIFNQQVRJQUw6IC9eKEJCT1h8SU5URVJTRUNUU3xEV0lUSElOfFdJVEhJTnxDT05UQUlOUykvaSxcbiAgICBVTklUUzogL14obWV0ZXJzKS9pLFxuICAgIE5PVDogL15OT1QvaSxcbiAgICBCRVRXRUVOOiAvXkJFVFdFRU4vaSxcbiAgICBCRUZPUkU6IC9eQkVGT1JFL2ksXG4gICAgQUZURVI6IC9eQUZURVIvaSxcbiAgICBEVVJJTkc6IC9eRFVSSU5HL2ksXG4gICAgUkVMQVRJVkU6IC9eJ1JFTEFUSVZFXFwoW0EtWmEtejAtOS5dKlxcKScvaSxcbiAgICBUSU1FOiBuZXcgUmVnRXhwKCdeJyArIHRpbWVQYXR0ZXJuLnNvdXJjZSksXG4gICAgVElNRV9QRVJJT0Q6IG5ldyBSZWdFeHAoXG4gICAgICAnXicgKyB0aW1lUGF0dGVybi5zb3VyY2UgKyAnLycgKyB0aW1lUGF0dGVybi5zb3VyY2VcbiAgICApLFxuICAgIEdFT01FVFJZKHRleHQ6IHN0cmluZykge1xuICAgICAgY29uc3QgdHlwZSA9XG4gICAgICAgIC9eKFBPSU5UfExJTkVTVFJJTkd8UE9MWUdPTnxNVUxUSVBPSU5UfE1VTFRJTElORVNUUklOR3xNVUxUSVBPTFlHT058R0VPTUVUUllDT0xMRUNUSU9OKS8uZXhlYyhcbiAgICAgICAgICB0ZXh0XG4gICAgICAgIClcbiAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHRleHQubGVuZ3RoXG4gICAgICAgIGxldCBpZHggPSB0ZXh0LmluZGV4T2YoJygnLCB0eXBlWzBdLmxlbmd0aClcbiAgICAgICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICAgICAgbGV0IGRlcHRoID0gMVxuICAgICAgICAgIHdoaWxlIChpZHggPCBsZW4gJiYgZGVwdGggPiAwKSB7XG4gICAgICAgICAgICBpZHgrK1xuICAgICAgICAgICAgc3dpdGNoICh0ZXh0LmNoYXJBdChpZHgpKSB7XG4gICAgICAgICAgICAgIGNhc2UgJygnOlxuICAgICAgICAgICAgICAgIGRlcHRoKytcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlICcpJzpcbiAgICAgICAgICAgICAgICBkZXB0aC0tXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgLy8gaW4gZGVmYXVsdCBjYXNlLCBkbyBub3RoaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbdGV4dC5zdWJzdHIoMCwgaWR4ICsgMSldXG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0sXG4gICAgRU5EOiAvXiQvLFxuICB9IGFzIFJlY29yZDxQYXR0ZXJuTmFtZXNUeXBlIHwgJ0VORCcsIFBhdHRlcm5SZXR1cm5UeXBlPixcbiAgZm9sbG93cyA9IHtcbiAgICBST09UX05PREU6IFtcbiAgICAgICdOT1QnLFxuICAgICAgJ0dFT01FVFJZJyxcbiAgICAgICdTUEFUSUFMJyxcbiAgICAgICdGSUxURVJfRlVOQ1RJT04nLFxuICAgICAgJ1BST1BFUlRZJyxcbiAgICAgICdMUEFSRU4nLFxuICAgIF0sXG4gICAgTFBBUkVOOiBbXG4gICAgICAnTk9UJyxcbiAgICAgICdHRU9NRVRSWScsXG4gICAgICAnU1BBVElBTCcsXG4gICAgICAnRklMVEVSX0ZVTkNUSU9OJyxcbiAgICAgICdQUk9QRVJUWScsXG4gICAgICAnVkFMVUUnLFxuICAgICAgJ0xQQVJFTicsXG4gICAgXSxcbiAgICBSUEFSRU46IFsnTk9UJywgJ0xPR0lDQUwnLCAnRU5EJywgJ1JQQVJFTicsICdDT01QQVJJU09OJywgJ0NPTU1BJ10sXG4gICAgUFJPUEVSVFk6IFtcbiAgICAgICdDT01QQVJJU09OJyxcbiAgICAgICdCRVRXRUVOJyxcbiAgICAgICdDT01NQScsXG4gICAgICAnSVNfTlVMTCcsXG4gICAgICAnQkVGT1JFJyxcbiAgICAgICdBRlRFUicsXG4gICAgICAnRFVSSU5HJyxcbiAgICAgICdSUEFSRU4nLFxuICAgIF0sXG4gICAgQkVUV0VFTjogWydWQUxVRSddLFxuICAgIElTX05VTEw6IFsnUlBBUkVOJywgJ0xPR0lDQUwnLCAnWycsICddJ10sXG4gICAgQ09NUEFSSVNPTjogWydSRUxBVElWRScsICdWQUxVRScsICdCT09MRUFOJ10sXG4gICAgQ09NTUE6IFsnRklMVEVSX0ZVTkNUSU9OJywgJ0dFT01FVFJZJywgJ1ZBTFVFJywgJ1VOSVRTJywgJ1BST1BFUlRZJ10sXG4gICAgVkFMVUU6IFsnTE9HSUNBTCcsICdDT01NQScsICdSUEFSRU4nLCAnRU5EJ10sXG4gICAgQk9PTEVBTjogWydSUEFSRU4nXSxcbiAgICBTUEFUSUFMOiBbJ0xQQVJFTiddLFxuICAgIFVOSVRTOiBbJ1JQQVJFTiddLFxuICAgIExPR0lDQUw6IFtcbiAgICAgICdGSUxURVJfRlVOQ1RJT04nLFxuICAgICAgJ05PVCcsXG4gICAgICAnVkFMVUUnLFxuICAgICAgJ1NQQVRJQUwnLFxuICAgICAgJ1BST1BFUlRZJyxcbiAgICAgICdMUEFSRU4nLFxuICAgIF0sXG4gICAgTk9UOiBbJ1BST1BFUlRZJywgJ0xQQVJFTiddLFxuICAgIEdFT01FVFJZOiBbJ0NPTU1BJywgJ1JQQVJFTiddLFxuICAgIEJFRk9SRTogWydUSU1FJ10sXG4gICAgQUZURVI6IFsnVElNRSddLFxuICAgIERVUklORzogWydUSU1FX1BFUklPRCddLFxuICAgIFRJTUU6IFsnTE9HSUNBTCcsICdSUEFSRU4nLCAnRU5EJ10sXG4gICAgVElNRV9QRVJJT0Q6IFsnTE9HSUNBTCcsICdSUEFSRU4nLCAnRU5EJ10sXG4gICAgUkVMQVRJVkU6IFsnUlBBUkVOJywgJ0VORCddLFxuICAgIEZJTFRFUl9GVU5DVElPTjogWydMUEFSRU4nLCAnUFJPUEVSVFknLCAnVkFMVUUnLCAnUlBBUkVOJ10sXG4gICAgRU5EOiBbXSxcbiAgfSBhcyBSZWNvcmQ8XG4gICAgUGF0dGVybk5hbWVzVHlwZSB8ICdST09UX05PREUnIHwgJ0VORCcsXG4gICAgQXJyYXk8UGF0dGVybk5hbWVzVHlwZSB8ICdFTkQnPlxuICA+LFxuICBwcmVjZWRlbmNlID0ge1xuICAgIFJQQVJFTjogMyxcbiAgICBMT0dJQ0FMOiAyLFxuICAgIENPTVBBUklTT046IDEsXG4gIH0gYXMgUmVjb3JkPFByZWNlbmRlbmNlVHlwZSwgbnVtYmVyPixcbiAgLy8gYXMgYW4gaW1wcm92ZW1lbnQsIHRoZXNlIGNvdWxkIGJlIGZpZ3VyZWQgb3V0IHdoaWxlIGJ1aWxkaW5nIHRoZSBzeW50YXggdHJlZVxuICBmaWx0ZXJGdW5jdGlvblBhcmFtQ291bnQgPSB7XG4gICAgcHJveGltaXR5OiAzLFxuICAgIHBpOiAwLFxuICB9IGFzIFJlY29yZDxGaWx0ZXJGdW5jdGlvbk5hbWVzLCBudW1iZXI+LFxuICBkYXRlVGltZUZvcm1hdCA9IFwieXl5eS1NTS1kZCdUJ0hIOm1tOnNzLlNTUydaJ1wiXG5cbmZ1bmN0aW9uIHRyeVRva2VuKHRleHQ6IHN0cmluZywgcGF0dGVybjogUGF0dGVyblJldHVyblR5cGUpIHtcbiAgaWYgKHBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gcGF0dGVybi5leGVjKHRleHQpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhdHRlcm4odGV4dClcbiAgfVxufVxuXG5mdW5jdGlvbiBuZXh0VG9rZW4odGV4dDogc3RyaW5nLCB0b2tlbnM6IEFycmF5PFBhdHRlcm5OYW1lc1R5cGUgfCAnRU5EJz4pIHtcbiAgbGV0IGksXG4gICAgdG9rZW4sXG4gICAgbGVuID0gdG9rZW5zLmxlbmd0aFxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB0b2tlbiA9IHRva2Vuc1tpXVxuICAgIGNvbnN0IHBhdCA9IHBhdHRlcm5zW3Rva2VuXVxuICAgIGNvbnN0IG1hdGNoZXMgPSB0cnlUb2tlbih0ZXh0LCBwYXQpXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gbWF0Y2hlc1swXVxuICAgICAgY29uc3QgcmVtYWluZGVyID0gdGV4dC5zdWJzdHIobWF0Y2gubGVuZ3RoKS5yZXBsYWNlKC9eXFxzKi8sICcnKVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogdG9rZW4sXG4gICAgICAgIHRleHQ6IG1hdGNoLFxuICAgICAgICByZW1haW5kZXIsXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IG1zZyA9ICdFUlJPUjogSW4gcGFyc2luZzogWycgKyB0ZXh0ICsgJ10sIGV4cGVjdGVkIG9uZSBvZjogJ1xuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB0b2tlbiA9IHRva2Vuc1tpXVxuICAgIG1zZyArPSAnXFxuICAgICcgKyB0b2tlbiArICc6ICcgKyBwYXR0ZXJuc1t0b2tlbl1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihtc2cpXG59XG5cbnR5cGUgVG9rZW5UeXBlID0ge1xuICB0eXBlOiBQYXR0ZXJuTmFtZXNUeXBlIHwgJ0VORCdcbiAgdGV4dDogc3RyaW5nXG4gIHJlbWFpbmRlcjogc3RyaW5nXG59XG5cbmZ1bmN0aW9uIHRva2VuaXplKHRleHQ6IHN0cmluZyk6IEFycmF5PFRva2VuVHlwZT4ge1xuICBjb25zdCByZXN1bHRzID0gW11cbiAgbGV0IHRva2VuID0gdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IFRva2VuVHlwZVxuICBsZXQgZXhwZWN0ID0gZm9sbG93c1snUk9PVF9OT0RFJ11cblxuICBkbyB7XG4gICAgdG9rZW4gPSBuZXh0VG9rZW4odGV4dCwgZXhwZWN0KVxuICAgIHRleHQgPSB0b2tlbi5yZW1haW5kZXJcbiAgICBleHBlY3QgPSBmb2xsb3dzW3Rva2VuLnR5cGVdXG4gICAgaWYgKHRva2VuLnR5cGUgIT09ICdFTkQnICYmICFleHBlY3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZm9sbG93cyBsaXN0IGZvciAnICsgdG9rZW4udHlwZSlcbiAgICB9XG4gICAgcmVzdWx0cy5wdXNoKHRva2VuKVxuICB9IHdoaWxlICh0b2tlbi50eXBlICE9PSAnRU5EJylcbiAgcmV0dXJuIHJlc3VsdHNcbn1cblxudHlwZSBTcGVjaWFsQ1FMQ2hhcmFjdGVycyA9ICclJyB8ICdfJ1xuXG4vLyBNYXBwaW5nIG9mIEludHJpZ3VlJ3MgcXVlcnkgbGFuZ3VhZ2Ugc3ludGF4IHRvIENRTCBzeW50YXhcbmNvbnN0IHVzZXJxbFRvQ3FsID0ge1xuICAnKic6ICclJyxcbiAgJz8nOiAnXycsXG4gICclJzogJ1xcXFwlJyxcbiAgXzogJ1xcXFxfJyxcbn1cblxuY29uc3QgdHJhbnNsYXRlVXNlcnFsVG9DcWwgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLnJlcGxhY2UoXG4gICAgLyhbXio/JV9dKT8oWyo/JV9dKS9nLFxuICAgIChfLCBhID0gJycsIGIpID0+XG4gICAgICBhICsgKGEgPT09ICdcXFxcJyA/IGIgOiB1c2VycWxUb0NxbFtiIGFzIFNwZWNpYWxDUUxDaGFyYWN0ZXJzXSlcbiAgKVxuXG4vL01hcHBpbmcgb2YgQ1FMIHN5bnRheCB0byBJbnRyaWd1ZSdzIHF1ZXJ5IGxhbmd1YWdlIHN5bnRheFxuY29uc3QgY3FsVG9Vc2VycWwgPSB7XG4gICclJzogJyonLFxuICBfOiAnPycsXG59IGFzIFJlY29yZDxTcGVjaWFsQ1FMQ2hhcmFjdGVycywgc3RyaW5nPlxuXG5jb25zdCB0cmFuc2xhdGVDcWxUb1VzZXJxbCA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIucmVwbGFjZSgvKFteJV9dKT8oWyVfXSkvZywgKF8sIGEgPSAnJywgYikgPT5cbiAgICBhID09PSAnXFxcXCcgPyBiIDogYSArIGNxbFRvVXNlcnFsW2IgYXMgU3BlY2lhbENRTENoYXJhY3RlcnNdXG4gIClcblxuY29uc3QgZ2V0TmV4dFRva2VuID0gKHBvc3RmaXg6IEFycmF5PFRva2VuVHlwZT4pOiBUb2tlblR5cGUgPT4ge1xuICBpZiAoXG4gICAgcG9zdGZpeFtwb3N0Zml4Lmxlbmd0aCAtIDNdICYmXG4gICAgcG9zdGZpeFtwb3N0Zml4Lmxlbmd0aCAtIDNdLnR5cGUgPT09ICdGSUxURVJfRlVOQ1RJT04nXG4gICkge1xuICAgIC8vIGZpcnN0IHR3byBhcmUgdXNlbGVzc1xuICAgIHBvc3RmaXgucG9wKClcbiAgICBwb3N0Zml4LnBvcCgpXG4gICAgcmV0dXJuIHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gIH1cbiAgaWYgKFxuICAgIHBvc3RmaXhbcG9zdGZpeC5sZW5ndGggLSAyXSAmJlxuICAgIHBvc3RmaXhbcG9zdGZpeC5sZW5ndGggLSAyXS50eXBlID09PSAnUkVMQVRJVkUnXG4gICkge1xuICAgIC8vIGZpcnN0IG9uZSBpcyB1c2VsZXNzXG4gICAgcG9zdGZpeC5wb3AoKVxuICAgIHJldHVybiBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICB9XG4gIHJldHVybiBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxufVxuXG5jb25zdCBnZXRHZW9GaWx0ZXJzID0gKFxuICB3a3Q6IHN0cmluZyxcbiAgcHJvcGVydHk6IHN0cmluZyxcbiAgYnVmZmVyPzogc3RyaW5nXG4pOiBGaWx0ZXJDbGFzcyB8IEZpbHRlckJ1aWxkZXJDbGFzcyA9PiB7XG4gIGlmICh3a3Quc3RhcnRzV2l0aCgnR0VPTUVUUllDT0xMRUNUSU9OJykpIHtcbiAgICBjb25zdCBwYXJzZWRXa3QgPSB3a3guR2VvbWV0cnkucGFyc2Uod2t0KVxuICAgIGNvbnN0IGdlb0pzb24gPSBwYXJzZWRXa3QudG9HZW9KU09OKCkgYXMgYW55XG4gICAgY29uc3QgaW5uZXJXa3RzOiBzdHJpbmdbXSA9IGdlb0pzb24uZ2VvbWV0cmllcy5tYXAoKGdlb21ldHJ5OiBhbnkpID0+XG4gICAgICB3a3guR2VvbWV0cnkucGFyc2VHZW9KU09OKGdlb21ldHJ5KS50b1drdCgpXG4gICAgKVxuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdPUicsXG4gICAgICBmaWx0ZXJzOiBpbm5lcldrdHMubWFwKCh3a3QpID0+IGdldEdlb0ZpbHRlcnMod2t0LCBwcm9wZXJ0eSwgYnVmZmVyKSksXG4gICAgfSlcbiAgfSBlbHNlIGlmICh3a3Quc3RhcnRzV2l0aCgnTElORVNUUklORycpKSB7XG4gICAgY29uc3QgbGluZSA9IENRTFV0aWxzLmFycmF5RnJvbUxpbmVzdHJpbmdXa3Qod2t0KVxuICAgIHJldHVybiBnZXRMaW5lc3RyaW5nRmlsdGVyKGxpbmUsIHByb3BlcnR5LCBidWZmZXIpXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ01VTFRJTElORVNUUklORycpKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ09SJyxcbiAgICAgIGZpbHRlcnM6IENRTFV0aWxzLmFycmF5RnJvbU11bHRpbGluZXN0cmluZ1drdCh3a3QpLm1hcChcbiAgICAgICAgKGxpbmU6IG51bWJlcltdW10pID0+IGdldExpbmVzdHJpbmdGaWx0ZXIobGluZSwgcHJvcGVydHksIGJ1ZmZlcilcbiAgICAgICksXG4gICAgfSlcbiAgfSBlbHNlIGlmICh3a3Quc3RhcnRzV2l0aCgnUE9MWUdPTicpKSB7XG4gICAgY29uc3QgcG9seSA9IENRTFV0aWxzLmFycmF5RnJvbVBvbHlnb25Xa3Qod2t0KVxuICAgIHJldHVybiBnZXRQb2x5Z29uRmlsdGVyKHBvbHksIHByb3BlcnR5LCBidWZmZXIpXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ01VTFRJUE9MWUdPTicpKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ09SJyxcbiAgICAgIGZpbHRlcnM6IENRTFV0aWxzLmFycmF5RnJvbVBvbHlnb25Xa3Qod2t0KS5tYXAoKHBvbHk6IG51bWJlcltdW10pID0+XG4gICAgICAgIGdldFBvbHlnb25GaWx0ZXIocG9seSwgcHJvcGVydHksIGJ1ZmZlcilcbiAgICAgICksXG4gICAgfSlcbiAgfSBlbHNlIGlmICh3a3Quc3RhcnRzV2l0aCgnUE9JTlQnKSkge1xuICAgIGNvbnN0IHBvaW50ID0gQ1FMVXRpbHMuYXJyYXlGcm9tUG9pbnRXa3Qod2t0KVswXVxuICAgIHJldHVybiBnZXRQb2ludFJhZGl1c0ZpbHRlcihwb2ludCwgcHJvcGVydHksIGJ1ZmZlcilcbiAgfSBlbHNlIGlmICh3a3Quc3RhcnRzV2l0aCgnTVVMVElQT0lOVCcpKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogJ09SJyxcbiAgICAgIGZpbHRlcnM6IENRTFV0aWxzLmFycmF5RnJvbVBvaW50V2t0KHdrdCkubWFwKChwb2ludDogW251bWJlciwgbnVtYmVyXSkgPT5cbiAgICAgICAgZ2V0UG9pbnRSYWRpdXNGaWx0ZXIocG9pbnQsIHByb3BlcnR5LCBidWZmZXIpXG4gICAgICApLFxuICAgIH0pXG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHNwYXRpYWwgdHlwZSBlbmNvdW50ZXJlZCcpXG59XG5cbmZ1bmN0aW9uIGJ1aWxkVHJlZShwb3N0Zml4OiBBcnJheTxUb2tlblR5cGU+KTogYW55IHtcbiAgbGV0IHZhbHVlLFxuICAgIHByb3BlcnR5LFxuICAgIHRvayA9IGdldE5leHRUb2tlbihwb3N0Zml4KVxuICBjb25zdCB0b2tlblR5cGUgPSB0b2sudHlwZVxuICBzd2l0Y2ggKHRva2VuVHlwZSkge1xuICAgIGNhc2UgJ0xPR0lDQUwnOlxuICAgICAgY29uc3QgcmhzID0gYnVpbGRUcmVlKHBvc3RmaXgpLFxuICAgICAgICBsaHMgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW2xocywgcmhzXSxcbiAgICAgICAgdHlwZTogdG9rLnRleHQudG9VcHBlckNhc2UoKSBhcyBGaWx0ZXJCdWlsZGVyQ2xhc3NbJ3R5cGUnXSxcbiAgICAgIH0pXG4gICAgY2FzZSAnTk9UJzpcbiAgICAgIGNvbnN0IHBlZWtUb2tlbiA9IHBvc3RmaXhbcG9zdGZpeC5sZW5ndGggLSAxXSBhcyBUb2tlblR5cGVcbiAgICAgIGlmIChwZWVrVG9rZW4udHlwZSA9PT0gJ0xPR0lDQUwnKSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAuLi5idWlsZFRyZWUocG9zdGZpeCksXG4gICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAocGVla1Rva2VuLnR5cGUgPT09ICdOT1QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICBmaWx0ZXJzOiBbYnVpbGRUcmVlKHBvc3RmaXgpXSxcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgLi4uYnVpbGRUcmVlKHBvc3RmaXgpLFxuICAgICAgICAgIG5lZ2F0ZWQ6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgY2FzZSAnQkVUV0VFTic6IC8vIHdvcmtzXG4gICAgICBsZXQgbWluLCBtYXhcbiAgICAgIHBvc3RmaXgucG9wKCkgLy8gdW5uZWVkZWQgQU5EIHRva2VuIGhlcmVcbiAgICAgIG1heCA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgbWluID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICBwcm9wZXJ0eSA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5LFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIHN0YXJ0OiBtaW4sXG4gICAgICAgICAgZW5kOiBtYXgsXG4gICAgICAgIH0gYXMgVmFsdWVUeXBlc1snYmV0d2VlbiddLFxuICAgICAgICB0eXBlOiB0b2tlblR5cGUgYXMgRmlsdGVyQ2xhc3NbJ3R5cGUnXSxcbiAgICAgIH0pXG4gICAgY2FzZSAnQkVGT1JFJzogLy8gd29ya3NcbiAgICBjYXNlICdBRlRFUic6IC8vIHdvcmtzXG4gICAgICB2YWx1ZSA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgcHJvcGVydHkgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgdmFsdWU6IHZhbHVlIGFzIFZhbHVlVHlwZXNbJ2RhdGUnXSxcbiAgICAgICAgdHlwZTogdG9rLnRleHQudG9VcHBlckNhc2UoKSBhcyBGaWx0ZXJDbGFzc1sndHlwZSddLFxuICAgICAgfSlcbiAgICBjYXNlICdEVVJJTkcnOiAvLyB0ZWNobmljYWxseSBiZXR3ZWVuIGZvciBkYXRlcywgd29ya3NcbiAgICAgIGNvbnN0IGRhdGVzID0gYnVpbGRUcmVlKHBvc3RmaXgpLnNwbGl0KCcvJylcbiAgICAgIHByb3BlcnR5ID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgc3RhcnQ6IGRhdGVzWzBdLFxuICAgICAgICAgIGVuZDogZGF0ZXNbMV0sXG4gICAgICAgIH0gYXMgVmFsdWVUeXBlc1snZHVyaW5nJ10sXG4gICAgICAgIHR5cGU6IHRvay50ZXh0LnRvVXBwZXJDYXNlKCkgYXMgRmlsdGVyQ2xhc3NbJ3R5cGUnXSxcbiAgICAgIH0pXG4gICAgY2FzZSAnQ09NUEFSSVNPTic6IC8vIHdvcmtzXG4gICAgICB2YWx1ZSA9IGJ1aWxkVHJlZShwb3N0Zml4KSBhcyBWYWx1ZVR5cGVzWydpbnRlZ2VyJ11cbiAgICAgIHByb3BlcnR5ID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB0eXBlOiB0b2sudGV4dC50b1VwcGVyQ2FzZSgpIGFzIEZpbHRlckNsYXNzWyd0eXBlJ10sXG4gICAgICB9KVxuICAgIGNhc2UgJ0lTX05VTEwnOiAvLyB3b3Jrc1xuICAgICAgcHJvcGVydHkgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgdHlwZTogdG9rLnRleHQudG9VcHBlckNhc2UoKSBhcyBGaWx0ZXJDbGFzc1sndHlwZSddLFxuICAgICAgfSlcbiAgICBjYXNlICdWQUxVRSc6IC8vd29ya3NcbiAgICAgIGNvbnN0IG1hdGNoID0gdG9rLnRleHQubWF0Y2goL14nKC4qKSckLylcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBpZiAodW53cmFwKHBvc3RmaXhbMF0udGV4dCkgPT09ICdpZCcpIHtcbiAgICAgICAgICAvLyBkb24ndCBlc2NhcGUgaWRzXG4gICAgICAgICAgcmV0dXJuIG1hdGNoWzFdLnJlcGxhY2UoLycnL2csIFwiJ1wiKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0cmFuc2xhdGVDcWxUb1VzZXJxbChtYXRjaFsxXS5yZXBsYWNlKC8nJy9nLCBcIidcIikpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIodG9rLnRleHQpXG4gICAgICB9XG4gICAgY2FzZSAnQk9PTEVBTic6IC8vIHdvcmtzXG4gICAgICBzd2l0Y2ggKHRvay50ZXh0LnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnVFJVRSc6XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICBjYXNlICdTUEFUSUFMJzogLy8gd29ya2luZ1xuICAgICAgLy8gbmV4dCB0b2tlbiB0ZWxscyB1cyB3aGV0aGVyIHRoaXMgaXMgRFdJVEhJTiBvciBJTlRFUlNFQ1RTXG4gICAgICBzd2l0Y2ggKHRvay50ZXh0KSB7XG4gICAgICAgIGNhc2UgJ0lOVEVSU0VDVFMnOiB7XG4gICAgICAgICAgLy8gdGhpbmdzIHdpdGhvdXQgYnVmZmVycywgY291bGQgYmUgcG9seSBvciBsaW5lXG4gICAgICAgICAgY29uc3QgdmFsdWVUb2tlbiA9IHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gICAgICAgICAgY29uc3QgcHJvcGVydHlUb2tlbiA9IHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gICAgICAgICAgcmV0dXJuIGdldEdlb0ZpbHRlcnModmFsdWVUb2tlbi50ZXh0LCBwcm9wZXJ0eVRva2VuLnRleHQsIHVuZGVmaW5lZClcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdEV0lUSElOJzoge1xuICAgICAgICAgIC8vIHRoaW5ncyB3aXRoIGJ1ZmZlcnMsIGNvdWxkIGJlIHBvbHksIGxpbmUgb3IgcG9pbnRcbiAgICAgICAgICBjb25zdCBidWZmZXJUb2tlbiA9IHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gICAgICAgICAgY29uc3QgdmFsdWVUb2tlbiA9IHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gICAgICAgICAgY29uc3QgcHJvcGVydHlUb2tlbiA9IHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlXG4gICAgICAgICAgcmV0dXJuIGdldEdlb0ZpbHRlcnMoXG4gICAgICAgICAgICB2YWx1ZVRva2VuLnRleHQsXG4gICAgICAgICAgICBwcm9wZXJ0eVRva2VuLnRleHQsXG4gICAgICAgICAgICBidWZmZXJUb2tlbi50ZXh0XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHNwYXRpYWwgdHlwZSBlbmNvdW50ZXJlZCcpXG4gICAgICB9XG4gICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogdG9rZW5UeXBlLFxuICAgICAgICB2YWx1ZTogdG9rLnRleHQsXG4gICAgICB9XG4gICAgY2FzZSAnUkVMQVRJVkUnOlxuICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdSRUxBVElWRScsXG4gICAgICAgIHZhbHVlOiBkZXNlcmlhbGl6ZS5kYXRlUmVsYXRpdmUodG9rLnRleHQpLFxuICAgICAgICBwcm9wZXJ0eTogKHBvc3RmaXgucG9wKCkgYXMgVG9rZW5UeXBlKS50ZXh0LFxuICAgICAgfSlcbiAgICBjYXNlICdGSUxURVJfRlVOQ1RJT04nOiAvLyB3b3JraW5nXG4gICAgICBjb25zdCBmaWx0ZXJGdW5jdGlvbk5hbWUgPSB0b2sudGV4dC5zbGljZSgwLCAtMSkgLy8gcmVtb3ZlIHRyYWlsaW5nICcoJ1xuICAgICAgY29uc3QgcGFyYW1Db3VudCA9XG4gICAgICAgIGZpbHRlckZ1bmN0aW9uUGFyYW1Db3VudFtmaWx0ZXJGdW5jdGlvbk5hbWUgYXMgRmlsdGVyRnVuY3Rpb25OYW1lc11cbiAgICAgIGlmIChwYXJhbUNvdW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBmaWx0ZXIgZnVuY3Rpb246ICcgKyBmaWx0ZXJGdW5jdGlvbk5hbWUpXG4gICAgICB9XG4gICAgICBjb25zdCBwYXJhbXMgPSBBcnJheS5hcHBseShudWxsLCBBcnJheShwYXJhbUNvdW50KSlcbiAgICAgICAgLm1hcCgoKSA9PiBidWlsZFRyZWUocG9zdGZpeCkpXG4gICAgICAgIC5yZXZlcnNlKClcbiAgICAgIHN3aXRjaCAoZmlsdGVyRnVuY3Rpb25OYW1lKSB7XG4gICAgICAgIGNhc2UgJ3Byb3hpbWl0eSc6XG4gICAgICAgICAgY29uc3QgcHJveGltaXR5U3RyaW5ncyA9IHBhcmFtc1syXSBhcyBzdHJpbmdcbiAgICAgICAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdGSUxURVIgRlVOQ1RJT04gcHJveGltaXR5JyxcbiAgICAgICAgICAgIHByb3BlcnR5OiBwYXJhbXNbMF0sXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBmaXJzdDogcHJveGltaXR5U3RyaW5ncy5zcGxpdCgnICcpWzBdLFxuICAgICAgICAgICAgICBzZWNvbmQ6IHByb3hpbWl0eVN0cmluZ3Muc3BsaXQoJyAnKVsxXSxcbiAgICAgICAgICAgICAgZGlzdGFuY2U6IHBhcmFtc1sxXSxcbiAgICAgICAgICAgIH0gYXMgVmFsdWVUeXBlc1sncHJveGltaXR5J10sXG4gICAgICAgICAgfSlcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZmlsdGVyIGZ1bmN0aW9uJylcbiAgICAgIH1cbiAgICBjYXNlICdUSU1FX1BFUklPRCc6XG4gICAgICByZXR1cm4gdG9rLnRleHRcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHRvay50ZXh0XG4gIH1cbn1cblxuZnVuY3Rpb24gYnVpbGRBc3QodG9rZW5zOiBUb2tlblR5cGVbXSkge1xuICBjb25zdCBvcGVyYXRvclN0YWNrID0gW10gYXMgQXJyYXk8VG9rZW5UeXBlPixcbiAgICBwb3N0Zml4ID0gW10gYXMgQXJyYXk8VG9rZW5UeXBlPlxuXG4gIHdoaWxlICh0b2tlbnMubGVuZ3RoKSB7XG4gICAgY29uc3QgdG9rID0gdG9rZW5zLnNoaWZ0KCkgYXMgVG9rZW5UeXBlXG4gICAgc3dpdGNoICh0b2sudHlwZSkge1xuICAgICAgY2FzZSAnUFJPUEVSVFknOlxuICAgICAgICB0b2sudGV4dCA9IHVud3JhcCh0b2sudGV4dClcbiAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgIGNhc2UgJ1ZBTFVFJzpcbiAgICAgIGNhc2UgJ1RJTUUnOlxuICAgICAgY2FzZSAnVElNRV9QRVJJT0QnOlxuICAgICAgY2FzZSAnUkVMQVRJVkUnOlxuICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICAgIHBvc3RmaXgucHVzaCh0b2spXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdDT01QQVJJU09OJzpcbiAgICAgIGNhc2UgJ0JFVFdFRU4nOlxuICAgICAgY2FzZSAnSVNfTlVMTCc6XG4gICAgICBjYXNlICdMT0dJQ0FMJzpcbiAgICAgIGNhc2UgJ0JFRk9SRSc6XG4gICAgICBjYXNlICdBRlRFUic6XG4gICAgICBjYXNlICdEVVJJTkcnOlxuICAgICAgICBjb25zdCBwID0gcHJlY2VkZW5jZVt0b2sudHlwZSBhcyBQcmVjZW5kZW5jZVR5cGVdXG5cbiAgICAgICAgd2hpbGUgKFxuICAgICAgICAgIG9wZXJhdG9yU3RhY2subGVuZ3RoID4gMCAmJlxuICAgICAgICAgIHByZWNlZGVuY2VbXG4gICAgICAgICAgICBvcGVyYXRvclN0YWNrW29wZXJhdG9yU3RhY2subGVuZ3RoIC0gMV0udHlwZSBhcyBQcmVjZW5kZW5jZVR5cGVcbiAgICAgICAgICBdIDw9IHBcbiAgICAgICAgKSB7XG4gICAgICAgICAgcG9zdGZpeC5wdXNoKG9wZXJhdG9yU3RhY2sucG9wKCkgYXMgVG9rZW5UeXBlKVxuICAgICAgICB9XG5cbiAgICAgICAgb3BlcmF0b3JTdGFjay5wdXNoKHRvaylcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ1NQQVRJQUwnOlxuICAgICAgY2FzZSAnTk9UJzpcbiAgICAgIGNhc2UgJ0xQQVJFTic6XG4gICAgICAgIG9wZXJhdG9yU3RhY2sucHVzaCh0b2spXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdGSUxURVJfRlVOQ1RJT04nOlxuICAgICAgICBvcGVyYXRvclN0YWNrLnB1c2godG9rKVxuICAgICAgICAvLyBpbnNlcnQgYSAnKCcgbWFudWFsbHkgYmVjYXVzZSB3ZSBsb3N0IHRoZSBvcmlnaW5hbCBMUEFSRU4gbWF0Y2hpbmcgdGhlIEZJTFRFUl9GVU5DVElPTiByZWdleFxuICAgICAgICBvcGVyYXRvclN0YWNrLnB1c2goeyB0eXBlOiAnTFBBUkVOJyB9IGFzIFRva2VuVHlwZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ1JQQVJFTic6XG4gICAgICAgIHdoaWxlIChcbiAgICAgICAgICBvcGVyYXRvclN0YWNrLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICBvcGVyYXRvclN0YWNrW29wZXJhdG9yU3RhY2subGVuZ3RoIC0gMV0udHlwZSAhPT0gJ0xQQVJFTidcbiAgICAgICAgKSB7XG4gICAgICAgICAgcG9zdGZpeC5wdXNoKG9wZXJhdG9yU3RhY2sucG9wKCkgYXMgVG9rZW5UeXBlKVxuICAgICAgICB9XG4gICAgICAgIG9wZXJhdG9yU3RhY2sucG9wKCkgLy8gdG9zcyBvdXQgdGhlIExQQVJFTlxuXG4gICAgICAgIC8vIGlmIHRoaXMgcmlnaHQgcGFyZW50aGVzaXMgZW5kcyBhIGZ1bmN0aW9uIGFyZ3VtZW50IGxpc3QgKGl0J3Mgbm90IGZvciBhIGxvZ2ljYWwgZ3JvdXBpbmcpLFxuICAgICAgICAvLyBpdCdzIG5vdyB0aW1lIHRvIGFkZCB0aGF0IGZ1bmN0aW9uIHRvIHRoZSBwb3N0Zml4LW9yZGVyZWQgbGlzdFxuICAgICAgICBjb25zdCBsYXN0T3BlcmF0b3JUeXBlID1cbiAgICAgICAgICBvcGVyYXRvclN0YWNrLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICBvcGVyYXRvclN0YWNrW29wZXJhdG9yU3RhY2subGVuZ3RoIC0gMV0udHlwZVxuICAgICAgICBpZiAoXG4gICAgICAgICAgbGFzdE9wZXJhdG9yVHlwZSA9PT0gJ1NQQVRJQUwnIHx8XG4gICAgICAgICAgbGFzdE9wZXJhdG9yVHlwZSA9PT0gJ0ZJTFRFUl9GVU5DVElPTidcbiAgICAgICAgKSB7XG4gICAgICAgICAgcG9zdGZpeC5wdXNoKG9wZXJhdG9yU3RhY2sucG9wKCkgYXMgVG9rZW5UeXBlKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdDT01NQSc6XG4gICAgICBjYXNlICdFTkQnOlxuICAgICAgY2FzZSAnVU5JVFMnOlxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHRva2VuIHR5cGUgJyArIHRvay50eXBlKVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChvcGVyYXRvclN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICBwb3N0Zml4LnB1c2gob3BlcmF0b3JTdGFjay5wb3AoKSBhcyBUb2tlblR5cGUpXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgaWYgKHBvc3RmaXgubGVuZ3RoID4gMCkge1xuICAgIGxldCBtc2cgPSAnUmVtYWluaW5nIHRva2VucyBhZnRlciBidWlsZGluZyBBU1Q6IFxcbidcbiAgICBmb3IgKGxldCBpID0gcG9zdGZpeC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbXNnICs9IHBvc3RmaXhbaV0udHlwZSArICc6ICcgKyBwb3N0Zml4W2ldLnRleHQgKyAnXFxuJ1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB3cmFwKHByb3BlcnR5OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgd3JhcHBlZCA9IHByb3BlcnR5XG4gIGlmICghd3JhcHBlZC5zdGFydHNXaXRoKCdcIicpKSB7XG4gICAgd3JhcHBlZCA9ICdcIicgKyB3cmFwcGVkXG4gIH1cbiAgaWYgKCF3cmFwcGVkLmVuZHNXaXRoKCdcIicpKSB7XG4gICAgd3JhcHBlZCA9IHdyYXBwZWQgKyAnXCInXG4gIH1cbiAgcmV0dXJuIHdyYXBwZWRcbn1cblxuZnVuY3Rpb24gdW53cmFwKHByb3BlcnR5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBSZW1vdmUgc2luZ2xlIGFuZCBkb3VibGUgcXVvdGVzIGlmIHRoZXkgZXhpc3QgaW4gcHJvcGVydHkgbmFtZVxuICByZXR1cm4gcHJvcGVydHkucmVwbGFjZSgvXid8JyQvZywgJycpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG59XG5cbi8vIHJlYWxseSBjb3VsZCB1c2Ugc29tZSByZWZhY3RvcmluZyB0byBlbmFibGUgYmV0dGVyIHR5cGluZywgcmlnaHQgbm93IGl0J3MgcmVjdXJzaXZlIGFuZCBjYWxscyBpdHNlbGYgd2l0aCBzbyBtYW55IGRpZmZlcmVudCB0eXBlcyAvIHJldHVybiB0eXBlc1xuZnVuY3Rpb24gd3JpdGUoZmlsdGVyOiBhbnkpOiBhbnkge1xuICBzd2l0Y2ggKGZpbHRlci50eXBlKSB7XG4gICAgLy8gc3BhdGlhbENsYXNzXG4gICAgY2FzZSAnQkJPWCc6XG4gICAgICBjb25zdCB4bWluID0gZmlsdGVyLnZhbHVlWzBdLFxuICAgICAgICB5bWluID0gZmlsdGVyLnZhbHVlWzFdLFxuICAgICAgICB4bWF4ID0gZmlsdGVyLnZhbHVlWzJdLFxuICAgICAgICB5bWF4ID0gZmlsdGVyLnZhbHVlWzNdXG4gICAgICByZXR1cm4gKFxuICAgICAgICAnQkJPWCgnICtcbiAgICAgICAgd3JhcChmaWx0ZXIucHJvcGVydHkpICtcbiAgICAgICAgJywnICtcbiAgICAgICAgeG1pbiArXG4gICAgICAgICcsJyArXG4gICAgICAgIHltaW4gK1xuICAgICAgICAnLCcgK1xuICAgICAgICB4bWF4ICtcbiAgICAgICAgJywnICtcbiAgICAgICAgeW1heCArXG4gICAgICAgICcpJ1xuICAgICAgKVxuICAgIC8vIHZlcmlmaWVkIGxpbmUsIHBvbHlnb24sIHBvaW50IHJhZGl1c1xuICAgIGNhc2UgJ0RXSVRISU4nOlxuICAgICAgcmV0dXJuIGBEV0lUSElOKCR7d3JhcChmaWx0ZXIucHJvcGVydHkpfSwgJHtmaWx0ZXIudmFsdWV9LCAke1xuICAgICAgICBmaWx0ZXIuZGlzdGFuY2VcbiAgICAgIH0sIG1ldGVycylgXG4gICAgLy8gdW51c2VkIGF0IHRoZSBtb21lbnRcbiAgICBjYXNlICdXSVRISU4nOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgJ1dJVEhJTignICsgd3JhcChmaWx0ZXIucHJvcGVydHkpICsgJywgJyArIHdyaXRlKGZpbHRlci52YWx1ZSkgKyAnKSdcbiAgICAgIClcbiAgICAvLyB2ZXJpZmllZCBiYm94XG4gICAgY2FzZSAnSU5URVJTRUNUUyc6XG4gICAgICByZXR1cm4gJ0lOVEVSU0VDVFMoJyArIHdyYXAoZmlsdGVyLnByb3BlcnR5KSArICcsICcgKyBmaWx0ZXIudmFsdWUgKyAnKSdcbiAgICAvLyB1bnVzZWQgYXQgdGhlIG1vbWVudFxuICAgIGNhc2UgJ0NPTlRBSU5TJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgICdDT05UQUlOUygnICsgd3JhcChmaWx0ZXIucHJvcGVydHkpICsgJywgJyArIHdyaXRlKGZpbHRlci52YWx1ZSkgKyAnKSdcbiAgICAgIClcbiAgICAvLyBhbGwgXCJnZW9cIiBmaWx0ZXJzIHBhc3MgdGhyb3VnaCB0aGlzIGZpcnN0LCB3aGljaCBzZXJpYWxpemVzIHRoZW0gaW50byBhIGZvcm0gdGhhdCBjcWwgdW5kZXJzdGFuZHNcbiAgICAvLyB0aGlzIGlzIG9ubHkgZG9uZSBoZXJlIG9uIHRoZSBmbHkgYmVjYXVzZSB0aGUgdHJhbnNmb3JtYXRpb24gaW52b2x2ZXMgYSBsb3NzIG9mIGluZm9ybWF0aW9uXG4gICAgLy8gKHN1Y2ggYXMgdGhlIHVuaXRzIFttZXRlcnMgb3IgbWlsZXM/XSBhbmQgY29vcmRpbmF0ZSBzeXN0ZW0gW2RtcyBvciBtZ3JzP10pXG4gICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgcmV0dXJuIHdyaXRlKHNlcmlhbGl6ZS5sb2NhdGlvbihmaWx0ZXIucHJvcGVydHksIGZpbHRlci52YWx1ZSkpXG4gICAgLy8gbG9naWNhbENsYXNzXG4gICAgY2FzZSAnQU5EJzpcbiAgICBjYXNlICdPUic6XG4gICAgICBsZXQgcmVzID0gJygnXG4gICAgICBsZXQgZmlyc3QgPSB0cnVlXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlci5maWx0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHdyaXR0ZW5GaWx0ZXIgPSB3cml0ZShmaWx0ZXIuZmlsdGVyc1tpXSlcbiAgICAgICAgaWYgKHdyaXR0ZW5GaWx0ZXIpIHtcbiAgICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgIGZpcnN0ID0gZmFsc2VcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzICs9ICcpICcgKyBmaWx0ZXIudHlwZSArICcgKCdcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzICs9IHdyaXR0ZW5GaWx0ZXJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlcyArICcpJ1xuICAgIGNhc2UgJ05PVCc6XG4gICAgICAvLyBUT0RPOiBkZWFsIHdpdGggcHJlY2VkZW5jZSBvZiBsb2dpY2FsIG9wZXJhdG9ycyB0b1xuICAgICAgLy8gYXZvaWQgZXh0cmEgcGFyZW50aGVzZXMgKG5vdCB1cmdlbnQpXG4gICAgICByZXR1cm4gJ05PVCAoJyArIHdyaXRlKGZpbHRlci5maWx0ZXJzWzBdKSArICcpJ1xuICAgIC8vIGNvbXBhcmlzb25DbGFzc1xuICAgIGNhc2UgJ0lTIE5VTEwnOlxuICAgICAgcmV0dXJuIGAoXCIke2ZpbHRlci5wcm9wZXJ0eX1cIiAke2ZpbHRlci50eXBlfSlgXG4gICAgY2FzZSAnQkVUV0VFTic6XG4gICAgICByZXR1cm4gKFxuICAgICAgICB3cmFwKGZpbHRlci5wcm9wZXJ0eSkgK1xuICAgICAgICAnIEJFVFdFRU4gJyArXG4gICAgICAgIHdyaXRlKE1hdGgubWluKGZpbHRlci52YWx1ZS5zdGFydCwgZmlsdGVyLnZhbHVlLmVuZCkpICtcbiAgICAgICAgJyBBTkQgJyArXG4gICAgICAgIHdyaXRlKE1hdGgubWF4KGZpbHRlci52YWx1ZS5zdGFydCwgZmlsdGVyLnZhbHVlLmVuZCkpXG4gICAgICApXG4gICAgY2FzZSAnPSc6XG4gICAgY2FzZSAnPD4nOlxuICAgIGNhc2UgJzwnOlxuICAgIGNhc2UgJzw9JzpcbiAgICBjYXNlICc+JzpcbiAgICBjYXNlICc+PSc6XG4gICAgY2FzZSAnTElLRSc6XG4gICAgY2FzZSAnSUxJS0UnOlxuICAgICAgbGV0IHByb3BlcnR5ID1cbiAgICAgICAgdHlwZW9mIGZpbHRlci5wcm9wZXJ0eSA9PT0gJ29iamVjdCdcbiAgICAgICAgICA/IHdyaXRlKGZpbHRlci5wcm9wZXJ0eSlcbiAgICAgICAgICA6IHdyYXAodW53cmFwKGZpbHRlci5wcm9wZXJ0eSkpIC8vIHVud3JhcCBmaXJzdCwgYmVjYXVzZSB0ZWNobmljYWxseSBvbmx5IFwiXCIgaXMgc3VwcG9ydGVkIChzbyBzd2FwICcnIGZvciBcIlwiKVxuXG4gICAgICBpZiAoZmlsdGVyLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBgJHtwcm9wZXJ0eX0gJHtmaWx0ZXIudHlwZX1gXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBgJHtwcm9wZXJ0eX0gJHtmaWx0ZXIudHlwZX0gJHtcbiAgICAgICAgdW53cmFwKGZpbHRlci5wcm9wZXJ0eSkgPT09ICdpZCdcbiAgICAgICAgICA/IGAnJHtmaWx0ZXIudmFsdWV9J2BcbiAgICAgICAgICA6IHdyaXRlKGZpbHRlci52YWx1ZSlcbiAgICAgIH1gIC8vIGRvbid0IGVzY2FwZSBpZHNcbiAgICAvLyB0ZW1wb3JhbENsYXNzXG4gICAgY2FzZSAnUkVMQVRJVkUnOlxuICAgICAgLy8gd2VpcmQgdGhpbmcgSSBub3RpY2VkIGlzIHlvdSBoYXZlIHRvIHdyYXAgdGhlIHZhbHVlIGluIHNpbmdsZSBxdW90ZXMsIGRvdWJsZSBxdW90ZXMgZG9uJ3Qgd29ya1xuICAgICAgcmV0dXJuIGAke3dyYXAoZmlsdGVyLnByb3BlcnR5KX0gPSAnJHtzZXJpYWxpemUuZGF0ZVJlbGF0aXZlKFxuICAgICAgICBmaWx0ZXIudmFsdWVcbiAgICAgICl9J2BcbiAgICBjYXNlICdBUk9VTkQnOlxuICAgICAgcmV0dXJuIGAke3dyYXAoZmlsdGVyLnByb3BlcnR5KX0gJHtzZXJpYWxpemUuZGF0ZUFyb3VuZChmaWx0ZXIudmFsdWUpfWBcbiAgICBjYXNlICdCRUZPUkUnOlxuICAgIGNhc2UgJ0FGVEVSJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHdyYXAoZmlsdGVyLnByb3BlcnR5KSArXG4gICAgICAgICcgJyArXG4gICAgICAgIGZpbHRlci50eXBlICtcbiAgICAgICAgJyAnICtcbiAgICAgICAgKGZpbHRlci52YWx1ZSA/IGZpbHRlci52YWx1ZS50b1N0cmluZyhkYXRlVGltZUZvcm1hdCkgOiBcIicnXCIpXG4gICAgICApXG4gICAgY2FzZSAnRFVSSU5HJzpcbiAgICAgIHJldHVybiBgJHt3cmFwKGZpbHRlci5wcm9wZXJ0eSl9ICR7ZmlsdGVyLnR5cGV9ICR7ZmlsdGVyLnZhbHVlLnN0YXJ0fS8ke1xuICAgICAgICBmaWx0ZXIudmFsdWUuZW5kXG4gICAgICB9YFxuICAgIC8vIGZpbHRlckZ1bmN0aW9uQ2xhc3NcbiAgICBjYXNlICdGSUxURVIgRlVOQ1RJT04gcHJveGltaXR5JzpcbiAgICAgIC8vIG5vdCBzdXJlIHdoeSB3ZSBuZWVkIHRoZSA9IHRydWUgcGFydCBidXQgd2l0aG91dCBpdCB0aGUgYmFja2VuZCBmYWlscyB0byBwYXJzZVxuICAgICAgcmV0dXJuIGBwcm94aW1pdHkoJHt3cml0ZShmaWx0ZXIucHJvcGVydHkpfSwke3dyaXRlKFxuICAgICAgICBmaWx0ZXIudmFsdWUuZGlzdGFuY2VcbiAgICAgICl9LCR7d3JpdGUoYCR7ZmlsdGVyLnZhbHVlLmZpcnN0fSAke2ZpbHRlci52YWx1ZS5zZWNvbmR9YCl9KSA9IHRydWVgXG4gICAgICBicmVha1xuICAgIGNhc2UgJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnOlxuICAgICAgY29uc3QgYm9vbGVhblRleHRTZWFyY2hGaWx0ZXIgPSBmaWx0ZXIudmFsdWUgYXMgQm9vbGVhblRleHRUeXBlXG4gICAgICBpZiAoYm9vbGVhblRleHRTZWFyY2hGaWx0ZXIuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9IGVsc2UgaWYgKGJvb2xlYW5UZXh0U2VhcmNoRmlsdGVyLmNxbCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIFwiKGFueVRleHQgSUxJS0UgJyonKVwiXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9vbGVhblRleHRTZWFyY2hGaWx0ZXIuY3FsXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2xhdGVVc2VycWxUb0NxbChcIidcIiArIGZpbHRlci5yZXBsYWNlKC8nL2csIFwiJydcIikgKyBcIidcIilcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhmaWx0ZXIpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdib29sZWFuJykge1xuICAgICAgICByZXR1cm4gQm9vbGVhbihmaWx0ZXIpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBlbmNvZGU6IFwiICsgZmlsdGVyLnR5cGUgKyAnICcgKyBmaWx0ZXIpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2ltcGxpZnlGaWx0ZXJzKGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3FsQXN0LmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc2ltcGxpZnlBc3QoY3FsQXN0LmZpbHRlcnNbaV0sIGNxbEFzdCkpIHtcbiAgICAgIGNxbEFzdC5maWx0ZXJzLnNwbGljZS5hcHBseShcbiAgICAgICAgY3FsQXN0LmZpbHRlcnMsXG4gICAgICAgIChbaSwgMV0gYXMgYW55W10pLmNvbmNhdChcbiAgICAgICAgICAoY3FsQXN0LmZpbHRlcnNbaV0gYXMgRmlsdGVyQnVpbGRlckNsYXNzKS5maWx0ZXJzXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNxbEFzdFxufVxuXG4vKipcbiAqIFRoZSBjdXJyZW50IHJlYWQgZnVuY3Rpb24gZm9yIGNxbCBwcm9kdWNlcyBhbiB1bm9wdGltaXplZCB0cmVlLiAgV2hpbGUgaXQncyBwb3NzaWJsZSB3ZSBjb3VsZFxuICogZml4IHRoZSBvdXRwdXQgdGhlcmUsIEknbSBub3Qgc3VyZSBvZiBob3cuICBJdCBlbmRzIHVwIHByb2R1Y2luZyB2ZXJ5IG5lc3RlZCBmaWx0ZXIgdHJlZXMgZnJvbVxuICogcmVsYXRpdmVseSBzaW1wbGUgY3FsLlxuICogQHBhcmFtIGNxbEFzdFxuICogQHBhcmFtIHBhcmVudE5vZGVcbiAqL1xuZnVuY3Rpb24gc2ltcGxpZnlBc3QoXG4gIGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3MsXG4gIHBhcmVudE5vZGU/OiBGaWx0ZXJCdWlsZGVyQ2xhc3Ncbikge1xuICBpZiAoIWlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkgJiYgcGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9IGVsc2UgaWYgKCFwYXJlbnROb2RlKSB7XG4gICAgaWYgKGlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkpIHtcbiAgICAgIHNpbXBsaWZ5RmlsdGVycyhjcWxBc3QpXG4gICAgfVxuICAgIHJldHVybiBjcWxBc3RcbiAgfSBlbHNlIHtcbiAgICBzaW1wbGlmeUZpbHRlcnMoY3FsQXN0IGFzIEZpbHRlckJ1aWxkZXJDbGFzcylcbiAgICBpZiAoY3FsQXN0LnR5cGUgPT09IHBhcmVudE5vZGUudHlwZSAmJiAhY3FsQXN0Lm5lZ2F0ZWQpIHtcbiAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb25seSBzaW1wbGlmaWNhdGlvbnMgd2UgY2FuIG1ha2UgYmFzZWQgb24gYm9vbGVhbiBhbGdlYnJhIHJ1bGVzXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5jb2xsYXBzZU5PVHMoe1xuICBjcWxBc3QsXG59OiB7XG4gIGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3Ncbn0pOiBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyB8IEZpbHRlckNsYXNzIHtcbiAgaWYgKGlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkpIHtcbiAgICBpZiAoY3FsQXN0Lm5lZ2F0ZWQpIHtcbiAgICAgIHJldHVybiBuZXcgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnTk9UJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiBjcWxBc3QudHlwZSxcbiAgICAgICAgICAgIGZpbHRlcnM6IGNxbEFzdC5maWx0ZXJzLm1hcCgoZmlsdGVyKSA9PlxuICAgICAgICAgICAgICB1bmNvbGxhcHNlTk9Ucyh7IGNxbEFzdDogZmlsdGVyIH0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6IGNxbEFzdC50eXBlLFxuICAgICAgICBmaWx0ZXJzOiBjcWxBc3QuZmlsdGVycy5tYXAoKGZpbHRlcikgPT5cbiAgICAgICAgICB1bmNvbGxhcHNlTk9Ucyh7IGNxbEFzdDogZmlsdGVyIH0pXG4gICAgICAgICksXG4gICAgICB9KVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoY3FsQXN0Lm5lZ2F0ZWQpIHtcbiAgICAgIGNvbnN0IGNsb25lZEZpZWxkRmlsdGVyID0gX2Nsb25lRGVlcChjcWxBc3QpXG4gICAgICByZXR1cm4gbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ05PVCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgLi4uY2xvbmVkRmllbGRGaWx0ZXIsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjcWxBc3RcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvblVzaW5nU3RhcnR1cFN0b3JlKCkge1xuICByZXR1cm4gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvbih7XG4gICAgQ29uZmlndXJhdGlvbjogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLFxuICAgIE1ldGFjYXJkRGVmaW5pdGlvbnM6IFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucyxcbiAgfSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlQWxsRmlsdGVyVHlwZXMoXG4gIGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3MgfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzc1xuKTogQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB7XG4gIGlmIChpc0NRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkgfHwgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MoY3FsQXN0KSkge1xuICAgIHJldHVybiBuZXcgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgdHlwZTogY3FsQXN0LnR5cGUsXG4gICAgICBmaWx0ZXJzOiBjcWxBc3QuZmlsdGVycy5tYXAoKGZpbHRlcikgPT4gaGFuZGxlQWxsRmlsdGVyVHlwZXMoZmlsdGVyKSksXG4gICAgfSlcbiAgfSBlbHNlIGlmIChpc0Jhc2ljRGF0YXR5cGVDbGFzcyhjcWxBc3QpKSB7XG4gICAgY29uc3QgZGF0YVR5cGVDb25maWd1cmF0aW9uID0gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvblVzaW5nU3RhcnR1cFN0b3JlKClcbiAgICBjb25zdCBkYXRhdHlwZUZpbHRlcnM6IEZpbHRlckNsYXNzW10gPSBbXVxuICAgIGNxbEFzdC52YWx1ZS5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICBjb25zdCByZWxldmFudEF0dHJpYnV0ZXMgPSBkYXRhVHlwZUNvbmZpZ3VyYXRpb24udmFsdWVNYXBbdmFsdWVdXG4gICAgICBpZiAocmVsZXZhbnRBdHRyaWJ1dGVzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlbGV2YW50QXR0cmlidXRlcy5hdHRyaWJ1dGVzKS5tYXAoKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbGV2YW50VmFsdWVzID0gcmVsZXZhbnRBdHRyaWJ1dGVzLmF0dHJpYnV0ZXNbYXR0cmlidXRlXVxuICAgICAgICAgIHJlbGV2YW50VmFsdWVzLmZvckVhY2goKHJlbGV2YW50VmFsdWUpID0+IHtcbiAgICAgICAgICAgIGRhdGF0eXBlRmlsdGVycy5wdXNoKFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBhdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlbGV2YW50VmFsdWUsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICAgIGZpbHRlcnM6IGRhdGF0eXBlRmlsdGVycyxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0pXG4gIH0gZWxzZSBpZiAoaXNSZXNvdXJjZVNpemVGaWx0ZXJDbGFzcyhjcWxBc3QpKSB7XG4gICAgY29uc3QgYnl0ZXNWYWx1ZSA9IGNvbnZlcnRSZXNvdXJjZVNpemVGaWx0ZXJDbGFzc1ZhbHVlVG9CeXRlcyhjcWxBc3QpXG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAuLi5jcWxBc3QsXG4gICAgICB2YWx1ZTogYnl0ZXNWYWx1ZSxcbiAgICB9KVxuICB9IGVsc2UgaWYgKGlzUmVzb3VyY2VTaXplUmFuZ2VGaWx0ZXJDbGFzcyhjcWxBc3QpKSB7XG4gICAgY29uc3QgYnl0ZXNWYWx1ZSA9IGNvbnZlcnRSZXNvdXJjZVNpemVSYW5nZUZpbHRlckNsYXNzVmFsdWVUb0J5dGVzKGNxbEFzdClcbiAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgIC4uLmNxbEFzdCxcbiAgICAgIHZhbHVlOiBieXRlc1ZhbHVlLFxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNxbEFzdFxuICB9XG59XG5cbi8qKlxuICogRm9yIG5vdywgYWxsIHRoaXMgZG9lcyBpcyByZW1vdmUgYW55RGF0ZSBmcm9tIGNxbCBzaW5jZSB0aGF0J3MgcHVyZWx5IGZvciB0aGUgVUkgdG8gdHJhY2sgdGhlIHF1ZXJ5IGJhc2ljIHZpZXcgc3RhdGUgY29ycmVjdGx5LlxuICogV2UgbWlnaHQgd2FudCB0byByZWNvbnNpZGVyIGhvdyB3ZSBkbyB0aGUgYmFzaWMgcXVlcnkgaW4gb3JkZXIgdG8gYXZvaWQgdGhpcyBuZWNlc3NpdHkgKGl0J3MgcmVhbGx5IHRoZSBjaGVja2JveCkuXG4gKlxuICogVGhpcyB3aWxsIG9ubHkgZXZlciBoYXBwZW4gd2l0aCBhIHNwZWNpZmljIHN0cnVjdHVyZSwgc28gd2UgZG9uJ3QgbmVlZCB0byByZWN1cnNlIG9yIGFueXRoaW5nLlxuICovXG5mdW5jdGlvbiByZW1vdmVJbnZhbGlkRmlsdGVycyhcbiAgY3FsQXN0OiBGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4pOiBGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB8IGJvb2xlYW4gfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIC8vIGxvb3Agb3ZlciBmaWx0ZXJzLCBzcGxpY2luZyBvdXQgaW52YWxpZCBvbmVzLCBhdCBlbmQgb2YgbG9vcCBpZiBhbGwgZmlsdGVycyBnb25lLCByZW1vdmUgc2VsZj9cbiAgaWYgKFxuICAgIGlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkgfHxcbiAgICBzaG91bGRCZUZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpIHx8XG4gICAgaXNDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpXG4gICkge1xuICAgIGxldCBpID0gY3FsQXN0LmZpbHRlcnMubGVuZ3RoXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgY29uc3QgY3VycmVudEZpbHRlciA9IGNxbEFzdC5maWx0ZXJzW2ldXG4gICAgICBjb25zdCB2YWxpZEZpbHRlciA9IHJlbW92ZUludmFsaWRGaWx0ZXJzKGN1cnJlbnRGaWx0ZXIpXG4gICAgICBpZiAoIXZhbGlkRmlsdGVyKSB7XG4gICAgICAgIGNxbEFzdC5maWx0ZXJzLnNwbGljZShpLCAxKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3FsQXN0LmZpbHRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNxbEFzdC5wcm9wZXJ0eSA9PT0gJ2FueURhdGUnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKGNxbEFzdC50eXBlID09PSAnQk9PTEVBTl9URVhUX1NFQVJDSCcpIHtcbiAgICAgIGNvbnN0IGJvb2xlYW5UZXh0VmFsdWUgPSBjcWxBc3QudmFsdWUgYXMgQm9vbGVhblRleHRUeXBlXG4gICAgICBpZiAoYm9vbGVhblRleHRWYWx1ZS5lcnJvcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNxbEFzdFxufVxuXG5mdW5jdGlvbiBpdGVyYXRpdmVseVNpbXBsaWZ5KGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzKSB7XG4gIGxldCBwcmV2QXN0ID0gX2Nsb25lRGVlcChjcWxBc3QpXG4gIHNpbXBsaWZ5QXN0KGNxbEFzdClcbiAgd2hpbGUgKEpTT04uc3RyaW5naWZ5KHByZXZBc3QpICE9PSBKU09OLnN0cmluZ2lmeShjcWxBc3QpKSB7XG4gICAgcHJldkFzdCA9IF9jbG9uZURlZXAoY3FsQXN0KVxuICAgIHNpbXBsaWZ5QXN0KGNxbEFzdClcbiAgfVxuICByZXR1cm4gY3FsQXN0XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIHVzZWQgb25seSB0byB0ZXN0IHJlY29uc3RpdHV0aW9uLCBvciBhcyBhIGxhc3QgcmVzb3J0IHRvIGhhbmRsZSB1cGdyYWRlcyBmcm9tIGEgc3lzdGVtIHdoZXJlIHRoZSBmaWx0ZXIgdHJlZSBpc1xuICAgKiBubyBsb25nZXIgY29tcGF0aWJsZS4gIE5vIGxvc3Mgb2YgYWNjdXJhY3kgd2lsbCBvY2N1ciwgYnV0IG5pY2UgVVggdG91Y2hlcyBsaWtlIHJlbWVtYmVyaW5nIGNvb3JkaW5hdGUgc3lzdGVtcyBhbmQgdW5pdHMgd2lsbC5cbiAgICpcbiAgICogQWxzbywgaXQgbWF5IGdyb3VwIHRoaW5ncyBzbGlnaHRseSBkaWZmZXJlbnQgKHdlIGRvIG91ciBiZXN0IGVmZm9ydCwgYnV0IHRoZSBwb3N0Zml4IG5vdGF0aW9uIHRlY2huaWNhbGx5IGNhdXNlcyBwYXJlbnMgYXJvdW5kIGV2ZXJ5dGhpbmcsIGFuZCBmcm9tIHRoZXJlXG4gICAqIHdlIGRvIGEgc2ltcGxpZmljYXRpb24sIHdoaWNoIG1lYW5zIHRoZSByZXN1bHRpbmcgZmlsdGVyIHRyZWUgbWF5IGxvb2sgc2ltcGxlciB0aGFuIHlvdSByZW1lbWJlcikuICBIb3dldmVyLCBvbmNlIGFnYWluLCB0aGUgYWNjdXJhY3kgYW5kXG4gICAqIHJlc3VsdHMgcmV0dXJuZWQgYnkgdGhlIHNlYXJjaCB3aWxsIHJlbWFpbiB0aGUgc2FtZS5cbiAgICogQHBhcmFtIGNxbFxuICAgKi9cbiAgcmVhZChjcWw/OiBzdHJpbmcpOiBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICAgIGlmIChjcWwgPT09IHVuZGVmaW5lZCB8fCBjcWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXSxcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIGlmIGFueXRoaW5nIGdvZXMgd3JvbmcsIHNpbXBseSBsb2cgdGhlIGVycm9yIGFuZCBtb3ZlIG9uIChyZXR1cm4gYSBkZWZhdWx0IGZpbHRlciB0cmVlKS5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVjb25zdHJ1Y3RlZEZpbHRlciA9IHRoaXMuc2ltcGxpZnkoYnVpbGRBc3QodG9rZW5pemUoY3FsKSkpXG4gICAgICBpZiAoXG4gICAgICAgIGlzRmlsdGVyQnVpbGRlckNsYXNzKHJlY29uc3RydWN0ZWRGaWx0ZXIpIHx8XG4gICAgICAgIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzKHJlY29uc3RydWN0ZWRGaWx0ZXIpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3MocmVjb25zdHJ1Y3RlZEZpbHRlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICBmaWx0ZXJzOiBbcmVjb25zdHJ1Y3RlZEZpbHRlciBhcyBGaWx0ZXJDbGFzc10sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHsgdHlwZTogJ0FORCcsIGZpbHRlcnM6IFtdIH0pXG4gICAgfVxuICB9LFxuICB3cml0ZShmaWx0ZXI6IEZpbHRlckJ1aWxkZXJDbGFzcyk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0YW5kYXJkQ3FsQXN0ID0gaGFuZGxlQWxsRmlsdGVyVHlwZXMoXG4gICAgICAgIHVuY29sbGFwc2VOT1RzKHtcbiAgICAgICAgICBjcWxBc3Q6IGZpbHRlcixcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIHJlbW92ZUludmFsaWRGaWx0ZXJzKHN0YW5kYXJkQ3FsQXN0KVxuICAgICAgcmV0dXJuIHdyaXRlKHN0YW5kYXJkQ3FsQXN0KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICByZXR1cm4gd3JpdGUoXG4gICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgIGZpbHRlcnM6IFtdLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfSxcbiAgcmVtb3ZlSW52YWxpZEZpbHRlcnMsXG4gIHNpbXBsaWZ5KGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzKTogRmlsdGVyQnVpbGRlckNsYXNzIHtcbiAgICByZXR1cm4gaXRlcmF0aXZlbHlTaW1wbGlmeShjcWxBc3QpXG4gIH0sXG4gIHRyYW5zbGF0ZUNxbFRvVXNlcnFsLFxuICB0cmFuc2xhdGVVc2VycWxUb0NxbCxcbiAgQU5ZVEVYVF9XSUxEQ0FSRCxcbiAgZ2V0R2VvRmlsdGVycyxcbn1cbiJdfQ==