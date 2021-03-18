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
import {
  CQLStandardFilterBuilderClass,
  deserialize,
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
  serialize,
  shouldBeFilterBuilderClass,
  ValueTypes,
} from '../component/filter-builder/filter.structure'
const CQLUtils = require('./CQLUtils')

const arrayFromLinestringWkt = (wkt: string): Array<[number, number]> => {
  return wkt
    .substring(11, wkt.length - 1)
    .split(',')
    .map(function (coordinate) {
      return coordinate.split(' ').map(function (value) {
        return Number(value)
      }) as [number, number]
    })
}
const ANYTEXT_WILDCARD = '"anyText" ILIKE \'%\''
type PrecendenceType = 'RPAREN' | 'LOGICAL' | 'COMPARISON'
type FilterFunctionNames = 'proximity' | 'pi'
type PatternReturnType = RegExp | ((text: string) => string[] | null)

type PatternNamesType =
  | 'PROPERTY'
  | 'COMPARISON'
  | 'IS_NULL'
  | 'COMMA'
  | 'LOGICAL'
  | 'VALUE'
  | 'FILTER_FUNCTION'
  | 'BOOLEAN'
  | 'LPAREN'
  | 'RPAREN'
  | 'SPATIAL'
  | 'UNITS'
  | 'NOT'
  | 'BETWEEN'
  | 'BEFORE'
  | 'AFTER'
  | 'DURING'
  | 'RELATIVE'
  | 'TIME'
  | 'TIME_PERIOD'
  | 'GEOMETRY'

