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
//# sourceMappingURL=cql.js.map