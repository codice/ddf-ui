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
import { CQLStandardFilterBuilderClass, deserialize, FilterBuilderClass, FilterClass, isBasicDatatypeClass, isFilterBuilderClass, isCQLStandardFilterBuilderClass, serialize, shouldBeFilterBuilderClass, } from '../component/filter-builder/filter.structure';
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
function handleBasicDatatypeFilters(cqlAst) {
    if (isCQLStandardFilterBuilderClass(cqlAst) || isFilterBuilderClass(cqlAst)) {
        return new CQLStandardFilterBuilderClass({
            type: cqlAst.type,
            filters: cqlAst.filters.map(function (filter) {
                return handleBasicDatatypeFilters(filter);
            }),
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
            // const duplicatedFilter = JSON.parse(JSON.stringify(filter))
            var standardCqlAst = handleBasicDatatypeFilters(uncollapseNOTs({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL2NxbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSjs7OytCQUcrQjtBQUMvQixPQUFPLEVBRUwsNkJBQTZCLEVBQzdCLFdBQVcsRUFDWCxrQkFBa0IsRUFDbEIsV0FBVyxFQUNYLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsK0JBQStCLEVBQy9CLFNBQVMsRUFDVCwwQkFBMEIsR0FFM0IsTUFBTSw4Q0FBOEMsQ0FBQTtBQUNyRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw4REFBOEQsQ0FBQTtBQUN4RyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUE7QUFDakMsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFBO0FBQ3JCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBRTFELElBQU0sb0JBQW9CLEdBQUcsVUFDM0IsS0FBdUIsRUFDdkIsUUFBZ0IsRUFDaEIsTUFBZTtJQUVmLElBQU0sS0FBSyxHQUFHO1FBQ1osSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsYUFBYTtRQUNuQixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNiLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ2QsQ0FBQTtJQUVELE9BQU8sSUFBSSxXQUFXLENBQUM7UUFDckIsSUFBSSxFQUFFLFVBQVU7UUFDaEIsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsdUJBQU0sS0FBSyxLQUFFLE1BQU0sUUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQTJCO1FBQ3hFLFFBQVEsVUFBQTtLQUNULENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQTtBQUVELElBQU0sbUJBQW1CLEdBQUcsVUFDMUIsSUFBZ0Is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QUFDO29CQUM1QixJQUFJLEVBQUUsS0FBSztvQkFDWCxPQUFPLEVBQUUsQ0FBQyxtQkFBa0MsQ0FBQztpQkFDOUMsQ0FBQyxDQUFBO2FBQ0g7U0FDRjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsQixPQUFPLElBQUksa0JBQWtCLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1NBQzVEO0lBQ0gsQ0FBQztJQUNELEtBQUssWUFBQyxNQUEwQjtRQUM5QixJQUFJO1lBQ0YsOERBQThEO1lBQzlELElBQU0sY0FBYyxHQUFHLDBCQUEwQixDQUMvQyxjQUFjLENBQUM7Z0JBQ2IsTUFBTSxFQUFFLE1BQU07YUFDZixDQUFDLENBQ0gsQ0FBQTtZQUNELG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQ3BDLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1NBQzdCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xCLE9BQU8sS0FBSyxDQUNWLElBQUksa0JBQWtCLENBQUM7Z0JBQ3JCLElBQUksRUFBRSxLQUFLO2dCQUNYLE9BQU8sRUFBRSxFQUFFO2FBQ1osQ0FBQyxDQUNILENBQUE7U0FDRjtJQUNILENBQUM7SUFDRCxvQkFBb0Isc0JBQUE7SUFDcEIsUUFBUSxZQUFDLE1BQTBCO1FBQ2pDLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEMsQ0FBQztJQUNELG9CQUFvQixzQkFBQTtJQUNwQixvQkFBb0Isc0JBQUE7SUFDcEIsZ0JBQWdCLGtCQUFBO0lBQ2hCLGFBQWEsZUFBQTtDQUNkLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8qIENvcHlyaWdodCAoYykgMjAwNi0yMDE1IGJ5IE9wZW5MYXllcnMgQ29udHJpYnV0b3JzIChzZWUgYXV0aG9ycy50eHQgZm9yXG4gKiBmdWxsIGxpc3Qgb2YgY29udHJpYnV0b3JzKS4gUHVibGlzaGVkIHVuZGVyIHRoZSAyLWNsYXVzZSBCU0QgbGljZW5zZS5cbiAqIFNlZSBsaWNlbnNlLnR4dCBpbiB0aGUgT3BlbkxheWVycyBkaXN0cmlidXRpb24gb3IgcmVwb3NpdG9yeSBmb3IgdGhlXG4gKiBmdWxsIHRleHQgb2YgdGhlIGxpY2Vuc2UuICovXG5pbXBvcnQge1xuICBCb29sZWFuVGV4dFR5cGUsXG4gIENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzLFxuICBkZXNlcmlhbGl6ZSxcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbiAgaXNCYXNpY0RhdGF0eXBlQ2xhc3MsXG4gIGlzRmlsdGVyQnVpbGRlckNsYXNzLFxuICBpc0NRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzLFxuICBzZXJpYWxpemUsXG4gIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzLFxuICBWYWx1ZVR5cGVzLFxufSBmcm9tICcuLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9jb21wb25lbnQvcmVzZXJ2ZWQtYmFzaWMtZGF0YXR5cGUvcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnXG5pbXBvcnQgQ1FMVXRpbHMgZnJvbSAnLi9DUUxVdGlscydcbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcblxuY29uc3QgZ2V0UG9pbnRSYWRpdXNGaWx0ZXIgPSAoXG4gIHBvaW50OiBbbnVtYmVyLCBudW1iZXJdLFxuICBwcm9wZXJ0eTogc3RyaW5nLFxuICByYWRpdXM/OiBzdHJpbmdcbikgPT4ge1xuICBjb25zdCB2YWx1ZSA9IHtcbiAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgIGxhdDogcG9pbnRbMV0sXG4gICAgbG9uOiBwb2ludFswXSxcbiAgfVxuXG4gIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgdmFsdWU6IChyYWRpdXMgPyB7IC4uLnZhbHVlLCByYWRpdXMgfSA6IHZhbHVlKSBhcyBWYWx1ZVR5cGVzWydsb2NhdGlvbiddLFxuICAgIHByb3BlcnR5LFxuICB9KVxufVxuXG5jb25zdCBnZXRMaW5lc3RyaW5nRmlsdGVyID0gKFxuICBsaW5lOiBudW1iZXJbXVtdLFxuICBwcm9wZXJ0eTogc3RyaW5nLFxuICBidWZmZXI/OiBzdHJpbmdcbikgPT4ge1xuICBjb25zdCB2YWx1ZSA9IHtcbiAgICBtb2RlOiAnbGluZScsXG4gICAgdHlwZTogJ0xJTkUnLFxuICAgIGxpbmU6IGxpbmUsXG4gIH1cblxuICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgIHZhbHVlOiAoYnVmZmVyXG4gICAgICA/IHsgLi4udmFsdWUsIGxpbmVXaWR0aDogYnVmZmVyIH1cbiAgICAgIDogdmFsdWUpIGFzIFZhbHVlVHlwZXNbJ2xvY2F0aW9uJ10sXG4gICAgcHJvcGVydHksXG4gIH0pXG59XG5cbmNvbnN0IGdldFBvbHlnb25GaWx0ZXIgPSAoXG4gIHBvbHk6IG51bWJlcltdW10sXG4gIHByb3BlcnR5OiBzdHJpbmcsXG4gIGJ1ZmZlcj86IHN0cmluZ1xuKSA9PiB7XG4gIGNvbnN0IHZhbHVlID0ge1xuICAgIG1vZGU6ICdwb2x5JyxcbiAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgcG9seWdvbjogcG9seSxcbiAgfVxuXG4gIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgdmFsdWU6IChidWZmZXJcbiAgICAgID8geyAuLi52YWx1ZSwgcG9seWdvbkJ1ZmZlcldpZHRoOiBidWZmZXIgfVxuICAgICAgOiB2YWx1ZSkgYXMgVmFsdWVUeXBlc1snbG9jYXRpb24nXSxcbiAgICBwcm9wZXJ0eSxcbiAgfSlcbn1cbmNvbnN0IEFOWVRFWFRfV0lMRENBUkQgPSAnXCJhbnlUZXh0XCIgSUxJS0UgXFwnJVxcJydcbnR5cGUgUHJlY2VuZGVuY2VUeXBlID0gJ1JQQVJFTicgfCAnTE9HSUNBTCcgfCAnQ09NUEFSSVNPTidcbnR5cGUgRmlsdGVyRnVuY3Rpb25OYW1lcyA9ICdwcm94aW1pdHknIHwgJ3BpJ1xudHlwZSBQYXR0ZXJuUmV0dXJuVHlwZSA9IFJlZ0V4cCB8ICgodGV4dDogc3RyaW5nKSA9PiBzdHJpbmdbXSB8IG51bGwpXG5cbnR5cGUgUGF0dGVybk5hbWVzVHlwZSA9XG4gIHwgJ1BST1BFUlRZJ1xuICB8ICdDT01QQVJJU09OJ1xuICB8ICdJU19OVUxMJ1xuICB8ICdDT01NQSdcbiAgfCAnTE9HSUNBTCdcbiAgfCAnVkFMVUUnXG4gIHwgJ0ZJTFRFUl9GVU5DVElPTidcbiAgfCAnQk9PTEVBTidcbiAgfCAnTFBBUkVOJ1xuICB8ICdSUEFSRU4nXG4gIHwgJ1NQQVRJQUwnXG4gIHwgJ1VOSVRTJ1xuICB8ICdOT1QnXG4gIHwgJ0JFVFdFRU4nXG4gIHwgJ0JFRk9SRSdcbiAgfCAnQUZURVInXG4gIHwgJ0RVUklORydcbiAgfCAnUkVMQVRJVkUnXG4gIHwgJ1RJTUUnXG4gIHwgJ1RJTUVfUEVSSU9EJ1xuICB8ICdHRU9NRVRSWSdcblxuY29uc3QgdGltZVBhdHRlcm4gPVxuICAgIC8oKChbMC05XXs0fSkoLShbMC05XXsyfSkoLShbMC05XXsyfSkoVChbMC05XXsyfSk6KFswLTldezJ9KSg6KFswLTldezJ9KShcXC4oWzAtOV0rKSk/KT8oWnwoKFstK10pKFswLTldezJ9KTooWzAtOV17Mn0pKSk/KT8pPyk/KXxeJycpL2ksXG4gIHBhdHRlcm5zID0ge1xuICAgIC8vQWxsb3dzIGZvciBub24tc3RhbmRhcmQgc2luZ2xlLXF1b3RlZCBwcm9wZXJ0eSBuYW1lc1xuICAgIFBST1BFUlRZOiAvXihbX2EtekEtWl1cXHcqfFwiW15cIl0rXCJ8J1teJ10rJykvLFxuICAgIENPTVBBUklTT046IC9eKD18PD58PD18PHw+PXw+fExJS0V8SUxJS0UpL2ksXG4gICAgSVNfTlVMTDogL15JUyBOVUxML2ksXG4gICAgQ09NTUE6IC9eLC8sXG4gICAgTE9HSUNBTDogL14oQU5EfE9SKS9pLFxuICAgIFZBTFVFOiAvXignKFteJ118JycpKid8LT9cXGQrKFxcLlxcZCopP3xcXC5cXGQrKS8sXG4gICAgRklMVEVSX0ZVTkNUSU9OOiAvXlthLXpdXFx3K1xcKC8sXG4gICAgQk9PTEVBTjogL14oZmFsc2V8dHJ1ZSkvaSxcbiAgICBMUEFSRU46IC9eXFwoLyxcbiAgICBSUEFSRU46IC9eXFwpLyxcbiAgICBTUEFUSUFMOiAvXihCQk9YfElOVEVSU0VDVFN8RFdJVEhJTnxXSVRISU58Q09OVEFJTlMpL2ksXG4gICAgVU5JVFM6IC9eKG1ldGVycykvaSxcbiAgICBOT1Q6IC9eTk9UL2ksXG4gICAgQkVUV0VFTjogL15CRVRXRUVOL2ksXG4gICAgQkVGT1JFOiAvXkJFRk9SRS9pLFxuICAgIEFGVEVSOiAvXkFGVEVSL2ksXG4gICAgRFVSSU5HOiAvXkRVUklORy9pLFxuICAgIFJFTEFUSVZFOiAvXidSRUxBVElWRVxcKFtBLVphLXowLTkuXSpcXCknL2ksXG4gICAgVElNRTogbmV3IFJlZ0V4cCgnXicgKyB0aW1lUGF0dGVybi5zb3VyY2UpLFxuICAgIFRJTUVfUEVSSU9EOiBuZXcgUmVnRXhwKFxuICAgICAgJ14nICsgdGltZVBhdHRlcm4uc291cmNlICsgJy8nICsgdGltZVBhdHRlcm4uc291cmNlXG4gICAgKSxcbiAgICBHRU9NRVRSWSh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgIGNvbnN0IHR5cGUgPVxuICAgICAgICAvXihQT0lOVHxMSU5FU1RSSU5HfFBPTFlHT058TVVMVElQT0lOVHxNVUxUSUxJTkVTVFJJTkd8TVVMVElQT0xZR09OfEdFT01FVFJZQ09MTEVDVElPTikvLmV4ZWMoXG4gICAgICAgICAgdGV4dFxuICAgICAgICApXG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICBjb25zdCBsZW4gPSB0ZXh0Lmxlbmd0aFxuICAgICAgICBsZXQgaWR4ID0gdGV4dC5pbmRleE9mKCcoJywgdHlwZVswXS5sZW5ndGgpXG4gICAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICAgIGxldCBkZXB0aCA9IDFcbiAgICAgICAgICB3aGlsZSAoaWR4IDwgbGVuICYmIGRlcHRoID4gMCkge1xuICAgICAgICAgICAgaWR4KytcbiAgICAgICAgICAgIHN3aXRjaCAodGV4dC5jaGFyQXQoaWR4KSkge1xuICAgICAgICAgICAgICBjYXNlICcoJzpcbiAgICAgICAgICAgICAgICBkZXB0aCsrXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSAnKSc6XG4gICAgICAgICAgICAgICAgZGVwdGgtLVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIC8vIGluIGRlZmF1bHQgY2FzZSwgZG8gbm90aGluZ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3RleHQuc3Vic3RyKDAsIGlkeCArIDEpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuICAgIEVORDogL14kLyxcbiAgfSBhcyBSZWNvcmQ8UGF0dGVybk5hbWVzVHlwZSB8ICdFTkQnLCBQYXR0ZXJuUmV0dXJuVHlwZT4sXG4gIGZvbGxvd3MgPSB7XG4gICAgUk9PVF9OT0RFOiBbXG4gICAgICAnTk9UJyxcbiAgICAgICdHRU9NRVRSWScsXG4gICAgICAnU1BBVElBTCcsXG4gICAgICAnRklMVEVSX0ZVTkNUSU9OJyxcbiAgICAgICdQUk9QRVJUWScsXG4gICAgICAnTFBBUkVOJyxcbiAgICBdLFxuICAgIExQQVJFTjogW1xuICAgICAgJ05PVCcsXG4gICAgICAnR0VPTUVUUlknLFxuICAgICAgJ1NQQVRJQUwnLFxuICAgICAgJ0ZJTFRFUl9GVU5DVElPTicsXG4gICAgICAnUFJPUEVSVFknLFxuICAgICAgJ1ZBTFVFJyxcbiAgICAgICdMUEFSRU4nLFxuICAgIF0sXG4gICAgUlBBUkVOOiBbJ05PVCcsICdMT0dJQ0FMJywgJ0VORCcsICdSUEFSRU4nLCAnQ09NUEFSSVNPTicsICdDT01NQSddLFxuICAgIFBST1BFUlRZOiBbXG4gICAgICAnQ09NUEFSSVNPTicsXG4gICAgICAnQkVUV0VFTicsXG4gICAgICAnQ09NTUEnLFxuICAgICAgJ0lTX05VTEwnLFxuICAgICAgJ0JFRk9SRScsXG4gICAgICAnQUZURVInLFxuICAgICAgJ0RVUklORycsXG4gICAgICAnUlBBUkVOJyxcbiAgICBdLFxuICAgIEJFVFdFRU46IFsnVkFMVUUnXSxcbiAgICBJU19OVUxMOiBbJ1JQQVJFTicsICdMT0dJQ0FMJywgJ1snLCAnXSddLFxuICAgIENPTVBBUklTT046IFsnUkVMQVRJVkUnLCAnVkFMVUUnLCAnQk9PTEVBTiddLFxuICAgIENPTU1BOiBbJ0ZJTFRFUl9GVU5DVElPTicsICdHRU9NRVRSWScsICdWQUxVRScsICdVTklUUycsICdQUk9QRVJUWSddLFxuICAgIFZBTFVFOiBbJ0xPR0lDQUwnLCAnQ09NTUEnLCAnUlBBUkVOJywgJ0VORCddLFxuICAgIEJPT0xFQU46IFsnUlBBUkVOJ10sXG4gICAgU1BBVElBTDogWydMUEFSRU4nXSxcbiAgICBVTklUUzogWydSUEFSRU4nXSxcbiAgICBMT0dJQ0FMOiBbXG4gICAgICAnRklMVEVSX0ZVTkNUSU9OJyxcbiAgICAgICdOT1QnLFxuICAgICAgJ1ZBTFVFJyxcbiAgICAgICdTUEFUSUFMJyxcbiAgICAgICdQUk9QRVJUWScsXG4gICAgICAnTFBBUkVOJyxcbiAgICBdLFxuICAgIE5PVDogWydQUk9QRVJUWScsICdMUEFSRU4nXSxcbiAgICBHRU9NRVRSWTogWydDT01NQScsICdSUEFSRU4nXSxcbiAgICBCRUZPUkU6IFsnVElNRSddLFxuICAgIEFGVEVSOiBbJ1RJTUUnXSxcbiAgICBEVVJJTkc6IFsnVElNRV9QRVJJT0QnXSxcbiAgICBUSU1FOiBbJ0xPR0lDQUwnLCAnUlBBUkVOJywgJ0VORCddLFxuICAgIFRJTUVfUEVSSU9EOiBbJ0xPR0lDQUwnLCAnUlBBUkVOJywgJ0VORCddLFxuICAgIFJFTEFUSVZFOiBbJ1JQQVJFTicsICdFTkQnXSxcbiAgICBGSUxURVJfRlVOQ1RJT046IFsnTFBBUkVOJywgJ1BST1BFUlRZJywgJ1ZBTFVFJywgJ1JQQVJFTiddLFxuICAgIEVORDogW10sXG4gIH0gYXMgUmVjb3JkPFxuICAgIFBhdHRlcm5OYW1lc1R5cGUgfCAnUk9PVF9OT0RFJyB8ICdFTkQnLFxuICAgIEFycmF5PFBhdHRlcm5OYW1lc1R5cGUgfCAnRU5EJz5cbiAgPixcbiAgcHJlY2VkZW5jZSA9IHtcbiAgICBSUEFSRU46IDMsXG4gICAgTE9HSUNBTDogMixcbiAgICBDT01QQVJJU09OOiAxLFxuICB9IGFzIFJlY29yZDxQcmVjZW5kZW5jZVR5cGUsIG51bWJlcj4sXG4gIC8vIGFzIGFuIGltcHJvdmVtZW50LCB0aGVzZSBjb3VsZCBiZSBmaWd1cmVkIG91dCB3aGlsZSBidWlsZGluZyB0aGUgc3ludGF4IHRyZWVcbiAgZmlsdGVyRnVuY3Rpb25QYXJhbUNvdW50ID0ge1xuICAgIHByb3hpbWl0eTogMyxcbiAgICBwaTogMCxcbiAgfSBhcyBSZWNvcmQ8RmlsdGVyRnVuY3Rpb25OYW1lcywgbnVtYmVyPixcbiAgZGF0ZVRpbWVGb3JtYXQgPSBcInl5eXktTU0tZGQnVCdISDptbTpzcy5TU1MnWidcIlxuXG5mdW5jdGlvbiB0cnlUb2tlbih0ZXh0OiBzdHJpbmcsIHBhdHRlcm46IFBhdHRlcm5SZXR1cm5UeXBlKSB7XG4gIGlmIChwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4uZXhlYyh0ZXh0KVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXR0ZXJuKHRleHQpXG4gIH1cbn1cblxuZnVuY3Rpb24gbmV4dFRva2VuKHRleHQ6IHN0cmluZywgdG9rZW5zOiBBcnJheTxQYXR0ZXJuTmFtZXNUeXBlIHwgJ0VORCc+KSB7XG4gIGxldCBpLFxuICAgIHRva2VuLFxuICAgIGxlbiA9IHRva2Vucy5sZW5ndGhcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdG9rZW4gPSB0b2tlbnNbaV1cbiAgICBjb25zdCBwYXQgPSBwYXR0ZXJuc1t0b2tlbl1cbiAgICBjb25zdCBtYXRjaGVzID0gdHJ5VG9rZW4odGV4dCwgcGF0KVxuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICBjb25zdCBtYXRjaCA9IG1hdGNoZXNbMF1cbiAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHRleHQuc3Vic3RyKG1hdGNoLmxlbmd0aCkucmVwbGFjZSgvXlxccyovLCAnJylcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHRva2VuLFxuICAgICAgICB0ZXh0OiBtYXRjaCxcbiAgICAgICAgcmVtYWluZGVyLFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBtc2cgPSAnRVJST1I6IEluIHBhcnNpbmc6IFsnICsgdGV4dCArICddLCBleHBlY3RlZCBvbmUgb2Y6ICdcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdG9rZW4gPSB0b2tlbnNbaV1cbiAgICBtc2cgKz0gJ1xcbiAgICAnICsgdG9rZW4gKyAnOiAnICsgcGF0dGVybnNbdG9rZW5dXG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IobXNnKVxufVxuXG50eXBlIFRva2VuVHlwZSA9IHtcbiAgdHlwZTogUGF0dGVybk5hbWVzVHlwZSB8ICdFTkQnXG4gIHRleHQ6IHN0cmluZ1xuICByZW1haW5kZXI6IHN0cmluZ1xufVxuXG5mdW5jdGlvbiB0b2tlbml6ZSh0ZXh0OiBzdHJpbmcpOiBBcnJheTxUb2tlblR5cGU+IHtcbiAgY29uc3QgcmVzdWx0cyA9IFtdXG4gIGxldCB0b2tlbiA9IHVuZGVmaW5lZCBhcyB1bmRlZmluZWQgfCBUb2tlblR5cGVcbiAgbGV0IGV4cGVjdCA9IGZvbGxvd3NbJ1JPT1RfTk9ERSddXG5cbiAgZG8ge1xuICAgIHRva2VuID0gbmV4dFRva2VuKHRleHQsIGV4cGVjdClcbiAgICB0ZXh0ID0gdG9rZW4ucmVtYWluZGVyXG4gICAgZXhwZWN0ID0gZm9sbG93c1t0b2tlbi50eXBlXVxuICAgIGlmICh0b2tlbi50eXBlICE9PSAnRU5EJyAmJiAhZXhwZWN0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGZvbGxvd3MgbGlzdCBmb3IgJyArIHRva2VuLnR5cGUpXG4gICAgfVxuICAgIHJlc3VsdHMucHVzaCh0b2tlbilcbiAgfSB3aGlsZSAodG9rZW4udHlwZSAhPT0gJ0VORCcpXG4gIHJldHVybiByZXN1bHRzXG59XG5cbnR5cGUgU3BlY2lhbENRTENoYXJhY3RlcnMgPSAnJScgfCAnXydcblxuLy8gTWFwcGluZyBvZiBJbnRyaWd1ZSdzIHF1ZXJ5IGxhbmd1YWdlIHN5bnRheCB0byBDUUwgc3ludGF4XG5jb25zdCB1c2VycWxUb0NxbCA9IHtcbiAgJyonOiAnJScsXG4gICc/JzogJ18nLFxuICAnJSc6ICdcXFxcJScsXG4gIF86ICdcXFxcXycsXG59XG5cbmNvbnN0IHRyYW5zbGF0ZVVzZXJxbFRvQ3FsID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5yZXBsYWNlKFxuICAgIC8oW14qPyVfXSk/KFsqPyVfXSkvZyxcbiAgICAoXywgYSA9ICcnLCBiKSA9PlxuICAgICAgYSArIChhID09PSAnXFxcXCcgPyBiIDogdXNlcnFsVG9DcWxbYiBhcyBTcGVjaWFsQ1FMQ2hhcmFjdGVyc10pXG4gIClcblxuLy9NYXBwaW5nIG9mIENRTCBzeW50YXggdG8gSW50cmlndWUncyBxdWVyeSBsYW5ndWFnZSBzeW50YXhcbmNvbnN0IGNxbFRvVXNlcnFsID0ge1xuICAnJSc6ICcqJyxcbiAgXzogJz8nLFxufSBhcyBSZWNvcmQ8U3BlY2lhbENRTENoYXJhY3RlcnMsIHN0cmluZz5cblxuY29uc3QgdHJhbnNsYXRlQ3FsVG9Vc2VycWwgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLnJlcGxhY2UoLyhbXiVfXSk/KFslX10pL2csIChfLCBhID0gJycsIGIpID0+XG4gICAgYSA9PT0gJ1xcXFwnID8gYiA6IGEgKyBjcWxUb1VzZXJxbFtiIGFzIFNwZWNpYWxDUUxDaGFyYWN0ZXJzXVxuICApXG5cbmNvbnN0IGdldE5leHRUb2tlbiA9IChwb3N0Zml4OiBBcnJheTxUb2tlblR5cGU+KTogVG9rZW5UeXBlID0+IHtcbiAgaWYgKFxuICAgIHBvc3RmaXhbcG9zdGZpeC5sZW5ndGggLSAzXSAmJlxuICAgIHBvc3RmaXhbcG9zdGZpeC5sZW5ndGggLSAzXS50eXBlID09PSAnRklMVEVSX0ZVTkNUSU9OJ1xuICApIHtcbiAgICAvLyBmaXJzdCB0d28gYXJlIHVzZWxlc3NcbiAgICBwb3N0Zml4LnBvcCgpXG4gICAgcG9zdGZpeC5wb3AoKVxuICAgIHJldHVybiBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICB9XG4gIGlmIChcbiAgICBwb3N0Zml4W3Bvc3RmaXgubGVuZ3RoIC0gMl0gJiZcbiAgICBwb3N0Zml4W3Bvc3RmaXgubGVuZ3RoIC0gMl0udHlwZSA9PT0gJ1JFTEFUSVZFJ1xuICApIHtcbiAgICAvLyBmaXJzdCBvbmUgaXMgdXNlbGVzc1xuICAgIHBvc3RmaXgucG9wKClcbiAgICByZXR1cm4gcG9zdGZpeC5wb3AoKSBhcyBUb2tlblR5cGVcbiAgfVxuICByZXR1cm4gcG9zdGZpeC5wb3AoKSBhcyBUb2tlblR5cGVcbn1cblxuY29uc3QgZ2V0R2VvRmlsdGVycyA9IChcbiAgd2t0OiBzdHJpbmcsXG4gIHByb3BlcnR5OiBzdHJpbmcsXG4gIGJ1ZmZlcj86IHN0cmluZ1xuKTogRmlsdGVyQ2xhc3MgfCBGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICBpZiAod2t0LnN0YXJ0c1dpdGgoJ0dFT01FVFJZQ09MTEVDVElPTicpKSB7XG4gICAgY29uc3QgcGFyc2VkV2t0ID0gd2t4Lkdlb21ldHJ5LnBhcnNlKHdrdClcbiAgICBjb25zdCBnZW9Kc29uID0gcGFyc2VkV2t0LnRvR2VvSlNPTigpIGFzIGFueVxuICAgIGNvbnN0IGlubmVyV2t0czogc3RyaW5nW10gPSBnZW9Kc29uLmdlb21ldHJpZXMubWFwKChnZW9tZXRyeTogYW55KSA9PlxuICAgICAgd2t4Lkdlb21ldHJ5LnBhcnNlR2VvSlNPTihnZW9tZXRyeSkudG9Xa3QoKVxuICAgIClcbiAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICB0eXBlOiAnT1InLFxuICAgICAgZmlsdGVyczogaW5uZXJXa3RzLm1hcCgod2t0KSA9PiBnZXRHZW9GaWx0ZXJzKHdrdCwgcHJvcGVydHksIGJ1ZmZlcikpLFxuICAgIH0pXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ0xJTkVTVFJJTkcnKSkge1xuICAgIGNvbnN0IGxpbmUgPSBDUUxVdGlscy5hcnJheUZyb21MaW5lc3RyaW5nV2t0KHdrdClcbiAgICByZXR1cm4gZ2V0TGluZXN0cmluZ0ZpbHRlcihsaW5lLCBwcm9wZXJ0eSwgYnVmZmVyKVxuICB9IGVsc2UgaWYgKHdrdC5zdGFydHNXaXRoKCdNVUxUSUxJTkVTVFJJTkcnKSkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdPUicsXG4gICAgICBmaWx0ZXJzOiBDUUxVdGlscy5hcnJheUZyb21NdWx0aWxpbmVzdHJpbmdXa3Qod2t0KS5tYXAoXG4gICAgICAgIChsaW5lOiBudW1iZXJbXVtdKSA9PiBnZXRMaW5lc3RyaW5nRmlsdGVyKGxpbmUsIHByb3BlcnR5LCBidWZmZXIpXG4gICAgICApLFxuICAgIH0pXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ1BPTFlHT04nKSkge1xuICAgIGNvbnN0IHBvbHkgPSBDUUxVdGlscy5hcnJheUZyb21Qb2x5Z29uV2t0KHdrdClcbiAgICByZXR1cm4gZ2V0UG9seWdvbkZpbHRlcihwb2x5LCBwcm9wZXJ0eSwgYnVmZmVyKVxuICB9IGVsc2UgaWYgKHdrdC5zdGFydHNXaXRoKCdNVUxUSVBPTFlHT04nKSkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdPUicsXG4gICAgICBmaWx0ZXJzOiBDUUxVdGlscy5hcnJheUZyb21Qb2x5Z29uV2t0KHdrdCkubWFwKChwb2x5OiBudW1iZXJbXVtdKSA9PlxuICAgICAgICBnZXRQb2x5Z29uRmlsdGVyKHBvbHksIHByb3BlcnR5LCBidWZmZXIpXG4gICAgICApLFxuICAgIH0pXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ1BPSU5UJykpIHtcbiAgICBjb25zdCBwb2ludCA9IENRTFV0aWxzLmFycmF5RnJvbVBvaW50V2t0KHdrdClbMF1cbiAgICByZXR1cm4gZ2V0UG9pbnRSYWRpdXNGaWx0ZXIocG9pbnQsIHByb3BlcnR5LCBidWZmZXIpXG4gIH0gZWxzZSBpZiAod2t0LnN0YXJ0c1dpdGgoJ01VTFRJUE9JTlQnKSkge1xuICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6ICdPUicsXG4gICAgICBmaWx0ZXJzOiBDUUxVdGlscy5hcnJheUZyb21Qb2ludFdrdCh3a3QpLm1hcCgocG9pbnQ6IFtudW1iZXIsIG51bWJlcl0pID0+XG4gICAgICAgIGdldFBvaW50UmFkaXVzRmlsdGVyKHBvaW50LCBwcm9wZXJ0eSwgYnVmZmVyKVxuICAgICAgKSxcbiAgICB9KVxuICB9XG4gIHRocm93IG5ldyBFcnJvcignVW5rbm93biBzcGF0aWFsIHR5cGUgZW5jb3VudGVyZWQnKVxufVxuXG5mdW5jdGlvbiBidWlsZFRyZWUocG9zdGZpeDogQXJyYXk8VG9rZW5UeXBlPik6IGFueSB7XG4gIGxldCB2YWx1ZSxcbiAgICBwcm9wZXJ0eSxcbiAgICB0b2sgPSBnZXROZXh0VG9rZW4ocG9zdGZpeClcbiAgY29uc3QgdG9rZW5UeXBlID0gdG9rLnR5cGVcbiAgc3dpdGNoICh0b2tlblR5cGUpIHtcbiAgICBjYXNlICdMT0dJQ0FMJzpcbiAgICAgIGNvbnN0IHJocyA9IGJ1aWxkVHJlZShwb3N0Zml4KSxcbiAgICAgICAgbGhzID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtsaHMsIHJoc10sXG4gICAgICAgIHR5cGU6IHRvay50ZXh0LnRvVXBwZXJDYXNlKCkgYXMgRmlsdGVyQnVpbGRlckNsYXNzWyd0eXBlJ10sXG4gICAgICB9KVxuICAgIGNhc2UgJ05PVCc6XG4gICAgICBjb25zdCBwZWVrVG9rZW4gPSBwb3N0Zml4W3Bvc3RmaXgubGVuZ3RoIC0gMV0gYXMgVG9rZW5UeXBlXG4gICAgICBpZiAocGVla1Rva2VuLnR5cGUgPT09ICdMT0dJQ0FMJykge1xuICAgICAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgLi4uYnVpbGRUcmVlKHBvc3RmaXgpLFxuICAgICAgICAgIG5lZ2F0ZWQ6IHRydWUsXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKHBlZWtUb2tlbi50eXBlID09PSAnTk9UJykge1xuICAgICAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgZmlsdGVyczogW2J1aWxkVHJlZShwb3N0Zml4KV0sXG4gICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgIC4uLmJ1aWxkVHJlZShwb3N0Zml4KSxcbiAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIGNhc2UgJ0JFVFdFRU4nOiAvLyB3b3Jrc1xuICAgICAgbGV0IG1pbiwgbWF4XG4gICAgICBwb3N0Zml4LnBvcCgpIC8vIHVubmVlZGVkIEFORCB0b2tlbiBoZXJlXG4gICAgICBtYXggPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIG1pbiA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgcHJvcGVydHkgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICBzdGFydDogbWluLFxuICAgICAgICAgIGVuZDogbWF4LFxuICAgICAgICB9IGFzIFZhbHVlVHlwZXNbJ2JldHdlZW4nXSxcbiAgICAgICAgdHlwZTogdG9rZW5UeXBlIGFzIEZpbHRlckNsYXNzWyd0eXBlJ10sXG4gICAgICB9KVxuICAgIGNhc2UgJ0JFRk9SRSc6IC8vIHdvcmtzXG4gICAgY2FzZSAnQUZURVInOiAvLyB3b3Jrc1xuICAgICAgdmFsdWUgPSBidWlsZFRyZWUocG9zdGZpeClcbiAgICAgIHByb3BlcnR5ID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHZhbHVlOiB2YWx1ZSBhcyBWYWx1ZVR5cGVzWydkYXRlJ10sXG4gICAgICAgIHR5cGU6IHRvay50ZXh0LnRvVXBwZXJDYXNlKCkgYXMgRmlsdGVyQ2xhc3NbJ3R5cGUnXSxcbiAgICAgIH0pXG4gICAgY2FzZSAnRFVSSU5HJzogLy8gdGVjaG5pY2FsbHkgYmV0d2VlbiBmb3IgZGF0ZXMsIHdvcmtzXG4gICAgICBjb25zdCBkYXRlcyA9IGJ1aWxkVHJlZShwb3N0Zml4KS5zcGxpdCgnLycpXG4gICAgICBwcm9wZXJ0eSA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5LFxuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIHN0YXJ0OiBkYXRlc1swXSxcbiAgICAgICAgICBlbmQ6IGRhdGVzWzFdLFxuICAgICAgICB9IGFzIFZhbHVlVHlwZXNbJ2R1cmluZyddLFxuICAgICAgICB0eXBlOiB0b2sudGV4dC50b1VwcGVyQ2FzZSgpIGFzIEZpbHRlckNsYXNzWyd0eXBlJ10sXG4gICAgICB9KVxuICAgIGNhc2UgJ0NPTVBBUklTT04nOiAvLyB3b3Jrc1xuICAgICAgdmFsdWUgPSBidWlsZFRyZWUocG9zdGZpeCkgYXMgVmFsdWVUeXBlc1snaW50ZWdlciddXG4gICAgICBwcm9wZXJ0eSA9IGJ1aWxkVHJlZShwb3N0Zml4KVxuICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHByb3BlcnR5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdHlwZTogdG9rLnRleHQudG9VcHBlckNhc2UoKSBhcyBGaWx0ZXJDbGFzc1sndHlwZSddLFxuICAgICAgfSlcbiAgICBjYXNlICdJU19OVUxMJzogLy8gd29ya3NcbiAgICAgIHByb3BlcnR5ID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gICAgICByZXR1cm4gbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgcHJvcGVydHksXG4gICAgICAgIHR5cGU6IHRvay50ZXh0LnRvVXBwZXJDYXNlKCkgYXMgRmlsdGVyQ2xhc3NbJ3R5cGUnXSxcbiAgICAgIH0pXG4gICAgY2FzZSAnVkFMVUUnOiAvL3dvcmtzXG4gICAgICBjb25zdCBtYXRjaCA9IHRvay50ZXh0Lm1hdGNoKC9eJyguKiknJC8pXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgaWYgKHVud3JhcChwb3N0Zml4WzBdLnRleHQpID09PSAnaWQnKSB7XG4gICAgICAgICAgLy8gZG9uJ3QgZXNjYXBlIGlkc1xuICAgICAgICAgIHJldHVybiBtYXRjaFsxXS5yZXBsYWNlKC8nJy9nLCBcIidcIilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlQ3FsVG9Vc2VycWwobWF0Y2hbMV0ucmVwbGFjZSgvJycvZywgXCInXCIpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gTnVtYmVyKHRvay50ZXh0KVxuICAgICAgfVxuICAgIGNhc2UgJ0JPT0xFQU4nOiAvLyB3b3Jrc1xuICAgICAgc3dpdGNoICh0b2sudGV4dC50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ1RSVUUnOlxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgY2FzZSAnU1BBVElBTCc6IC8vIHdvcmtpbmdcbiAgICAgIC8vIG5leHQgdG9rZW4gdGVsbHMgdXMgd2hldGhlciB0aGlzIGlzIERXSVRISU4gb3IgSU5URVJTRUNUU1xuICAgICAgc3dpdGNoICh0b2sudGV4dCkge1xuICAgICAgICBjYXNlICdJTlRFUlNFQ1RTJzoge1xuICAgICAgICAgIC8vIHRoaW5ncyB3aXRob3V0IGJ1ZmZlcnMsIGNvdWxkIGJlIHBvbHkgb3IgbGluZVxuICAgICAgICAgIGNvbnN0IHZhbHVlVG9rZW4gPSBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5VG9rZW4gPSBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICAgICAgICAgIHJldHVybiBnZXRHZW9GaWx0ZXJzKHZhbHVlVG9rZW4udGV4dCwgcHJvcGVydHlUb2tlbi50ZXh0LCB1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnRFdJVEhJTic6IHtcbiAgICAgICAgICAvLyB0aGluZ3Mgd2l0aCBidWZmZXJzLCBjb3VsZCBiZSBwb2x5LCBsaW5lIG9yIHBvaW50XG4gICAgICAgICAgY29uc3QgYnVmZmVyVG9rZW4gPSBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICAgICAgICAgIGNvbnN0IHZhbHVlVG9rZW4gPSBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5VG9rZW4gPSBwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZVxuICAgICAgICAgIHJldHVybiBnZXRHZW9GaWx0ZXJzKFxuICAgICAgICAgICAgdmFsdWVUb2tlbi50ZXh0LFxuICAgICAgICAgICAgcHJvcGVydHlUb2tlbi50ZXh0LFxuICAgICAgICAgICAgYnVmZmVyVG9rZW4udGV4dFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBzcGF0aWFsIHR5cGUgZW5jb3VudGVyZWQnKVxuICAgICAgfVxuICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHRva2VuVHlwZSxcbiAgICAgICAgdmFsdWU6IHRvay50ZXh0LFxuICAgICAgfVxuICAgIGNhc2UgJ1JFTEFUSVZFJzpcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnUkVMQVRJVkUnLFxuICAgICAgICB2YWx1ZTogZGVzZXJpYWxpemUuZGF0ZVJlbGF0aXZlKHRvay50ZXh0KSxcbiAgICAgICAgcHJvcGVydHk6IChwb3N0Zml4LnBvcCgpIGFzIFRva2VuVHlwZSkudGV4dCxcbiAgICAgIH0pXG4gICAgY2FzZSAnRklMVEVSX0ZVTkNUSU9OJzogLy8gd29ya2luZ1xuICAgICAgY29uc3QgZmlsdGVyRnVuY3Rpb25OYW1lID0gdG9rLnRleHQuc2xpY2UoMCwgLTEpIC8vIHJlbW92ZSB0cmFpbGluZyAnKCdcbiAgICAgIGNvbnN0IHBhcmFtQ291bnQgPVxuICAgICAgICBmaWx0ZXJGdW5jdGlvblBhcmFtQ291bnRbZmlsdGVyRnVuY3Rpb25OYW1lIGFzIEZpbHRlckZ1bmN0aW9uTmFtZXNdXG4gICAgICBpZiAocGFyYW1Db3VudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgZmlsdGVyIGZ1bmN0aW9uOiAnICsgZmlsdGVyRnVuY3Rpb25OYW1lKVxuICAgICAgfVxuICAgICAgY29uc3QgcGFyYW1zID0gQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkocGFyYW1Db3VudCkpXG4gICAgICAgIC5tYXAoKCkgPT4gYnVpbGRUcmVlKHBvc3RmaXgpKVxuICAgICAgICAucmV2ZXJzZSgpXG4gICAgICBzd2l0Y2ggKGZpbHRlckZ1bmN0aW9uTmFtZSkge1xuICAgICAgICBjYXNlICdwcm94aW1pdHknOlxuICAgICAgICAgIGNvbnN0IHByb3hpbWl0eVN0cmluZ3MgPSBwYXJhbXNbMl0gYXMgc3RyaW5nXG4gICAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnRklMVEVSIEZVTkNUSU9OIHByb3hpbWl0eScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogcGFyYW1zWzBdLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgZmlyc3Q6IHByb3hpbWl0eVN0cmluZ3Muc3BsaXQoJyAnKVswXSxcbiAgICAgICAgICAgICAgc2Vjb25kOiBwcm94aW1pdHlTdHJpbmdzLnNwbGl0KCcgJylbMV0sXG4gICAgICAgICAgICAgIGRpc3RhbmNlOiBwYXJhbXNbMV0sXG4gICAgICAgICAgICB9IGFzIFZhbHVlVHlwZXNbJ3Byb3hpbWl0eSddLFxuICAgICAgICAgIH0pXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGZpbHRlciBmdW5jdGlvbicpXG4gICAgICB9XG4gICAgY2FzZSAnVElNRV9QRVJJT0QnOlxuICAgICAgcmV0dXJuIHRvay50ZXh0XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0b2sudGV4dFxuICB9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXN0KHRva2VuczogVG9rZW5UeXBlW10pIHtcbiAgY29uc3Qgb3BlcmF0b3JTdGFjayA9IFtdIGFzIEFycmF5PFRva2VuVHlwZT4sXG4gICAgcG9zdGZpeCA9IFtdIGFzIEFycmF5PFRva2VuVHlwZT5cblxuICB3aGlsZSAodG9rZW5zLmxlbmd0aCkge1xuICAgIGNvbnN0IHRvayA9IHRva2Vucy5zaGlmdCgpIGFzIFRva2VuVHlwZVxuICAgIHN3aXRjaCAodG9rLnR5cGUpIHtcbiAgICAgIGNhc2UgJ1BST1BFUlRZJzpcbiAgICAgICAgdG9rLnRleHQgPSB1bndyYXAodG9rLnRleHQpXG4gICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICBjYXNlICdWQUxVRSc6XG4gICAgICBjYXNlICdUSU1FJzpcbiAgICAgIGNhc2UgJ1RJTUVfUEVSSU9EJzpcbiAgICAgIGNhc2UgJ1JFTEFUSVZFJzpcbiAgICAgIGNhc2UgJ0JPT0xFQU4nOlxuICAgICAgICBwb3N0Zml4LnB1c2godG9rKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnQ09NUEFSSVNPTic6XG4gICAgICBjYXNlICdCRVRXRUVOJzpcbiAgICAgIGNhc2UgJ0lTX05VTEwnOlxuICAgICAgY2FzZSAnTE9HSUNBTCc6XG4gICAgICBjYXNlICdCRUZPUkUnOlxuICAgICAgY2FzZSAnQUZURVInOlxuICAgICAgY2FzZSAnRFVSSU5HJzpcbiAgICAgICAgY29uc3QgcCA9IHByZWNlZGVuY2VbdG9rLnR5cGUgYXMgUHJlY2VuZGVuY2VUeXBlXVxuXG4gICAgICAgIHdoaWxlIChcbiAgICAgICAgICBvcGVyYXRvclN0YWNrLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICBwcmVjZWRlbmNlW1xuICAgICAgICAgICAgb3BlcmF0b3JTdGFja1tvcGVyYXRvclN0YWNrLmxlbmd0aCAtIDFdLnR5cGUgYXMgUHJlY2VuZGVuY2VUeXBlXG4gICAgICAgICAgXSA8PSBwXG4gICAgICAgICkge1xuICAgICAgICAgIHBvc3RmaXgucHVzaChvcGVyYXRvclN0YWNrLnBvcCgpIGFzIFRva2VuVHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZXJhdG9yU3RhY2sucHVzaCh0b2spXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdTUEFUSUFMJzpcbiAgICAgIGNhc2UgJ05PVCc6XG4gICAgICBjYXNlICdMUEFSRU4nOlxuICAgICAgICBvcGVyYXRvclN0YWNrLnB1c2godG9rKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnRklMVEVSX0ZVTkNUSU9OJzpcbiAgICAgICAgb3BlcmF0b3JTdGFjay5wdXNoKHRvaylcbiAgICAgICAgLy8gaW5zZXJ0IGEgJygnIG1hbnVhbGx5IGJlY2F1c2Ugd2UgbG9zdCB0aGUgb3JpZ2luYWwgTFBBUkVOIG1hdGNoaW5nIHRoZSBGSUxURVJfRlVOQ1RJT04gcmVnZXhcbiAgICAgICAgb3BlcmF0b3JTdGFjay5wdXNoKHsgdHlwZTogJ0xQQVJFTicgfSBhcyBUb2tlblR5cGUpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdSUEFSRU4nOlxuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgb3BlcmF0b3JTdGFjay5sZW5ndGggPiAwICYmXG4gICAgICAgICAgb3BlcmF0b3JTdGFja1tvcGVyYXRvclN0YWNrLmxlbmd0aCAtIDFdLnR5cGUgIT09ICdMUEFSRU4nXG4gICAgICAgICkge1xuICAgICAgICAgIHBvc3RmaXgucHVzaChvcGVyYXRvclN0YWNrLnBvcCgpIGFzIFRva2VuVHlwZSlcbiAgICAgICAgfVxuICAgICAgICBvcGVyYXRvclN0YWNrLnBvcCgpIC8vIHRvc3Mgb3V0IHRoZSBMUEFSRU5cblxuICAgICAgICAvLyBpZiB0aGlzIHJpZ2h0IHBhcmVudGhlc2lzIGVuZHMgYSBmdW5jdGlvbiBhcmd1bWVudCBsaXN0IChpdCdzIG5vdCBmb3IgYSBsb2dpY2FsIGdyb3VwaW5nKSxcbiAgICAgICAgLy8gaXQncyBub3cgdGltZSB0byBhZGQgdGhhdCBmdW5jdGlvbiB0byB0aGUgcG9zdGZpeC1vcmRlcmVkIGxpc3RcbiAgICAgICAgY29uc3QgbGFzdE9wZXJhdG9yVHlwZSA9XG4gICAgICAgICAgb3BlcmF0b3JTdGFjay5sZW5ndGggPiAwICYmXG4gICAgICAgICAgb3BlcmF0b3JTdGFja1tvcGVyYXRvclN0YWNrLmxlbmd0aCAtIDFdLnR5cGVcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGxhc3RPcGVyYXRvclR5cGUgPT09ICdTUEFUSUFMJyB8fFxuICAgICAgICAgIGxhc3RPcGVyYXRvclR5cGUgPT09ICdGSUxURVJfRlVOQ1RJT04nXG4gICAgICAgICkge1xuICAgICAgICAgIHBvc3RmaXgucHVzaChvcGVyYXRvclN0YWNrLnBvcCgpIGFzIFRva2VuVHlwZSlcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnQ09NTUEnOlxuICAgICAgY2FzZSAnRU5EJzpcbiAgICAgIGNhc2UgJ1VOSVRTJzpcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biB0b2tlbiB0eXBlICcgKyB0b2sudHlwZSlcbiAgICB9XG4gIH1cblxuICB3aGlsZSAob3BlcmF0b3JTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgcG9zdGZpeC5wdXNoKG9wZXJhdG9yU3RhY2sucG9wKCkgYXMgVG9rZW5UeXBlKVxuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYnVpbGRUcmVlKHBvc3RmaXgpXG4gIGlmIChwb3N0Zml4Lmxlbmd0aCA+IDApIHtcbiAgICBsZXQgbXNnID0gJ1JlbWFpbmluZyB0b2tlbnMgYWZ0ZXIgYnVpbGRpbmcgQVNUOiBcXG4nXG4gICAgZm9yIChsZXQgaSA9IHBvc3RmaXgubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIG1zZyArPSBwb3N0Zml4W2ldLnR5cGUgKyAnOiAnICsgcG9zdGZpeFtpXS50ZXh0ICsgJ1xcbidcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24gd3JhcChwcm9wZXJ0eTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHdyYXBwZWQgPSBwcm9wZXJ0eVxuICBpZiAoIXdyYXBwZWQuc3RhcnRzV2l0aCgnXCInKSkge1xuICAgIHdyYXBwZWQgPSAnXCInICsgd3JhcHBlZFxuICB9XG4gIGlmICghd3JhcHBlZC5lbmRzV2l0aCgnXCInKSkge1xuICAgIHdyYXBwZWQgPSB3cmFwcGVkICsgJ1wiJ1xuICB9XG4gIHJldHVybiB3cmFwcGVkXG59XG5cbmZ1bmN0aW9uIHVud3JhcChwcm9wZXJ0eTogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gUmVtb3ZlIHNpbmdsZSBhbmQgZG91YmxlIHF1b3RlcyBpZiB0aGV5IGV4aXN0IGluIHByb3BlcnR5IG5hbWVcbiAgcmV0dXJuIHByb3BlcnR5LnJlcGxhY2UoL14nfCckL2csICcnKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxufVxuXG4vLyByZWFsbHkgY291bGQgdXNlIHNvbWUgcmVmYWN0b3JpbmcgdG8gZW5hYmxlIGJldHRlciB0eXBpbmcsIHJpZ2h0IG5vdyBpdCdzIHJlY3Vyc2l2ZSBhbmQgY2FsbHMgaXRzZWxmIHdpdGggc28gbWFueSBkaWZmZXJlbnQgdHlwZXMgLyByZXR1cm4gdHlwZXNcbmZ1bmN0aW9uIHdyaXRlKGZpbHRlcjogYW55KTogYW55IHtcbiAgc3dpdGNoIChmaWx0ZXIudHlwZSkge1xuICAgIC8vIHNwYXRpYWxDbGFzc1xuICAgIGNhc2UgJ0JCT1gnOlxuICAgICAgY29uc3QgeG1pbiA9IGZpbHRlci52YWx1ZVswXSxcbiAgICAgICAgeW1pbiA9IGZpbHRlci52YWx1ZVsxXSxcbiAgICAgICAgeG1heCA9IGZpbHRlci52YWx1ZVsyXSxcbiAgICAgICAgeW1heCA9IGZpbHRlci52YWx1ZVszXVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgJ0JCT1goJyArXG4gICAgICAgIHdyYXAoZmlsdGVyLnByb3BlcnR5KSArXG4gICAgICAgICcsJyArXG4gICAgICAgIHhtaW4gK1xuICAgICAgICAnLCcgK1xuICAgICAgICB5bWluICtcbiAgICAgICAgJywnICtcbiAgICAgICAgeG1heCArXG4gICAgICAgICcsJyArXG4gICAgICAgIHltYXggK1xuICAgICAgICAnKSdcbiAgICAgIClcbiAgICAvLyB2ZXJpZmllZCBsaW5lLCBwb2x5Z29uLCBwb2ludCByYWRpdXNcbiAgICBjYXNlICdEV0lUSElOJzpcbiAgICAgIHJldHVybiBgRFdJVEhJTigke3dyYXAoZmlsdGVyLnByb3BlcnR5KX0sICR7ZmlsdGVyLnZhbHVlfSwgJHtcbiAgICAgICAgZmlsdGVyLmRpc3RhbmNlXG4gICAgICB9LCBtZXRlcnMpYFxuICAgIC8vIHVudXNlZCBhdCB0aGUgbW9tZW50XG4gICAgY2FzZSAnV0lUSElOJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgICdXSVRISU4oJyArIHdyYXAoZmlsdGVyLnByb3BlcnR5KSArICcsICcgKyB3cml0ZShmaWx0ZXIudmFsdWUpICsgJyknXG4gICAgICApXG4gICAgLy8gdmVyaWZpZWQgYmJveFxuICAgIGNhc2UgJ0lOVEVSU0VDVFMnOlxuICAgICAgcmV0dXJuICdJTlRFUlNFQ1RTKCcgKyB3cmFwKGZpbHRlci5wcm9wZXJ0eSkgKyAnLCAnICsgZmlsdGVyLnZhbHVlICsgJyknXG4gICAgLy8gdW51c2VkIGF0IHRoZSBtb21lbnRcbiAgICBjYXNlICdDT05UQUlOUyc6XG4gICAgICByZXR1cm4gKFxuICAgICAgICAnQ09OVEFJTlMoJyArIHdyYXAoZmlsdGVyLnByb3BlcnR5KSArICcsICcgKyB3cml0ZShmaWx0ZXIudmFsdWUpICsgJyknXG4gICAgICApXG4gICAgLy8gYWxsIFwiZ2VvXCIgZmlsdGVycyBwYXNzIHRocm91Z2ggdGhpcyBmaXJzdCwgd2hpY2ggc2VyaWFsaXplcyB0aGVtIGludG8gYSBmb3JtIHRoYXQgY3FsIHVuZGVyc3RhbmRzXG4gICAgLy8gdGhpcyBpcyBvbmx5IGRvbmUgaGVyZSBvbiB0aGUgZmx5IGJlY2F1c2UgdGhlIHRyYW5zZm9ybWF0aW9uIGludm9sdmVzIGEgbG9zcyBvZiBpbmZvcm1hdGlvblxuICAgIC8vIChzdWNoIGFzIHRoZSB1bml0cyBbbWV0ZXJzIG9yIG1pbGVzP10gYW5kIGNvb3JkaW5hdGUgc3lzdGVtIFtkbXMgb3IgbWdycz9dKVxuICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgIHJldHVybiB3cml0ZShzZXJpYWxpemUubG9jYXRpb24oZmlsdGVyLnByb3BlcnR5LCBmaWx0ZXIudmFsdWUpKVxuICAgIC8vIGxvZ2ljYWxDbGFzc1xuICAgIGNhc2UgJ0FORCc6XG4gICAgY2FzZSAnT1InOlxuICAgICAgbGV0IHJlcyA9ICcoJ1xuICAgICAgbGV0IGZpcnN0ID0gdHJ1ZVxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWx0ZXIuZmlsdGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB3cml0dGVuRmlsdGVyID0gd3JpdGUoZmlsdGVyLmZpbHRlcnNbaV0pXG4gICAgICAgIGlmICh3cml0dGVuRmlsdGVyKSB7XG4gICAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgICBmaXJzdCA9IGZhbHNlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcyArPSAnKSAnICsgZmlsdGVyLnR5cGUgKyAnICgnXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcyArPSB3cml0dGVuRmlsdGVyXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXMgKyAnKSdcbiAgICBjYXNlICdOT1QnOlxuICAgICAgLy8gVE9ETzogZGVhbCB3aXRoIHByZWNlZGVuY2Ugb2YgbG9naWNhbCBvcGVyYXRvcnMgdG9cbiAgICAgIC8vIGF2b2lkIGV4dHJhIHBhcmVudGhlc2VzIChub3QgdXJnZW50KVxuICAgICAgcmV0dXJuICdOT1QgKCcgKyB3cml0ZShmaWx0ZXIuZmlsdGVyc1swXSkgKyAnKSdcbiAgICAvLyBjb21wYXJpc29uQ2xhc3NcbiAgICBjYXNlICdJUyBOVUxMJzpcbiAgICAgIHJldHVybiBgKFwiJHtmaWx0ZXIucHJvcGVydHl9XCIgJHtmaWx0ZXIudHlwZX0pYFxuICAgIGNhc2UgJ0JFVFdFRU4nOlxuICAgICAgcmV0dXJuIChcbiAgICAgICAgd3JhcChmaWx0ZXIucHJvcGVydHkpICtcbiAgICAgICAgJyBCRVRXRUVOICcgK1xuICAgICAgICB3cml0ZShNYXRoLm1pbihmaWx0ZXIudmFsdWUuc3RhcnQsIGZpbHRlci52YWx1ZS5lbmQpKSArXG4gICAgICAgICcgQU5EICcgK1xuICAgICAgICB3cml0ZShNYXRoLm1heChmaWx0ZXIudmFsdWUuc3RhcnQsIGZpbHRlci52YWx1ZS5lbmQpKVxuICAgICAgKVxuICAgIGNhc2UgJz0nOlxuICAgIGNhc2UgJzw+JzpcbiAgICBjYXNlICc8JzpcbiAgICBjYXNlICc8PSc6XG4gICAgY2FzZSAnPic6XG4gICAgY2FzZSAnPj0nOlxuICAgIGNhc2UgJ0xJS0UnOlxuICAgIGNhc2UgJ0lMSUtFJzpcbiAgICAgIGxldCBwcm9wZXJ0eSA9XG4gICAgICAgIHR5cGVvZiBmaWx0ZXIucHJvcGVydHkgPT09ICdvYmplY3QnXG4gICAgICAgICAgPyB3cml0ZShmaWx0ZXIucHJvcGVydHkpXG4gICAgICAgICAgOiB3cmFwKHVud3JhcChmaWx0ZXIucHJvcGVydHkpKSAvLyB1bndyYXAgZmlyc3QsIGJlY2F1c2UgdGVjaG5pY2FsbHkgb25seSBcIlwiIGlzIHN1cHBvcnRlZCAoc28gc3dhcCAnJyBmb3IgXCJcIilcblxuICAgICAgaWYgKGZpbHRlci52YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYCR7cHJvcGVydHl9ICR7ZmlsdGVyLnR5cGV9YFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYCR7cHJvcGVydHl9ICR7ZmlsdGVyLnR5cGV9ICR7XG4gICAgICAgIHVud3JhcChmaWx0ZXIucHJvcGVydHkpID09PSAnaWQnXG4gICAgICAgICAgPyBgJyR7ZmlsdGVyLnZhbHVlfSdgXG4gICAgICAgICAgOiB3cml0ZShmaWx0ZXIudmFsdWUpXG4gICAgICB9YCAvLyBkb24ndCBlc2NhcGUgaWRzXG4gICAgLy8gdGVtcG9yYWxDbGFzc1xuICAgIGNhc2UgJ1JFTEFUSVZFJzpcbiAgICAgIC8vIHdlaXJkIHRoaW5nIEkgbm90aWNlZCBpcyB5b3UgaGF2ZSB0byB3cmFwIHRoZSB2YWx1ZSBpbiBzaW5nbGUgcXVvdGVzLCBkb3VibGUgcXVvdGVzIGRvbid0IHdvcmtcbiAgICAgIHJldHVybiBgJHt3cmFwKGZpbHRlci5wcm9wZXJ0eSl9ID0gJyR7c2VyaWFsaXplLmRhdGVSZWxhdGl2ZShcbiAgICAgICAgZmlsdGVyLnZhbHVlXG4gICAgICApfSdgXG4gICAgY2FzZSAnQVJPVU5EJzpcbiAgICAgIHJldHVybiBgJHt3cmFwKGZpbHRlci5wcm9wZXJ0eSl9ICR7c2VyaWFsaXplLmRhdGVBcm91bmQoZmlsdGVyLnZhbHVlKX1gXG4gICAgY2FzZSAnQkVGT1JFJzpcbiAgICBjYXNlICdBRlRFUic6XG4gICAgICByZXR1cm4gKFxuICAgICAgICB3cmFwKGZpbHRlci5wcm9wZXJ0eSkgK1xuICAgICAgICAnICcgK1xuICAgICAgICBmaWx0ZXIudHlwZSArXG4gICAgICAgICcgJyArXG4gICAgICAgIChmaWx0ZXIudmFsdWUgPyBmaWx0ZXIudmFsdWUudG9TdHJpbmcoZGF0ZVRpbWVGb3JtYXQpIDogXCInJ1wiKVxuICAgICAgKVxuICAgIGNhc2UgJ0RVUklORyc6XG4gICAgICByZXR1cm4gYCR7d3JhcChmaWx0ZXIucHJvcGVydHkpfSAke2ZpbHRlci50eXBlfSAke2ZpbHRlci52YWx1ZS5zdGFydH0vJHtcbiAgICAgICAgZmlsdGVyLnZhbHVlLmVuZFxuICAgICAgfWBcbiAgICAvLyBmaWx0ZXJGdW5jdGlvbkNsYXNzXG4gICAgY2FzZSAnRklMVEVSIEZVTkNUSU9OIHByb3hpbWl0eSc6XG4gICAgICAvLyBub3Qgc3VyZSB3aHkgd2UgbmVlZCB0aGUgPSB0cnVlIHBhcnQgYnV0IHdpdGhvdXQgaXQgdGhlIGJhY2tlbmQgZmFpbHMgdG8gcGFyc2VcbiAgICAgIHJldHVybiBgcHJveGltaXR5KCR7d3JpdGUoZmlsdGVyLnByb3BlcnR5KX0sJHt3cml0ZShcbiAgICAgICAgZmlsdGVyLnZhbHVlLmRpc3RhbmNlXG4gICAgICApfSwke3dyaXRlKGAke2ZpbHRlci52YWx1ZS5maXJzdH0gJHtmaWx0ZXIudmFsdWUuc2Vjb25kfWApfSkgPSB0cnVlYFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdCT09MRUFOX1RFWFRfU0VBUkNIJzpcbiAgICAgIGNvbnN0IGJvb2xlYW5UZXh0U2VhcmNoRmlsdGVyID0gZmlsdGVyLnZhbHVlIGFzIEJvb2xlYW5UZXh0VHlwZVxuICAgICAgaWYgKGJvb2xlYW5UZXh0U2VhcmNoRmlsdGVyLmVycm9yKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIGlmIChib29sZWFuVGV4dFNlYXJjaEZpbHRlci5jcWwgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBcIihhbnlUZXh0IElMSUtFICcqJylcIlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJvb2xlYW5UZXh0U2VhcmNoRmlsdGVyLmNxbFxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdHJhbnNsYXRlVXNlcnFsVG9DcWwoXCInXCIgKyBmaWx0ZXIucmVwbGFjZSgvJy9nLCBcIicnXCIpICsgXCInXCIpXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcoZmlsdGVyKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZmlsdGVyID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oZmlsdGVyKVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgZW5jb2RlOiBcIiArIGZpbHRlci50eXBlICsgJyAnICsgZmlsdGVyKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNpbXBsaWZ5RmlsdGVycyhjcWxBc3Q6IEZpbHRlckJ1aWxkZXJDbGFzcykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNxbEFzdC5maWx0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHNpbXBsaWZ5QXN0KGNxbEFzdC5maWx0ZXJzW2ldLCBjcWxBc3QpKSB7XG4gICAgICBjcWxBc3QuZmlsdGVycy5zcGxpY2UuYXBwbHkoXG4gICAgICAgIGNxbEFzdC5maWx0ZXJzLFxuICAgICAgICAoW2ksIDFdIGFzIGFueVtdKS5jb25jYXQoXG4gICAgICAgICAgKGNxbEFzdC5maWx0ZXJzW2ldIGFzIEZpbHRlckJ1aWxkZXJDbGFzcykuZmlsdGVyc1xuICAgICAgICApXG4gICAgICApXG4gICAgfVxuICB9XG4gIHJldHVybiBjcWxBc3Rcbn1cblxuLyoqXG4gKiBUaGUgY3VycmVudCByZWFkIGZ1bmN0aW9uIGZvciBjcWwgcHJvZHVjZXMgYW4gdW5vcHRpbWl6ZWQgdHJlZS4gIFdoaWxlIGl0J3MgcG9zc2libGUgd2UgY291bGRcbiAqIGZpeCB0aGUgb3V0cHV0IHRoZXJlLCBJJ20gbm90IHN1cmUgb2YgaG93LiAgSXQgZW5kcyB1cCBwcm9kdWNpbmcgdmVyeSBuZXN0ZWQgZmlsdGVyIHRyZWVzIGZyb21cbiAqIHJlbGF0aXZlbHkgc2ltcGxlIGNxbC5cbiAqIEBwYXJhbSBjcWxBc3RcbiAqIEBwYXJhbSBwYXJlbnROb2RlXG4gKi9cbmZ1bmN0aW9uIHNpbXBsaWZ5QXN0KFxuICBjcWxBc3Q6IEZpbHRlckJ1aWxkZXJDbGFzcyB8IEZpbHRlckNsYXNzLFxuICBwYXJlbnROb2RlPzogRmlsdGVyQnVpbGRlckNsYXNzXG4pIHtcbiAgaWYgKCFpc0ZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpICYmIHBhcmVudE5vZGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSBlbHNlIGlmICghcGFyZW50Tm9kZSkge1xuICAgIGlmIChpc0ZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpKSB7XG4gICAgICBzaW1wbGlmeUZpbHRlcnMoY3FsQXN0KVxuICAgIH1cbiAgICByZXR1cm4gY3FsQXN0XG4gIH0gZWxzZSB7XG4gICAgc2ltcGxpZnlGaWx0ZXJzKGNxbEFzdCBhcyBGaWx0ZXJCdWlsZGVyQ2xhc3MpXG4gICAgaWYgKGNxbEFzdC50eXBlID09PSBwYXJlbnROb2RlLnR5cGUgJiYgIWNxbEFzdC5uZWdhdGVkKSB7XG4gICAgICAvLyB0aGVzZSBhcmUgdGhlIG9ubHkgc2ltcGxpZmljYXRpb25zIHdlIGNhbiBtYWtlIGJhc2VkIG9uIGJvb2xlYW4gYWxnZWJyYSBydWxlc1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHVuY29sbGFwc2VOT1RzKHtcbiAgY3FsQXN0LFxufToge1xuICBjcWxBc3Q6IEZpbHRlckJ1aWxkZXJDbGFzcyB8IEZpbHRlckNsYXNzXG59KTogQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB7XG4gIGlmIChpc0ZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpKSB7XG4gICAgaWYgKGNxbEFzdC5uZWdhdGVkKSB7XG4gICAgICByZXR1cm4gbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ05PVCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogY3FsQXN0LnR5cGUsXG4gICAgICAgICAgICBmaWx0ZXJzOiBjcWxBc3QuZmlsdGVycy5tYXAoKGZpbHRlcikgPT5cbiAgICAgICAgICAgICAgdW5jb2xsYXBzZU5PVHMoeyBjcWxBc3Q6IGZpbHRlciB9KVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiBjcWxBc3QudHlwZSxcbiAgICAgICAgZmlsdGVyczogY3FsQXN0LmZpbHRlcnMubWFwKChmaWx0ZXIpID0+XG4gICAgICAgICAgdW5jb2xsYXBzZU5PVHMoeyBjcWxBc3Q6IGZpbHRlciB9KVxuICAgICAgICApLFxuICAgICAgfSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNxbEFzdC5uZWdhdGVkKSB7XG4gICAgICBjb25zdCBjbG9uZWRGaWVsZEZpbHRlciA9IF9jbG9uZURlZXAoY3FsQXN0KVxuICAgICAgcmV0dXJuIG5ldyBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdOT1QnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIC4uLmNsb25lZEZpZWxkRmlsdGVyLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3FsQXN0XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb25Vc2luZ1N0YXJ0dXBTdG9yZSgpIHtcbiAgcmV0dXJuIGdldERhdGFUeXBlc0NvbmZpZ3VyYXRpb24oe1xuICAgIENvbmZpZ3VyYXRpb246IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbixcbiAgICBNZXRhY2FyZERlZmluaXRpb25zOiBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMsXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGhhbmRsZUJhc2ljRGF0YXR5cGVGaWx0ZXJzKFxuICBjcWxBc3Q6IEZpbHRlckJ1aWxkZXJDbGFzcyB8IEZpbHRlckNsYXNzIHwgQ1FMU3RhbmRhcmRGaWx0ZXJCdWlsZGVyQ2xhc3Ncbik6IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzIHwgRmlsdGVyQ2xhc3Mge1xuICBpZiAoaXNDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpIHx8IGlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkpIHtcbiAgICByZXR1cm4gbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgIHR5cGU6IGNxbEFzdC50eXBlLFxuICAgICAgZmlsdGVyczogY3FsQXN0LmZpbHRlcnMubWFwKChmaWx0ZXIpID0+XG4gICAgICAgIGhhbmRsZUJhc2ljRGF0YXR5cGVGaWx0ZXJzKGZpbHRlcilcbiAgICAgICksXG4gICAgfSlcbiAgfSBlbHNlIGlmIChpc0Jhc2ljRGF0YXR5cGVDbGFzcyhjcWxBc3QpKSB7XG4gICAgY29uc3QgZGF0YVR5cGVDb25maWd1cmF0aW9uID0gZ2V0RGF0YVR5cGVzQ29uZmlndXJhdGlvblVzaW5nU3RhcnR1cFN0b3JlKClcbiAgICBjb25zdCBkYXRhdHlwZUZpbHRlcnM6IEZpbHRlckNsYXNzW10gPSBbXVxuICAgIGNxbEFzdC52YWx1ZS5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICBjb25zdCByZWxldmFudEF0dHJpYnV0ZXMgPSBkYXRhVHlwZUNvbmZpZ3VyYXRpb24udmFsdWVNYXBbdmFsdWVdXG4gICAgICBpZiAocmVsZXZhbnRBdHRyaWJ1dGVzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJlbGV2YW50QXR0cmlidXRlcy5hdHRyaWJ1dGVzKS5tYXAoKGF0dHJpYnV0ZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlbGV2YW50VmFsdWVzID0gcmVsZXZhbnRBdHRyaWJ1dGVzLmF0dHJpYnV0ZXNbYXR0cmlidXRlXVxuICAgICAgICAgIHJlbGV2YW50VmFsdWVzLmZvckVhY2goKHJlbGV2YW50VmFsdWUpID0+IHtcbiAgICAgICAgICAgIGRhdGF0eXBlRmlsdGVycy5wdXNoKFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBhdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlbGV2YW50VmFsdWUsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgbmV3IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICAgIGZpbHRlcnM6IGRhdGF0eXBlRmlsdGVycyxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNxbEFzdFxuICB9XG59XG5cbi8qKlxuICogRm9yIG5vdywgYWxsIHRoaXMgZG9lcyBpcyByZW1vdmUgYW55RGF0ZSBmcm9tIGNxbCBzaW5jZSB0aGF0J3MgcHVyZWx5IGZvciB0aGUgVUkgdG8gdHJhY2sgdGhlIHF1ZXJ5IGJhc2ljIHZpZXcgc3RhdGUgY29ycmVjdGx5LlxuICogV2UgbWlnaHQgd2FudCB0byByZWNvbnNpZGVyIGhvdyB3ZSBkbyB0aGUgYmFzaWMgcXVlcnkgaW4gb3JkZXIgdG8gYXZvaWQgdGhpcyBuZWNlc3NpdHkgKGl0J3MgcmVhbGx5IHRoZSBjaGVja2JveCkuXG4gKlxuICogVGhpcyB3aWxsIG9ubHkgZXZlciBoYXBwZW4gd2l0aCBhIHNwZWNpZmljIHN0cnVjdHVyZSwgc28gd2UgZG9uJ3QgbmVlZCB0byByZWN1cnNlIG9yIGFueXRoaW5nLlxuICovXG5mdW5jdGlvbiByZW1vdmVJbnZhbGlkRmlsdGVycyhcbiAgY3FsQXN0OiBGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB8IENRTFN0YW5kYXJkRmlsdGVyQnVpbGRlckNsYXNzXG4pOiBGaWx0ZXJCdWlsZGVyQ2xhc3MgfCBGaWx0ZXJDbGFzcyB8IGJvb2xlYW4gfCBDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gIC8vIGxvb3Agb3ZlciBmaWx0ZXJzLCBzcGxpY2luZyBvdXQgaW52YWxpZCBvbmVzLCBhdCBlbmQgb2YgbG9vcCBpZiBhbGwgZmlsdGVycyBnb25lLCByZW1vdmUgc2VsZj9cbiAgaWYgKFxuICAgIGlzRmlsdGVyQnVpbGRlckNsYXNzKGNxbEFzdCkgfHxcbiAgICBzaG91bGRCZUZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpIHx8XG4gICAgaXNDUUxTdGFuZGFyZEZpbHRlckJ1aWxkZXJDbGFzcyhjcWxBc3QpXG4gICkge1xuICAgIGxldCBpID0gY3FsQXN0LmZpbHRlcnMubGVuZ3RoXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgY29uc3QgY3VycmVudEZpbHRlciA9IGNxbEFzdC5maWx0ZXJzW2ldXG4gICAgICBjb25zdCB2YWxpZEZpbHRlciA9IHJlbW92ZUludmFsaWRGaWx0ZXJzKGN1cnJlbnRGaWx0ZXIpXG4gICAgICBpZiAoIXZhbGlkRmlsdGVyKSB7XG4gICAgICAgIGNxbEFzdC5maWx0ZXJzLnNwbGljZShpLCAxKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY3FsQXN0LmZpbHRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNxbEFzdC5wcm9wZXJ0eSA9PT0gJ2FueURhdGUnKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKGNxbEFzdC50eXBlID09PSAnQk9PTEVBTl9URVhUX1NFQVJDSCcpIHtcbiAgICAgIGNvbnN0IGJvb2xlYW5UZXh0VmFsdWUgPSBjcWxBc3QudmFsdWUgYXMgQm9vbGVhblRleHRUeXBlXG4gICAgICBpZiAoYm9vbGVhblRleHRWYWx1ZS5lcnJvcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNxbEFzdFxufVxuXG5mdW5jdGlvbiBpdGVyYXRpdmVseVNpbXBsaWZ5KGNxbEFzdDogRmlsdGVyQnVpbGRlckNsYXNzKSB7XG4gIGxldCBwcmV2QXN0ID0gX2Nsb25lRGVlcChjcWxBc3QpXG4gIHNpbXBsaWZ5QXN0KGNxbEFzdClcbiAgd2hpbGUgKEpTT04uc3RyaW5naWZ5KHByZXZBc3QpICE9PSBKU09OLnN0cmluZ2lmeShjcWxBc3QpKSB7XG4gICAgcHJldkFzdCA9IF9jbG9uZURlZXAoY3FsQXN0KVxuICAgIHNpbXBsaWZ5QXN0KGNxbEFzdClcbiAgfVxuICByZXR1cm4gY3FsQXN0XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIHVzZWQgb25seSB0byB0ZXN0IHJlY29uc3RpdHV0aW9uLCBvciBhcyBhIGxhc3QgcmVzb3J0IHRvIGhhbmRsZSB1cGdyYWRlcyBmcm9tIGEgc3lzdGVtIHdoZXJlIHRoZSBmaWx0ZXIgdHJlZSBpc1xuICAgKiBubyBsb25nZXIgY29tcGF0aWJsZS4gIE5vIGxvc3Mgb2YgYWNjdXJhY3kgd2lsbCBvY2N1ciwgYnV0IG5pY2UgVVggdG91Y2hlcyBsaWtlIHJlbWVtYmVyaW5nIGNvb3JkaW5hdGUgc3lzdGVtcyBhbmQgdW5pdHMgd2lsbC5cbiAgICpcbiAgICogQWxzbywgaXQgbWF5IGdyb3VwIHRoaW5ncyBzbGlnaHRseSBkaWZmZXJlbnQgKHdlIGRvIG91ciBiZXN0IGVmZm9ydCwgYnV0IHRoZSBwb3N0Zml4IG5vdGF0aW9uIHRlY2huaWNhbGx5IGNhdXNlcyBwYXJlbnMgYXJvdW5kIGV2ZXJ5dGhpbmcsIGFuZCBmcm9tIHRoZXJlXG4gICAqIHdlIGRvIGEgc2ltcGxpZmljYXRpb24sIHdoaWNoIG1lYW5zIHRoZSByZXN1bHRpbmcgZmlsdGVyIHRyZWUgbWF5IGxvb2sgc2ltcGxlciB0aGFuIHlvdSByZW1lbWJlcikuICBIb3dldmVyLCBvbmNlIGFnYWluLCB0aGUgYWNjdXJhY3kgYW5kXG4gICAqIHJlc3VsdHMgcmV0dXJuZWQgYnkgdGhlIHNlYXJjaCB3aWxsIHJlbWFpbiB0aGUgc2FtZS5cbiAgICogQHBhcmFtIGNxbFxuICAgKi9cbiAgcmVhZChjcWw/OiBzdHJpbmcpOiBGaWx0ZXJCdWlsZGVyQ2xhc3Mge1xuICAgIGlmIChjcWwgPT09IHVuZGVmaW5lZCB8fCBjcWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXSxcbiAgICAgIH0pXG4gICAgfVxuICAgIC8vIGlmIGFueXRoaW5nIGdvZXMgd3JvbmcsIHNpbXBseSBsb2cgdGhlIGVycm9yIGFuZCBtb3ZlIG9uIChyZXR1cm4gYSBkZWZhdWx0IGZpbHRlciB0cmVlKS5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVjb25zdHJ1Y3RlZEZpbHRlciA9IHRoaXMuc2ltcGxpZnkoYnVpbGRBc3QodG9rZW5pemUoY3FsKSkpXG4gICAgICBpZiAoXG4gICAgICAgIGlzRmlsdGVyQnVpbGRlckNsYXNzKHJlY29uc3RydWN0ZWRGaWx0ZXIpIHx8XG4gICAgICAgIHNob3VsZEJlRmlsdGVyQnVpbGRlckNsYXNzKHJlY29uc3RydWN0ZWRGaWx0ZXIpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3MocmVjb25zdHJ1Y3RlZEZpbHRlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICBmaWx0ZXJzOiBbcmVjb25zdHJ1Y3RlZEZpbHRlciBhcyBGaWx0ZXJDbGFzc10sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgIHJldHVybiBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHsgdHlwZTogJ0FORCcsIGZpbHRlcnM6IFtdIH0pXG4gICAgfVxuICB9LFxuICB3cml0ZShmaWx0ZXI6IEZpbHRlckJ1aWxkZXJDbGFzcyk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIGNvbnN0IGR1cGxpY2F0ZWRGaWx0ZXIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZpbHRlcikpXG4gICAgICBjb25zdCBzdGFuZGFyZENxbEFzdCA9IGhhbmRsZUJhc2ljRGF0YXR5cGVGaWx0ZXJzKFxuICAgICAgICB1bmNvbGxhcHNlTk9Ucyh7XG4gICAgICAgICAgY3FsQXN0OiBmaWx0ZXIsXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICByZW1vdmVJbnZhbGlkRmlsdGVycyhzdGFuZGFyZENxbEFzdClcbiAgICAgIHJldHVybiB3cml0ZShzdGFuZGFyZENxbEFzdClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgcmV0dXJuIHdyaXRlKFxuICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICBmaWx0ZXJzOiBbXSxcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUludmFsaWRGaWx0ZXJzLFxuICBzaW1wbGlmeShjcWxBc3Q6IEZpbHRlckJ1aWxkZXJDbGFzcyk6IEZpbHRlckJ1aWxkZXJDbGFzcyB7XG4gICAgcmV0dXJuIGl0ZXJhdGl2ZWx5U2ltcGxpZnkoY3FsQXN0KVxuICB9LFxuICB0cmFuc2xhdGVDcWxUb1VzZXJxbCxcbiAgdHJhbnNsYXRlVXNlcnFsVG9DcWwsXG4gIEFOWVRFWFRfV0lMRENBUkQsXG4gIGdldEdlb0ZpbHRlcnMsXG59XG4iXX0=