const timePattern = /((([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?)|^'')/i,
  patterns = {
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
    TIME_PERIOD: new RegExp(
      '^' + timePattern.source + '/' + timePattern.source
    ),
    GEOMETRY(text: string) {
      const type = /^(POINT|LINESTRING|POLYGON|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION)/.exec(
        text
      )
      if (type) {
        const len = text.length
        let idx = text.indexOf('(', type[0].length)
        if (idx > -1) {
          let depth = 1
          while (idx < len && depth > 0) {
            idx++
            switch (text.charAt(idx)) {
              case '(':
                depth++
                break
              case ')':
                depth--
                break
              default:
              // in default case, do nothing
            }
          }
        }
        return [text.substr(0, idx + 1)]
      }
      return null
    },
    END: /^$/,
  } as Record<PatternNamesType | 'END', PatternReturnType>,
  follows = {
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
  } as Record<
    PatternNamesType | 'ROOT_NODE' | 'END',
    Array<PatternNamesType | 'END'>
  >,
  precedence = {
    RPAREN: 3,
    LOGICAL: 2,
    COMPARISON: 1,
  } as Record<PrecendenceType, number>,
  // as an improvement, these could be figured out while building the syntax tree
  filterFunctionParamCount = {
    proximity: 3,
    pi: 0,
  } as Record<FilterFunctionNames, number>,
  dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"

function tryToken(text: string, pattern: PatternReturnType) {
  if (pattern instanceof RegExp) {
    return pattern.exec(text)
  } else {
    return pattern(text)
  }
}

function nextToken(text: string, tokens: Array<PatternNamesType | 'END'>) {
  let i,
    token,
    len = tokens.length
  for (i = 0; i < len; i++) {
    token = tokens[i]
    const pat = patterns[token]
    const matches = tryToken(text, pat)
    if (matches) {
      const match = matches[0]
      const remainder = text.substr(match.length).replace(/^\s*/, '')
      return {
        type: token,
        text: match,
        remainder,
      }
    }
  }

  let msg = 'ERROR: In parsing: [' + text + '], expected one of: '
  for (i = 0; i < len; i++) {
    token = tokens[i]
    msg += '\n    ' + token + ': ' + patterns[token]
  }

  throw new Error(msg)
}

type TokenType = {
  type: PatternNamesType | 'END'
  text: string
  remainder: string
}

function tokenize(text: string): Array<TokenType> {
  const results = []
  let token = undefined as undefined | TokenType
  let expect = follows['ROOT_NODE']

  do {
    token = nextToken(text, expect)
    text = token.remainder
    expect = follows[token.type]
    if (token.type !== 'END' && !expect) {
      throw new Error('No follows list for ' + token.type)
    }
    results.push(token)
  } while (token.type !== 'END')
  return results
}

type SpecialCQLCharacters = '%' | '_'

// Mapping of Intrigue's query language syntax to CQL syntax
const userqlToCql = {
  '*': '%',
  '?': '_',
  '%': '\\%',
  _: '\\_',
}

const translateUserqlToCql = (str: string): string =>
  str.replace(
    /([^*?%_])?([*?%_])/g,
    (_, a = '', b) =>
      a + (a === '\\' ? b : userqlToCql[b as SpecialCQLCharacters])
  )

//Mapping of CQL syntax to Intrigue's query language syntax
const cqlToUserql = {
  '%': '*',
  _: '?',
} as Record<SpecialCQLCharacters, string>

const translateCqlToUserql = (str: string): string =>
  str.replace(/([^%_])?([%_])/g, (_, a = '', b) =>
    a === '\\' ? b : a + cqlToUserql[b as SpecialCQLCharacters]
  )

const getNextToken = (postfix: Array<TokenType>): TokenType => {
  if (
    postfix[postfix.length - 3] &&
    postfix[postfix.length - 3].type === 'FILTER_FUNCTION'
  ) {
    // first two are useless
    postfix.pop()
    postfix.pop()
    return postfix.pop() as TokenType
  }
  if (
    postfix[postfix.length - 2] &&
    postfix[postfix.length - 2].type === 'RELATIVE'
  ) {
    // first one is useless
    postfix.pop()
    return postfix.pop() as TokenType
  }
  return postfix.pop() as TokenType
}

function buildTree(postfix: Array<TokenType>): any {
  let value,
    property,
    tok = getNextToken(postfix)
  const tokenType = tok.type
  switch (tokenType) {
    case 'LOGICAL':
      const rhs = buildTree(postfix),
        lhs = buildTree(postfix)
      return new FilterBuilderClass({
        filters: [lhs, rhs],
        type: tok.text.toUpperCase() as FilterBuilderClass['type'],
      })
    case 'NOT':
      const peekToken = postfix[postfix.length - 1] as TokenType
      if (peekToken.type === 'LOGICAL') {
        return new FilterBuilderClass({
          ...buildTree(postfix),
          negated: true,
        })
      } else if (peekToken.type === 'NOT') {
        return new FilterBuilderClass({
          filters: [buildTree(postfix)],
          type: 'AND',
          negated: true,
        })
      } else {
        return new FilterClass({
          ...buildTree(postfix),
          negated: true,
        })
      }
    case 'BETWEEN': // works
      let min, max
      postfix.pop() // unneeded AND token here
      max = buildTree(postfix)
      min = buildTree(postfix)
      property = buildTree(postfix)
      return new FilterClass({
        property,
        value: {
          start: min,
          end: max,
        } as ValueTypes['between'],
        type: tokenType as FilterClass['type'],
      })
    case 'BEFORE': // works
    case 'AFTER': // works
      value = buildTree(postfix)
      property = buildTree(postfix)
      return new FilterClass({
        property,
        value: value as ValueTypes['date'],
        type: tok.text.toUpperCase() as FilterClass['type'],
      })
    case 'DURING': // technically between for dates, works
      const dates = buildTree(postfix).split('/')
      property = buildTree(postfix)
      return new FilterClass({
        property,
        value: {
          start: dates[0],
          end: dates[1],
        } as ValueTypes['during'],
        type: tok.text.toUpperCase() as FilterClass['type'],
      })
    case 'COMPARISON': // works
      value = buildTree(postfix) as ValueTypes['integer']
      property = buildTree(postfix)
      return new FilterClass({
        property,
        value,
        type: tok.text.toUpperCase() as FilterClass['type'],
      })
    case 'IS_NULL': // works
      property = buildTree(postfix)
      return new FilterClass({
        property,
        type: tok.text.toUpperCase() as FilterClass['type'],
      })
    case 'VALUE': //works
      const match = tok.text.match(/^'(.*)'$/)
      if (match) {
        return translateCqlToUserql(match[1].replace(/''/g, "'"))
      } else {
        return Number(tok.text)
      }
    case 'BOOLEAN': // works
      switch (tok.text.toUpperCase()) {
        case 'TRUE':
          return true
        default:
          return false
      }
    case 'SPATIAL': // working
      // next token tells us whether this is DWITHIN or INTERSECTS
      switch (tok.text) {
        case 'INTERSECTS': {
          // things without buffers, could be poly or line
          const valueToken = postfix.pop() as TokenType
          const propertyToken = postfix.pop() as TokenType
          if (valueToken.text.startsWith('LINESTRING')) {
            return new FilterClass({
              type: 'GEOMETRY',
              value: {
                mode: 'line',
                type: 'LINE',
                line: arrayFromLinestringWkt(valueToken.text),
              } as ValueTypes['location'],
              property: propertyToken.text,
            })
          }
          return new FilterClass({
            type: 'GEOMETRY',
            value: {
              mode: 'poly',
              type: 'POLYGON',
              polygon: CQLUtils.arrayFromPolygonWkt(valueToken.text),
            } as ValueTypes['location'],
            property: propertyToken.text,
          })
        }
        case 'DWITHIN': {
          // things with buffers, could be poly, line or point
          const bufferToken = postfix.pop() as TokenType
          const valueToken = postfix.pop() as TokenType
          const propertyToken = postfix.pop() as TokenType
          if (valueToken.text.startsWith('LINESTRING')) {
            return new FilterClass({
              type: 'GEOMETRY',
              value: {
                mode: 'line',
                type: 'LINE',
                lineWidth: bufferToken.text,
                line: arrayFromLinestringWkt(valueToken.text),
              } as ValueTypes['location'],
              property: propertyToken.text,
            })
          } else if (valueToken.text.startsWith('POLYGON')) {
            return new FilterClass({
              type: 'GEOMETRY',
              value: {
                mode: 'poly',
                type: 'POLYGON',
                polygonBufferWidth: bufferToken.text,
                polygon: CQLUtils.arrayFromPolygonWkt(valueToken.text),
              } as ValueTypes['location'],
              property: propertyToken.text,
            })
          }
          return new FilterClass({
            type: 'GEOMETRY',
            value: {
              mode: 'circle',
              type: 'POINTRADIUS',
              radius: bufferToken.text,
              lat: Number(
                valueToken.text
                  .substring(6, valueToken.text.length - 1)
                  .split(' ')[1]
              ),
              lon: Number(valueToken.text.substring(6).split(' ')[0]),
            } as ValueTypes['location'],
            property: propertyToken.text,
          })
          break
        }
        default:
          throw new Error('Unknown spatial type encountered')
      }
    case 'GEOMETRY':
      return {
        type: tokenType,
        value: tok.text,
      }
    case 'RELATIVE':
      return new FilterClass({
        type: 'RELATIVE',
        value: deserialize.dateRelative(tok.text),
        property: (postfix.pop() as TokenType).text,
      })
    case 'FILTER_FUNCTION': // working
      const filterFunctionName = tok.text.slice(0, -1) // remove trailing '('
      const paramCount =
        filterFunctionParamCount[filterFunctionName as FilterFunctionNames]
      if (paramCount === undefined) {
        throw new Error('Unsupported filter function: ' + filterFunctionName)
      }
      const params = Array.apply(null, Array(paramCount))
        .map(() => buildTree(postfix))
        .reverse()
      switch (filterFunctionName) {
        case 'proximity':
          const proximityStrings = params[2] as string
          return new FilterClass({
            type: 'FILTER FUNCTION proximity',
            property: params[0],
            value: {
              first: proximityStrings.split(' ')[0],
              second: proximityStrings.split(' ')[1],
              distance: params[1],
            } as ValueTypes['proximity'],
          })
        default:
          throw new Error('Unknown filter function')
      }
    case 'TIME_PERIOD':
      return tok.text
    default:
      return tok.text
  }
}

function buildAst(tokens: TokenType[]) {
  const operatorStack = [] as Array<TokenType>,
    postfix = [] as Array<TokenType>

  while (tokens.length) {
    const tok = tokens.shift() as TokenType
    switch (tok.type) {
      case 'PROPERTY':
        // Remove single and double quotes if they exist in property name
        tok.text = tok.text.replace(/^'|'$/g, '')
        tok.text = tok.text.replace(/^"|"$/g, '')
      case 'GEOMETRY':
      case 'VALUE':
      case 'TIME':
      case 'TIME_PERIOD':
      case 'RELATIVE':
      case 'BOOLEAN':
        postfix.push(tok)
        break
      case 'COMPARISON':
      case 'BETWEEN':
      case 'IS_NULL':
      case 'LOGICAL':
      case 'BEFORE':
      case 'AFTER':
      case 'DURING':
        const p = precedence[tok.type as PrecendenceType]

        while (
          operatorStack.length > 0 &&
          precedence[
            operatorStack[operatorStack.length - 1].type as PrecendenceType
          ] <= p
        ) {
          postfix.push(operatorStack.pop() as TokenType)
        }

        operatorStack.push(tok)
        break
      case 'SPATIAL':
      case 'NOT':
      case 'LPAREN':
        operatorStack.push(tok)
        break
      case 'FILTER_FUNCTION':
        operatorStack.push(tok)
        // insert a '(' manually because we lost the original LPAREN matching the FILTER_FUNCTION regex
        operatorStack.push({ type: 'LPAREN' } as TokenType)
        break
      case 'RPAREN':
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type !== 'LPAREN'
        ) {
          postfix.push(operatorStack.pop() as TokenType)
        }
        operatorStack.pop() // toss out the LPAREN

        // if this right parenthesis ends a function argument list (it's not for a logical grouping),
        // it's now time to add that function to the postfix-ordered list
        const lastOperatorType =
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type
        if (
          lastOperatorType === 'SPATIAL' ||
          lastOperatorType === 'FILTER_FUNCTION'
        ) {
          postfix.push(operatorStack.pop() as TokenType)
        }
        break
      case 'COMMA':
      case 'END':
      case 'UNITS':
        break
      default:
        throw new Error('Unknown token type ' + tok.type)
    }
  }

  while (operatorStack.length > 0) {
    postfix.push(operatorStack.pop() as TokenType)
  }

  const result = buildTree(postfix)
  if (postfix.length > 0) {
    let msg = 'Remaining tokens after building AST: \n'
    for (let i = postfix.length - 1; i >= 0; i--) {
      msg += postfix[i].type + ': ' + postfix[i].text + '\n'
    }
    throw new Error(msg)
  }

  return result
}

function wrap(property: string): string {
  let wrapped = property
  if (!wrapped.startsWith('"')) {
    wrapped = '"' + wrapped
  }
  if (!wrapped.endsWith('"')) {
    wrapped = wrapped + '"'
  }
  return wrapped
}

// really could use some refactoring to enable better typing, right now it's recursive and calls itself with so many different types / return types
function write(filter: any): any {
  switch (filter.type) {
    // spatialClass
    case 'BBOX':
      const xmin = filter.value[0],
        ymin = filter.value[1],
        xmax = filter.value[2],
        ymax = filter.value[3]
      return (
        'BBOX(' +
        wrap(filter.property) +
        ',' +
        xmin +
        ',' +
        ymin +
        ',' +
        xmax +
        ',' +
        ymax +
        ')'
      )
    // verified line, polygon, point radius
    case 'DWITHIN':
      return `DWITHIN(${wrap(filter.property)}, ${filter.value}, ${
        filter.distance
      }, meters)`
    // unused at the moment
    case 'WITHIN':
      return (
        'WITHIN(' + wrap(filter.property) + ', ' + write(filter.value) + ')'
      )
    // verified bbox
    case 'INTERSECTS':
      return 'INTERSECTS(' + wrap(filter.property) + ', ' + filter.value + ')'
    // unused at the moment
    case 'CONTAINS':
      return (
        'CONTAINS(' + wrap(filter.property) + ', ' + write(filter.value) + ')'
      )
    // all "geo" filters pass through this first, which serializes them into a form that cql understands
    // this is only done here on the fly because the transformation involves a loss of information
    // (such as the units [meters or miles?] and coordinate system [dms or mgrs?])
    case 'GEOMETRY':
      return write(serialize.location(filter.property, filter.value))
    // logicalClass
    case 'AND':
    case 'OR':
      let res = '('
      let first = true
      for (let i = 0; i < filter.filters.length; i++) {
        if (first) {
          first = false
        } else {
          res += ') ' + filter.type + ' ('
        }
        res += write(filter.filters[i])
      }
      return res + ')'
    case 'NOT':
      // TODO: deal with precedence of logical operators to
      // avoid extra parentheses (not urgent)
      return 'NOT (' + write(filter.filters[0]) + ')'
    // comparisonClass
    case 'IS NULL':
      return `("${filter.property}" ${filter.type})`
    case 'BETWEEN':
      return (
        wrap(filter.property) +
        ' BETWEEN ' +
        write(Math.min(filter.value.start, filter.value.end)) +
        ' AND ' +
        write(Math.max(filter.value.start, filter.value.end))
      )
    case '=':
    case '<>':
    case '<':
    case '<=':
    case '>':
    case '>=':
    case 'LIKE':
    case 'ILIKE':
      let property =
        typeof filter.property === 'object'
          ? write(filter.property)
          : wrap(filter.property)
        
      
      return filter.value !== null
        ? property + ' ' + filter.type + ' ' + write(filter.value)
        : property + ' ' + filter.type
    // temporalClass
    case 'RELATIVE':
      // weird thing I noticed is you have to wrap the value in single quotes, double quotes don't work
      return `${wrap(filter.property)} = '${serialize.dateRelative(
        filter.value
      )}'`
    case 'AROUND':
      return `${wrap(filter.property)} ${serialize.dateAround(filter.value)}`
    case 'BEFORE':
    case 'AFTER':
      return (
        wrap(filter.property) +
        ' ' +
        filter.type +
        ' ' +
        (filter.value ? filter.value.toString(dateTimeFormat) : "''")
      )
    case 'DURING':
      return `${wrap(filter.property)} ${filter.type} ${filter.value.start}/${
        filter.value.end
      }`
    // filterFunctionClass
    case 'FILTER FUNCTION proximity':
      // not sure why we need the = true part but without it the backend fails to parse
      return `proximity(${write(filter.property)},${write(
        filter.value.distance
      )},${write(`${filter.value.first} ${filter.value.second}`)}) = true`
      break
    case undefined:
      if (typeof filter === 'string') {
        return translateUserqlToCql("'" + filter.replace(/'/g, "''") + "'")
      } else if (typeof filter === 'number') {
        return String(filter)
      } else if (typeof filter === 'boolean') {
        return Boolean(filter)
      }
      break
    default:
      throw new Error("Can't encode: " + filter.type + ' ' + filter)
  }
}

function simplifyFilters(cqlAst: FilterBuilderClass) {
  for (let i = 0; i < cqlAst.filters.length; i++) {
    if (simplifyAst(cqlAst.filters[i], cqlAst)) {
      cqlAst.filters.splice.apply(
        cqlAst.filters,
        ([i, 1] as any[]).concat(
          (cqlAst.filters[i] as FilterBuilderClass).filters
        )
      )
    }
  }
  return cqlAst
}

/**
 * The current read function for cql produces an unoptimized tree.  While it's possible we could
 * fix the output there, I'm not sure of how.  It ends up producing very nested filter trees from
 * relatively simple cql.
 * @param cqlAst
 * @param parentNode
 */
function simplifyAst(
  cqlAst: FilterBuilderClass | FilterClass,
  parentNode?: FilterBuilderClass
) {
  if (!isFilterBuilderClass(cqlAst) && parentNode) {
    return false
  } else if (!parentNode) {
    if (isFilterBuilderClass(cqlAst)) {
      simplifyFilters(cqlAst)
    }
    return cqlAst
  } else {
    simplifyFilters(cqlAst as FilterBuilderClass)
    if (cqlAst.type === parentNode.type && !cqlAst.negated) {
      // these are the only simplifications we can make based on boolean algebra rules
      return true
    } else {
      return false
    }
  }
}

function uncollapseNOTs({
  cqlAst,
}: {
  cqlAst: FilterBuilderClass | FilterClass
}): CQLStandardFilterBuilderClass | FilterClass {
  if (isFilterBuilderClass(cqlAst)) {
    if (cqlAst.negated) {
      return new CQLStandardFilterBuilderClass({
        type: 'NOT',
        filters: [
          new CQLStandardFilterBuilderClass({
            type: cqlAst.type,
            filters: cqlAst.filters.map((filter) =>
              uncollapseNOTs({ cqlAst: filter })
            ),
          }),
        ],
      })
    } else {
      return new CQLStandardFilterBuilderClass({
        type: cqlAst.type,
        filters: cqlAst.filters.map((filter) =>
          uncollapseNOTs({ cqlAst: filter })
        ),
      })
    }
  } else {
    if (cqlAst.negated) {
      const clonedFieldFilter = JSON.parse(JSON.stringify(cqlAst))
      return new CQLStandardFilterBuilderClass({
        type: 'NOT',
        filters: [
          new CQLStandardFilterBuilderClass({
            type: 'AND',
            filters: [
              new FilterClass({
                ...clonedFieldFilter,
              }),
            ],
          }),
        ],
      })
    } else {
      return cqlAst
    }
  }
}

/**
 * For now, all this does is remove anyDate from cql since that's purely for the UI to track the query basic view state correctly.
 * We might want to reconsider how we do the basic query in order to avoid this necessity (it's really the checkbox).
 *
 * This will only ever happen with a specific structure, so we don't need to recurse or anything.
 */
function removeInvalidFilters(cqlAst: FilterBuilderClass): FilterBuilderClass {
  if (cqlAst.filters) {
    for (let i = 0; i < cqlAst.filters.length; i++) {
      const currentFilter = cqlAst.filters[i]
      if (
        isFilterBuilderClass(currentFilter) &&
        currentFilter.filters &&
        !isFilterBuilderClass(currentFilter.filters[0]) &&
        currentFilter.filters[0].property === 'anyDate'
      ) {
        cqlAst.filters.splice(i, 1)
        break
      }
    }
  }
  return cqlAst
}

function iterativelySimplify(cqlAst: FilterBuilderClass) {
  let prevAst = JSON.parse(JSON.stringify(cqlAst))
  simplifyAst(cqlAst)
  while (JSON.stringify(prevAst) !== JSON.stringify(cqlAst)) {
    prevAst = JSON.parse(JSON.stringify(cqlAst))
    simplifyAst(cqlAst)
  }
  return cqlAst
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
  read(cql?: string): FilterBuilderClass {
    if (cql === undefined || cql.length === 0) {
      return new FilterBuilderClass({
        type: 'AND',
        filters: [],
      })
    }
    // if anything goes wrong, simply log the error and move on (return a default filter tree).
    try {
      const reconstructedFilter = this.simplify(buildAst(tokenize(cql)))
      if (
        isFilterBuilderClass(reconstructedFilter) ||
        shouldBeFilterBuilderClass(reconstructedFilter)
      ) {
        return new FilterBuilderClass(reconstructedFilter)
      } else {
        return new FilterBuilderClass({
          type: 'AND',
          filters: [reconstructedFilter as FilterClass],
        })
      }
    } catch (err) {
      console.error(err)
      return new FilterBuilderClass({ type: 'AND', filters: [] })
    }
  },
  write(filter: FilterBuilderClass): string {
    try {
      // const duplicatedFilter = JSON.parse(JSON.stringify(filter))
      const standardCqlAst = uncollapseNOTs({
        cqlAst: filter,
      }) as FilterBuilderClass
      removeInvalidFilters(standardCqlAst)
      return write(standardCqlAst)
    } catch (err) {
      console.error(err)
      return write(
        new FilterBuilderClass({
          type: 'AND',
          filters: [],
        })
      )
    }
  },
  removeInvalidFilters,
  simplify(cqlAst: FilterBuilderClass): FilterBuilderClass {
    return iterativelySimplify(cqlAst)
  },
  translateCqlToUserql,
  translateUserqlToCql,
  ANYTEXT_WILDCARD,
}
