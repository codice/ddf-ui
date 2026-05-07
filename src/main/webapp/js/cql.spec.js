import { __rest } from "tslib";
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
import { expect } from 'chai';
import { FilterBuilderClass, FilterClass, } from '../component/filter-builder/filter.structure';
import cql from './cql';
import { StartupDataStore } from './model/Startup/startup';
var DatatypesJSONConfig = {
    groups: {
        Object: {
            iconConfig: {
                class: 'fa fa-file-text-o',
            },
            values: {
                Person: {
                    attributes: {
                        description: ['person'],
                    },
                    iconConfig: {
                        class: 'fa fa-user',
                    },
                },
                Group: {
                    attributes: {
                        description: ['group'],
                    },
                    iconConfig: {
                        class: 'fa fa-users',
                    },
                },
                Equipment: {
                    attributes: {
                        description: ['equipment'],
                    },
                    iconConfig: {
                        class: 'fa fa-wrench',
                    },
                },
                Platform: {
                    attributes: {
                        description: ['platform'],
                    },
                    iconConfig: {
                        class: 'fa fa-industry',
                    },
                },
                Facility: {
                    attributes: {
                        description: ['facility'],
                    },
                    iconConfig: {
                        class: 'fa fa-building',
                    },
                },
            },
        },
        Happenings: {
            iconConfig: {
                class: 'fa fa-bolt',
            },
            values: {
                Civil: {
                    attributes: {
                        description: ['civil'],
                    },
                    iconConfig: {
                        class: 'fa fa-university',
                    },
                },
                Military: {
                    attributes: {
                        description: ['military'],
                    },
                    iconConfig: {
                        class: 'fa fa-shield',
                    },
                },
                Political: {
                    attributes: {
                        description: ['political'],
                    },
                    iconConfig: {
                        class: 'fa fa-balance-scale',
                    },
                },
                Natural: {
                    attributes: {
                        description: ['natural'],
                    },
                    iconConfig: {
                        class: 'fa fa-leaf',
                    },
                },
                Other: {
                    attributes: {
                        description: ['other'],
                    },
                },
            },
        },
        'Visual Media': {
            iconConfig: {
                class: 'fa fa-camera-retro',
            },
            values: {
                Image: {
                    attributes: {
                        datatype: ['Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-picture-o',
                    },
                },
                'Moving Image': {
                    attributes: {
                        datatype: ['Moving Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-film',
                    },
                },
                'Still Image': {
                    attributes: {
                        datatype: ['Still Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
            },
        },
    },
};
/**
 * Test all the capabilities (without boolean logic involved).
 *
 * left is input, right is expected output (can differ, we do our best effort but ultimately simplifying can change things!)
 * categorized by types so make this easier to maintain and update as needed
 */
var cqlCapabilityStrings = {
    strings: [
        "(\"anyText\" ILIKE '1')",
        "(\"anyText\" LIKE '1')",
        "(\"anyText\" = '1')",
        "(proximity('anyText',2,'second first') = true)",
        "((\"title\" IS NULL))",
    ],
    numbers: [
        "(\"media.width-pixels\" > 0)",
        "(\"media.width-pixels\" < 0)",
        "(\"media.width-pixels\" = 0)",
        "(\"media.width-pixels\" >= 0)",
        "(\"media.width-pixels\" <= 0)",
        "(\"media.width-pixels\" BETWEEN 0 AND 1)",
        "((\"media.width-pixels\" IS NULL))",
    ],
    dates: [
        "(\"modified\" BEFORE 2020-12-10T20:31:03.388Z)",
        "(\"modified\" AFTER 2020-12-10T20:31:03.388Z)",
        "(\"modified\" = 'RELATIVE(PT1S)')",
        "(\"modified\" = 'RELATIVE(PT1M)')",
        "(\"modified\" = 'RELATIVE(PT1H)')",
        "(\"modified\" = 'RELATIVE(P1D)')",
        "(\"modified\" = 'RELATIVE(P7D)')",
        "(\"modified\" = 'RELATIVE(P1M)')",
        "(\"modified\" = 'RELATIVE(P1Y)')",
        "((\"created\" IS NULL))",
    ],
    booleans: [
        "(\"enterprise\" = false)",
        "(\"enterprise\" = true)",
        "((\"enterprise\" IS NULL))",
    ],
    geometries: [
        "((\"location\" IS NULL))",
        "(INTERSECTS(\"anyGeo\", LINESTRING(-1.385015 11.713654,-2.691833 0.382483,-10.326418 8.220109)))",
        "(DWITHIN(\"anyGeo\", LINESTRING(-1.719894 11.760274,-1.611331 3.939398,-8.774062 7.567764), 500, meters))",
        "(INTERSECTS(\"anyGeo\", POLYGON((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094))))",
        "(DWITHIN(\"anyGeo\", POLYGON((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)), 500, meters))",
        "(DWITHIN(\"anyGeo\", POINT(-2.703933 4.726838), 523283.971121, meters))",
    ],
};
var cqlMultipolygonStrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", \n      MULTIPOLYGON(\n        ((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)), \n        ((0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,0.580634 10.295094)),\n        ((10 10,-10 -10,-10 10,10 10))\n      )))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [10, 10],
                                [-10, -10],
                                [-10, 10],
                                [10, 10],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOLYGON(((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)))))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOLYGON(((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094))), 500, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            polygonBufferWidth: '500',
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOLYGON(((17.704563951827325 26.80670872544821,26.69962466928798 14.956073177047667,9.280618200554649 15.313020030915167,17.704563951827325 26.80670872544821))))) OR (INTERSECTS(\"anyGeo\", MULTIPOLYGON(((37.62219839763307 22.095010254397405,48.83032960907214 32.5892477581015,50.68645324918305 21.09555906356843,40.19221574547897 17.31192241257309,37.62219839763307 22.095010254397405)))))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [17.704563951827325, 26.80670872544821],
                                [26.69962466928798, 14.956073177047667],
                                [9.280618200554649, 15.313020030915167],
                                [17.704563951827325, 26.80670872544821],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [37.62219839763307, 22.095010254397405],
                                [48.83032960907214, 32.5892477581015],
                                [50.68645324918305, 21.09555906356843],
                                [40.19221574547897, 17.31192241257309],
                                [37.62219839763307, 22.095010254397405],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlPointStrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", POINT(10 20)))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOINT(10 20, 5 5)))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            type: 'POINTRADIUS',
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 5,
                            lon: 5,
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", POINT(10 20), 100, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOINT(10 20), 100, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOINT(10 20, 5 5), 100, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 5,
                            lon: 5,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlLinestrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", LINESTRING(10 20, 30 30, 40 20)))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [10, 20],
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [40, 40],
                                [30, 30],
                                [40, 20],
                                [30, 10],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", LINESTRING(10 20, 30 30, 40 20), 1000, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 20],
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40)), 1000, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10)), 1000, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [40, 40],
                                [30, 30],
                                [40, 20],
                                [30, 10],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlGeometryCollections = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", GEOMETRYCOLLECTION(POINT(10 20), LINESTRING(30 30, 40 20))))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", GEOMETRYCOLLECTION(GEOMETRYCOLLECTION(POINT(10 20)), LINESTRING(30 30, 40 20))))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", GEOMETRYCOLLECTION(POINT(10 20)), 1000, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                            radius: '1000',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", GEOMETRYCOLLECTION(GEOMETRYCOLLECTION(POLYGON((10 20, 15 18, 5 9, 10 20))), LINESTRING(30 30, 40 20)), 1000, meters))",
            output: {
                filters: [
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            type: 'POLYGON',
                            polygonBufferWidth: '1000',
                            polygon: [
                                [10, 20],
                                [15, 18],
                                [5, 9],
                                [10, 20],
                            ],
                        },
                    },
                    {
                        context: undefined,
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
/**
 * Same as above, but this goes beyond just testing functions, it tests the boolean logic
 *
 * The different section is for things that technically can be simplified by boolean logic.  Due to how reconstitution works, utilizing postfix, we are forced to simplify.  If we didn't, things would get super nested (lookup postfix notation for more on why).  So in some cases, we might simplify beyond the expectation.  The two results will have parity though since we follow boolean algebra rules.
 */
var cqlBooleanLogicStrings = {
    same: [
        "(\"anyText\" ILIKE '1') AND (\"anyText\" ILIKE '2')",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2')",
        "(\"anyText\" ILIKE '1') OR (NOT ((\"anyText\" ILIKE '2')))",
        "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE ''))))",
        "(NOT ((\"anyText\" ILIKE '1'))) OR (NOT ((\"anyText\" ILIKE '2')))",
        "NOT ((NOT ((\"anyText\" ILIKE '1'))) OR (NOT ((\"anyText\" ILIKE '2'))))",
        "NOT ((\"anyText\" ILIKE '1') OR (NOT ((\"anyText\" ILIKE '2'))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '')))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((NOT ((\"anyText\" ILIKE '')))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
        "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))))",
    ],
    different: [
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE ''))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '')",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((NOT ((\"anyText\" ILIKE ''))))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '')))",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')",
        },
        {
            input: "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
            output: "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE '')))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))",
        },
        {
            input: "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE '5') AND ((NOT ((\"anyText\" ILIKE '1'))) AND (\"anyText\" ILIKE '3')) AND (NOT ((\"anyText\" ILIKE '4'))))))",
            output: "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE '5') AND (NOT ((\"anyText\" ILIKE '1'))) AND (\"anyText\" ILIKE '3') AND (NOT ((\"anyText\" ILIKE '4'))))))",
        },
    ],
};
describe('read & write parity for capabilities, as well as boolean logic', function () {
    it('TEST GET GEO FILTERS', function () {
        var wkt = 'GEOMETRYCOLLECTION(POINT(50 40), LINESTRING(10 20, 40 50))';
        cql.getGeoFilters(wkt, 'anyGeo', '100');
        expect('test-value', 'Adding bogus expectation.').to.equal('test-value');
    });
    it('TEST LINESTRING FILTERS', function () {
        var wkt = 'LINESTRING(10 20, 40 50)';
        cql.getGeoFilters(wkt, 'anyGeo', '100');
        expect('test-value', 'Adding bogus expectation.').to.equal('test-value');
    });
    describe('test all capabilities', function () {
        for (var type in cqlCapabilityStrings) {
            cqlCapabilityStrings[type].forEach(function (capability) {
                it("".concat(capability), function () {
                    expect(capability, 'Unexpected filter value.').to.equal(cql.write(cql.read(capability)));
                });
            });
        }
    });
    describe('test all logic', function () {
        describe('where things stay the same (already simplified)', function () {
            cqlBooleanLogicStrings['same'].forEach(function (input) {
                it("".concat(input), function () {
                    expect(input, 'Unexpected filter value.').to.equal(cql.write(cql.read(input)));
                });
            });
        });
        describe('where things differ (they get simplified)', function () {
            cqlBooleanLogicStrings['different'].forEach(function (inputOutputPair) {
                it("".concat(inputOutputPair.input), function () {
                    expect(inputOutputPair.output, 'Unexpected filter value.').to.equal(cql.write(cql.read(inputOutputPair.input)));
                });
            });
        });
    });
    describe('test corner cases / special', function () {
        it('it handles escaping _ in properties that are not id', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: 'title',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cqlText, "Doesn't escape properly").to.equal('("title" = \'12123123\\_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it('it handles escaping _ in properties that are id', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: 'id',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it('it handles escaping _ in properties that are "id" (double wrapped!)', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: '"id"',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it("it handles escaping _ in properties that are 'id' (double wrapped!)", function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: "'id'",
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
    });
    describe('invalid filters get removed', function () {
        it('handles typical anyDate removal', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'anyDate',
                                value: '',
                                type: 'BEFORE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles empty reserved.basic-datatype', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: [],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles invalid values in reserved.basic-datatype', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['bogus'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles invalid values mixed with valid values in reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['bogus', 'Person'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("((((\"description\" ILIKE 'person')))) OR (\"anyText\" ILIKE '%')");
        });
        it('handles anyDate removal', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterClass({
                        property: 'anyDate',
                        value: '',
                        type: 'BEFORE',
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
    });
    describe('test reserved.basic-datatype', function () {
        it('does handle a simple reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['Person', 'Military'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("((((\"description\" ILIKE 'person') OR (\"description\" ILIKE 'military'))))");
        });
        it('does handle a negated reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        negated: true,
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['Person', 'Military'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(NOT ((((\"description\" ILIKE 'person') OR (\"description\" ILIKE 'military')))))");
        });
    });
    describe('test boolean search', function () {
        it('does handles a simple boolean search', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE '*')",
                            error: false,
                            text: '"*"',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE '*'))");
        });
        it('does handles a simple boolean search 2', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat')",
                            error: false,
                            text: 'dog or cat',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat'))");
        });
        it('does handles a simple boolean search that is empty', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "",
                            error: false,
                            text: '',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE '*'))");
        });
        it('does handles a simple boolean search with not', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish'))))");
        });
        it('does handles a simple boolean search other terms', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))) AND ((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms and negations', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        negated: true,
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("(NOT (((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))))) AND ((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms with interspersed errors', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                type: 'BOOLEAN_TEXT_SEARCH',
                                value: {
                                    cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                                    error: true,
                                    text: 'dog or cat and not (fish)',
                                },
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms with interspersed errors and negations', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                negated: true,
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        negated: true,
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                type: 'BOOLEAN_TEXT_SEARCH',
                                negated: true,
                                value: {
                                    cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                                    error: true,
                                    text: 'dog or cat and not (fish)',
                                },
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                    new FilterClass({
                        negated: true,
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("NOT (((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image')))");
        });
    });
    describe('multipolygon cql string read test', function () {
        cqlMultipolygonStrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    if (filter instanceof FilterClass) {
                        var id_1 = filter.id, newFilter = __rest(filter, ["id"]);
                        filtersArray.push(newFilter);
                    }
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('point and multipoint cql string read test', function () {
        cqlPointStrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('linestring and multilinestring cql string read test', function () {
        cqlLinestrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('geometry collection cql string read test', function () {
        cqlGeometryCollections.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3FsLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY3FsLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQzdCLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsV0FBVyxHQUNaLE1BQU0sOENBQThDLENBQUE7QUFDckQsT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBRzFELElBQU0sbUJBQW1CLEdBQUc7SUFDMUIsTUFBTSxFQUFFO1FBQ04sTUFBTSxFQUFFO1lBQ04sVUFBVSxFQUFFO2dCQUNWLEtBQUssRUFBRSxtQkFBbUI7YUFDM0I7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sTUFBTSxFQUFFO29CQUNOLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBQ3hCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsWUFBWTtxQkFDcEI7aUJBQ0Y7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7cUJBQ3ZCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsYUFBYTtxQkFDckI7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7cUJBQzNCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsY0FBYztxQkFDdEI7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQzFCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVB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QUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUM5RCxVQUFVLENBQUMsTUFBTSxDQUNsQixDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknXG5pbXBvcnQge1xuICBGaWx0ZXJCdWlsZGVyQ2xhc3MsXG4gIEZpbHRlckNsYXNzLFxufSBmcm9tICcuLi9jb21wb25lbnQvZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCBjcWwgZnJvbSAnLi9jcWwnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyBEYXRhVHlwZXNDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vY29tcG9uZW50L2RhdGF0eXBlcy9kYXRhdHlwZXMnXG5cbmNvbnN0IERhdGF0eXBlc0pTT05Db25maWcgPSB7XG4gIGdyb3Vwczoge1xuICAgIE9iamVjdDoge1xuICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICBjbGFzczogJ2ZhIGZhLWZpbGUtdGV4dC1vJyxcbiAgICAgIH0sXG4gICAgICB2YWx1ZXM6IHtcbiAgICAgICAgUGVyc29uOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsncGVyc29uJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXVzZXInLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEdyb3VwOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnZ3JvdXAnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtdXNlcnMnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEVxdWlwbWVudDoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ2VxdWlwbWVudCddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS13cmVuY2gnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFBsYXRmb3JtOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsncGxhdGZvcm0nXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtaW5kdXN0cnknLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEZhY2lsaXR5OiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnZmFjaWxpdHknXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYnVpbGRpbmcnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgSGFwcGVuaW5nczoge1xuICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICBjbGFzczogJ2ZhIGZhLWJvbHQnLFxuICAgICAgfSxcbiAgICAgIHZhbHVlczoge1xuICAgICAgICBDaXZpbDoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ2NpdmlsJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXVuaXZlcnNpdHknLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE1pbGl0YXJ5OiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnbWlsaXRhcnknXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtc2hpZWxkJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBQb2xpdGljYWw6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydwb2xpdGljYWwnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtYmFsYW5jZS1zY2FsZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTmF0dXJhbDoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ25hdHVyYWwnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtbGVhZicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgT3RoZXI6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydvdGhlciddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgJ1Zpc3VhbCBNZWRpYSc6IHtcbiAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgY2xhc3M6ICdmYSBmYS1jYW1lcmEtcmV0cm8nLFxuICAgICAgfSxcbiAgICAgIHZhbHVlczoge1xuICAgICAgICBJbWFnZToge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRhdGF0eXBlOiBbJ0ltYWdlJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXBpY3R1cmUtbycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ01vdmluZyBJbWFnZSc6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkYXRhdHlwZTogWydNb3ZpbmcgSW1hZ2UnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtZmlsbScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ1N0aWxsIEltYWdlJzoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRhdGF0eXBlOiBbJ1N0aWxsIEltYWdlJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWNhbWVyYS1yZXRybycsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0gYXMgRGF0YVR5cGVzQ29uZmlndXJhdGlvblxuXG50eXBlIENhcGFiaWxpdHlDYXRlZ29yaWVzVHlwZSA9XG4gIHwgJ3N0cmluZ3MnXG4gIHwgJ251bWJlcnMnXG4gIHwgJ2RhdGVzJ1xuICB8ICdib29sZWFucydcbiAgfCAnZ2VvbWV0cmllcydcblxuLyoqXG4gKiBUZXN0IGFsbCB0aGUgY2FwYWJpbGl0aWVzICh3aXRob3V0IGJvb2xlYW4gbG9naWMgaW52b2x2ZWQpLlxuICpcbiAqIGxlZnQgaXMgaW5wdXQsIHJpZ2h0IGlzIGV4cGVjdGVkIG91dHB1dCAoY2FuIGRpZmZlciwgd2UgZG8gb3VyIGJlc3QgZWZmb3J0IGJ1dCB1bHRpbWF0ZWx5IHNpbXBsaWZ5aW5nIGNhbiBjaGFuZ2UgdGhpbmdzISlcbiAqIGNhdGVnb3JpemVkIGJ5IHR5cGVzIHNvIG1ha2UgdGhpcyBlYXNpZXIgdG8gbWFpbnRhaW4gYW5kIHVwZGF0ZSBhcyBuZWVkZWRcbiAqL1xuY29uc3QgY3FsQ2FwYWJpbGl0eVN0cmluZ3MgPSB7XG4gIHN0cmluZ3M6IFtcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJylgLFxuICAgIGAoXCJhbnlUZXh0XCIgTElLRSAnMScpYCxcbiAgICBgKFwiYW55VGV4dFwiID0gJzEnKWAsXG4gICAgYChwcm94aW1pdHkoJ2FueVRleHQnLDIsJ3NlY29uZCBmaXJzdCcpID0gdHJ1ZSlgLFxuICAgIGAoKFwidGl0bGVcIiBJUyBOVUxMKSlgLFxuICBdLFxuICBudW1iZXJzOiBbXG4gICAgYChcIm1lZGlhLndpZHRoLXBpeGVsc1wiID4gMClgLFxuICAgIGAoXCJtZWRpYS53aWR0aC1waXhlbHNcIiA8IDApYCxcbiAgICBgKFwibWVkaWEud2lkdGgtcGl4ZWxzXCIgPSAwKWAsXG4gICAgYChcIm1lZGlhLndpZHRoLXBpeGVsc1wiID49IDApYCxcbiAgICBgKFwibWVkaWEud2lkdGgtcGl4ZWxzXCIgPD0gMClgLFxuICAgIGAoXCJtZWRpYS53aWR0aC1waXhlbHNcIiBCRVRXRUVOIDAgQU5EIDEpYCxcbiAgICBgKChcIm1lZGlhLndpZHRoLXBpeGVsc1wiIElTIE5VTEwpKWAsXG4gIF0sXG4gIGRhdGVzOiBbXG4gICAgYChcIm1vZGlmaWVkXCIgQkVGT1JFIDIwMjAtMTItMTBUMjA6MzE6MDMuMzg4WilgLFxuICAgIGAoXCJtb2RpZmllZFwiIEFGVEVSIDIwMjAtMTItMTBUMjA6MzE6MDMuMzg4WilgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFBUMVMpJylgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFBUMU0pJylgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFBUMUgpJylgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFAxRCknKWAsXG4gICAgYChcIm1vZGlmaWVkXCIgPSAnUkVMQVRJVkUoUDdEKScpYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQMU0pJylgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFAxWSknKWAsXG4gICAgYCgoXCJjcmVhdGVkXCIgSVMgTlVMTCkpYCxcbiAgXSxcbiAgYm9vbGVhbnM6IFtcbiAgICBgKFwiZW50ZXJwcmlzZVwiID0gZmFsc2UpYCxcbiAgICBgKFwiZW50ZXJwcmlzZVwiID0gdHJ1ZSlgLFxuICAgIGAoKFwiZW50ZXJwcmlzZVwiIElTIE5VTEwpKWAsXG4gIF0sXG4gIGdlb21ldHJpZXM6IFtcbiAgICBgKChcImxvY2F0aW9uXCIgSVMgTlVMTCkpYCxcbiAgICBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTElORVNUUklORygtMS4zODUwMTUgMTEuNzEzNjU0LC0yLjY5MTgzMyAwLjM4MjQ4MywtMTAuMzI2NDE4IDguMjIwMTA5KSkpYCxcbiAgICBgKERXSVRISU4oXCJhbnlHZW9cIiwgTElORVNUUklORygtMS43MTk4OTQgMTEuNzYwMjc0LC0xLjYxMTMzMSAzLjkzOTM5OCwtOC43NzQwNjIgNy41Njc3NjQpLCA1MDAsIG1ldGVycykpYCxcbiAgICBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgUE9MWUdPTigoLTAuNTgwNjM0IDEwLjI5NTA5NCwwLjU3NzM0MSAtMS4xODg0NjEsLTUuMDQxNjM4IC0xLjEwMDg5MSwtMC41ODA2MzQgMTAuMjk1MDk0KSkpKWAsXG4gICAgYChEV0lUSElOKFwiYW55R2VvXCIsIFBPTFlHT04oKC0wLjU4MDYzNCAxMC4yOTUwOTQsMC41NzczNDEgLTEuMTg4NDYxLC01LjA0MTYzOCAtMS4xMDA4OTEsLTAuNTgwNjM0IDEwLjI5NTA5NCkpLCA1MDAsIG1ldGVycykpYCxcbiAgICBgKERXSVRISU4oXCJhbnlHZW9cIiwgUE9JTlQoLTIuNzAzOTMzIDQuNzI2ODM4KSwgNTIzMjgzLjk3MTEyMSwgbWV0ZXJzKSlgLFxuICBdLFxufSBhcyBSZWNvcmQ8Q2FwYWJpbGl0eUNhdGVnb3JpZXNUeXBlLCBBcnJheTxzdHJpbmc+PlxuXG5jb25zdCBjcWxNdWx0aXBvbHlnb25TdHJpbmdzID0ge1xuICBnZW9tZXRyaWVzOiBbXG4gICAge1xuICAgICAgaW5wdXQ6IGAoSU5URVJTRUNUUyhcImFueUdlb1wiLCBcbiAgICAgIE1VTFRJUE9MWUdPTihcbiAgICAgICAgKCgtMC41ODA2MzQgMTAuMjk1MDk0LDAuNTc3MzQxIC0xLjE4ODQ2MSwtNS4wNDE2MzggLTEuMTAwODkxLC0wLjU4MDYzNCAxMC4yOTUwOTQpKSwgXG4gICAgICAgICgoMC41ODA2MzQgMTAuMjk1MDk0LDAuNTc3MzQxIC0xLjE4ODQ2MSwtNS4wNDE2MzggLTEuMTAwODkxLDAuNTgwNjM0IDEwLjI5NTA5NCkpLFxuICAgICAgICAoKDEwIDEwLC0xMCAtMTAsLTEwIDEwLDEwIDEwKSlcbiAgICAgICkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdwb2x5JyxcbiAgICAgICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgICAgIFstMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgICAgWzAuNTc3MzQxLCAtMS4xODg0NjFdLFxuICAgICAgICAgICAgICAgIFstNS4wNDE2MzgsIC0xLjEwMDg5MV0sXG4gICAgICAgICAgICAgICAgWy0wLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPTFlHT04nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdwb2x5JyxcbiAgICAgICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgICAgIFswLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgICBbMC41NzczNDEsIC0xLjE4ODQ2MV0sXG4gICAgICAgICAgICAgICAgWy01LjA0MTYzOCwgLTEuMTAwODkxXSxcbiAgICAgICAgICAgICAgICBbMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbMTAsIDEwXSxcbiAgICAgICAgICAgICAgICBbLTEwLCAtMTBdLFxuICAgICAgICAgICAgICAgIFstMTAsIDEwXSxcbiAgICAgICAgICAgICAgICBbMTAsIDEwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPTFlHT04nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIE1VTFRJUE9MWUdPTigoKC0wLjU4MDYzNCAxMC4yOTUwOTQsMC41NzczNDEgLTEuMTg4NDYxLC01LjA0MTYzOCAtMS4xMDA4OTEsLTAuNTgwNjM0IDEwLjI5NTA5NCkpKSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWy0wLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgICBbMC41NzczNDEsIC0xLjE4ODQ2MV0sXG4gICAgICAgICAgICAgICAgWy01LjA0MTYzOCwgLTEuMTAwODkxXSxcbiAgICAgICAgICAgICAgICBbLTAuNTgwNjM0LCAxMC4yOTUwOTRdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgTVVMVElQT0xZR09OKCgoLTAuNTgwNjM0IDEwLjI5NTA5NCwwLjU3NzM0MSAtMS4xODg0NjEsLTUuMDQxNjM4IC0xLjEwMDg5MSwtMC41ODA2MzQgMTAuMjk1MDk0KSkpLCA1MDAsIG1ldGVycykpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWy0wLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgICBbMC41NzczNDEsIC0xLjE4ODQ2MV0sXG4gICAgICAgICAgICAgICAgWy01LjA0MTYzOCwgLTEuMTAwODkxXSxcbiAgICAgICAgICAgICAgICBbLTAuNTgwNjM0LCAxMC4yOTUwOTRdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBwb2x5Z29uQnVmZmVyV2lkdGg6ICc1MDAnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTVVMVElQT0xZR09OKCgoMTcuNzA0NTYzOTUxODI3MzI1IDI2LjgwNjcwODcyNTQ0ODIxLDI2LjY5OTYyNDY2OTI4Nzk4IDE0Ljk1NjA3MzE3NzA0NzY2Nyw5LjI4MDYxODIwMDU1NDY0OSAxNS4zMTMwMjAwMzA5MTUxNjcsMTcuNzA0NTYzOTUxODI3MzI1IDI2LjgwNjcwODcyNTQ0ODIxKSkpKSkgT1IgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTVVMVElQT0xZR09OKCgoMzcuNjIyMTk4Mzk3NjMzMDcgMjIuMDk1MDEwMjU0Mzk3NDA1LDQ4LjgzMDMyOTYwOTA3MjE0IDMyLjU4OTI0Nzc1ODEwMTUsNTAuNjg2NDUzMjQ5MTgzMDUgMjEuMDk1NTU5MDYzNTY4NDMsNDAuMTkyMjE1NzQ1NDc4OTcgMTcuMzExOTIyNDEyNTczMDksMzcuNjIyMTk4Mzk3NjMzMDcgMjIuMDk1MDEwMjU0Mzk3NDA1KSkpKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbMTcuNzA0NTYzOTUxODI3MzI1LCAyNi44MDY3MDg3MjU0NDgyMV0sXG4gICAgICAgICAgICAgICAgWzI2LjY5OTYyNDY2OTI4Nzk4LCAxNC45NTYwNzMxNzcwNDc2NjddLFxuICAgICAgICAgICAgICAgIFs5LjI4MDYxODIwMDU1NDY0OSwgMTUuMzEzMDIwMDMwOTE1MTY3XSxcbiAgICAgICAgICAgICAgICBbMTcuNzA0NTYzOTUxODI3MzI1LCAyNi44MDY3MDg3MjU0NDgyMV0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbMzcuNjIyMTk4Mzk3NjMzMDcsIDIyLjA5NTAxMDI1NDM5NzQwNV0sXG4gICAgICAgICAgICAgICAgWzQ4LjgzMDMyOTYwOTA3MjE0LCAzMi41ODkyNDc3NTgxMDE1XSxcbiAgICAgICAgICAgICAgICBbNTAuNjg2NDUzMjQ5MTgzMDUsIDIxLjA5NTU1OTA2MzU2ODQzXSxcbiAgICAgICAgICAgICAgICBbNDAuMTkyMjE1NzQ1NDc4OTcsIDE3LjMxMTkyMjQxMjU3MzA5XSxcbiAgICAgICAgICAgICAgICBbMzcuNjIyMTk4Mzk3NjMzMDcsIDIyLjA5NTAxMDI1NDM5NzQwNV0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG59XG5cbmNvbnN0IGNxbFBvaW50U3RyaW5ncyA9IHtcbiAgZ2VvbWV0cmllczogW1xuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgUE9JTlQoMTAgMjApKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTVVMVElQT0lOVCgxMCAyMCwgNSA1KSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIGxhdDogMjAsXG4gICAgICAgICAgICAgIGxvbjogMTAsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIGxhdDogNSxcbiAgICAgICAgICAgICAgbG9uOiA1LFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChEV0lUSElOKFwiYW55R2VvXCIsIFBPSU5UKDEwIDIwKSwgMTAwLCBtZXRlcnMpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICBsYXQ6IDIwLFxuICAgICAgICAgICAgICBsb246IDEwLFxuICAgICAgICAgICAgICByYWRpdXM6ICcxMDAnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBNVUxUSVBPSU5UKDEwIDIwKSwgMTAwLCBtZXRlcnMpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICBsYXQ6IDIwLFxuICAgICAgICAgICAgICBsb246IDEwLFxuICAgICAgICAgICAgICByYWRpdXM6ICcxMDAnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChEV0lUSElOKFwiYW55R2VvXCIsIE1VTFRJUE9JTlQoMTAgMjAsIDUgNSksIDEwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgICAgcmFkaXVzOiAnMTAwJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgbGF0OiA1LFxuICAgICAgICAgICAgICBsb246IDUsXG4gICAgICAgICAgICAgIHJhZGl1czogJzEwMCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufVxuXG5jb25zdCBjcWxMaW5lc3RyaW5ncyA9IHtcbiAgZ2VvbWV0cmllczogW1xuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTElORVNUUklORygxMCAyMCwgMzAgMzAsIDQwIDIwKSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbMTAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDMwXSxcbiAgICAgICAgICAgICAgICBbNDAsIDIwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTVVMVElMSU5FU1RSSU5HKCgxMCAxMCwgMjAgMjAsIDEwIDQwKSwgKDQwIDQwLCAzMCAzMCwgNDAgMjAsIDMwIDEwKSkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAxMF0sXG4gICAgICAgICAgICAgICAgWzIwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzEwLCA0MF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbNDAsIDQwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDMwXSxcbiAgICAgICAgICAgICAgICBbNDAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDEwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBMSU5FU1RSSU5HKDEwIDIwLCAzMCAzMCwgNDAgMjApLCAxMDAwLCBtZXRlcnMpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lV2lkdGg6ICcxMDAwJyxcbiAgICAgICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgICAgIFsxMCwgMjBdLFxuICAgICAgICAgICAgICAgIFszMCwgMzBdLFxuICAgICAgICAgICAgICAgIFs0MCwgMjBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBNVUxUSUxJTkVTVFJJTkcoKDEwIDEwLCAyMCAyMCwgMTAgNDApKSwgMTAwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZVdpZHRoOiAnMTAwMCcsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbMTAsIDEwXSxcbiAgICAgICAgICAgICAgICBbMjAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMTAsIDQwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBNVUxUSUxJTkVTVFJJTkcoKDEwIDEwLCAyMCAyMCwgMTAgNDApLCAoNDAgNDAsIDMwIDMwLCA0MCAyMCwgMzAgMTApKSwgMTAwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZVdpZHRoOiAnMTAwMCcsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbMTAsIDEwXSxcbiAgICAgICAgICAgICAgICBbMjAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMTAsIDQwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZVdpZHRoOiAnMTAwMCcsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbNDAsIDQwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDMwXSxcbiAgICAgICAgICAgICAgICBbNDAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDEwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG59XG5cbmNvbnN0IGNxbEdlb21ldHJ5Q29sbGVjdGlvbnMgPSB7XG4gIGdlb21ldHJpZXM6IFtcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIEdFT01FVFJZQ09MTEVDVElPTihQT0lOVCgxMCAyMCksIExJTkVTVFJJTkcoMzAgMzAsIDQwIDIwKSkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgICBsYXQ6IDIwLFxuICAgICAgICAgICAgICBsb246IDEwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzMwLCAzMF0sXG4gICAgICAgICAgICAgICAgWzQwLCAyMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgR0VPTUVUUllDT0xMRUNUSU9OKEdFT01FVFJZQ09MTEVDVElPTihQT0lOVCgxMCAyMCkpLCBMSU5FU1RSSU5HKDMwIDMwLCA0MCAyMCkpKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgICAgIFszMCwgMzBdLFxuICAgICAgICAgICAgICAgIFs0MCwgMjBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChEV0lUSElOKFwiYW55R2VvXCIsIEdFT01FVFJZQ09MTEVDVElPTihQT0lOVCgxMCAyMCkpLCAxMDAwLCBtZXRlcnMpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgICBsYXQ6IDIwLFxuICAgICAgICAgICAgICBsb246IDEwLFxuICAgICAgICAgICAgICByYWRpdXM6ICcxMDAwJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBHRU9NRVRSWUNPTExFQ1RJT04oR0VPTUVUUllDT0xMRUNUSU9OKFBPTFlHT04oKDEwIDIwLCAxNSAxOCwgNSA5LCAxMCAyMCkpKSwgTElORVNUUklORygzMCAzMCwgNDAgMjApKSwgMTAwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgICAgcG9seWdvbkJ1ZmZlcldpZHRoOiAnMTAwMCcsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbMTAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMTUsIDE4XSxcbiAgICAgICAgICAgICAgICBbNSwgOV0sXG4gICAgICAgICAgICAgICAgWzEwLCAyMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogJzEwMDAnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzMwLCAzMF0sXG4gICAgICAgICAgICAgICAgWzQwLCAyMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufVxuXG4vKipcbiAqIFNhbWUgYXMgYWJvdmUsIGJ1dCB0aGlzIGdvZXMgYmV5b25kIGp1c3QgdGVzdGluZyBmdW5jdGlvbnMsIGl0IHRlc3RzIHRoZSBib29sZWFuIGxvZ2ljXG4gKlxuICogVGhlIGRpZmZlcmVudCBzZWN0aW9uIGlzIGZvciB0aGluZ3MgdGhhdCB0ZWNobmljYWxseSBjYW4gYmUgc2ltcGxpZmllZCBieSBib29sZWFuIGxvZ2ljLiAgRHVlIHRvIGhvdyByZWNvbnN0aXR1dGlvbiB3b3JrcywgdXRpbGl6aW5nIHBvc3RmaXgsIHdlIGFyZSBmb3JjZWQgdG8gc2ltcGxpZnkuICBJZiB3ZSBkaWRuJ3QsIHRoaW5ncyB3b3VsZCBnZXQgc3VwZXIgbmVzdGVkIChsb29rdXAgcG9zdGZpeCBub3RhdGlvbiBmb3IgbW9yZSBvbiB3aHkpLiAgU28gaW4gc29tZSBjYXNlcywgd2UgbWlnaHQgc2ltcGxpZnkgYmV5b25kIHRoZSBleHBlY3RhdGlvbi4gIFRoZSB0d28gcmVzdWx0cyB3aWxsIGhhdmUgcGFyaXR5IHRob3VnaCBzaW5jZSB3ZSBmb2xsb3cgYm9vbGVhbiBhbGdlYnJhIHJ1bGVzLlxuICovXG5jb25zdCBjcWxCb29sZWFuTG9naWNTdHJpbmdzID0ge1xuICBzYW1lOiBbXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIEFORCAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKWAsXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcyJykpKWAsXG4gICAgYE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICclJykgQU5EIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykpKSlgLFxuICAgIGAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSkpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMicpKSlgLFxuICAgIGBOT1QgKChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMScpKSkgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcyJykpKSlgLFxuICAgIGBOT1QgKChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMicpKSkpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSkpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSkpKSlgLFxuICAgIGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBBTkQgKFwiYW55VGV4dFwiIElMSUtFICcnKSlgLFxuICAgIGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykpKWAsXG4gICAgYE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSkpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSlgLFxuICAgIGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgQU5EIChcImFueVRleHRcIiBJTElLRSAnJykpKSlgLFxuICBdLFxuICBkaWZmZXJlbnQ6IFtcbiAgICB7XG4gICAgICBpbnB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpKWAsXG4gICAgICBvdXRwdXQ6IGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpYCxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykpKSlgLFxuICAgICAgb3V0cHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSkpYCxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSlgLFxuICAgICAgb3V0cHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpYCxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSlgLFxuICAgICAgb3V0cHV0OiBgTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykpYCxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBBTkQgKFwiYW55VGV4dFwiIElMSUtFICcnKSkpYCxcbiAgICAgIG91dHB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBBTkQgKFwiYW55VGV4dFwiIElMSUtFICcnKSlgLFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGBOT1QgKChcImFueVRleHRcIiBJTElLRSAnJScpIEFORCAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzUnKSBBTkQgKChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMScpKSkgQU5EIChcImFueVRleHRcIiBJTElLRSAnMycpKSBBTkQgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICc0JykpKSkpKWAsXG4gICAgICBvdXRwdXQ6IGBOT1QgKChcImFueVRleHRcIiBJTElLRSAnJScpIEFORCAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzUnKSBBTkQgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcxJykpKSBBTkQgKFwiYW55VGV4dFwiIElMSUtFICczJykgQU5EIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnNCcpKSkpKSlgLFxuICAgIH0sXG4gIF0sXG59IGFzIHtcbiAgc2FtZTogQXJyYXk8c3RyaW5nPlxuICBkaWZmZXJlbnQ6IEFycmF5PHsgaW5wdXQ6IHN0cmluZzsgb3V0cHV0OiBzdHJpbmcgfT5cbn1cblxuZGVzY3JpYmUoJ3JlYWQgJiB3cml0ZSBwYXJpdHkgZm9yIGNhcGFiaWxpdGllcywgYXMgd2VsbCBhcyBib29sZWFuIGxvZ2ljJywgKCkgPT4ge1xuICBpdCgnVEVTVCBHRVQgR0VPIEZJTFRFUlMnLCAoKSA9PiB7XG4gICAgY29uc3Qgd2t0ID0gJ0dFT01FVFJZQ09MTEVDVElPTihQT0lOVCg1MCA0MCksIExJTkVTVFJJTkcoMTAgMjAsIDQwIDUwKSknXG4gICAgY3FsLmdldEdlb0ZpbHRlcnMod2t0LCAnYW55R2VvJywgJzEwMCcpXG4gICAgZXhwZWN0KCd0ZXN0LXZhbHVlJywgJ0FkZGluZyBib2d1cyBleHBlY3RhdGlvbi4nKS50by5lcXVhbCgndGVzdC12YWx1ZScpXG4gIH0pXG5cbiAgaXQoJ1RFU1QgTElORVNUUklORyBGSUxURVJTJywgKCkgPT4ge1xuICAgIGNvbnN0IHdrdCA9ICdMSU5FU1RSSU5HKDEwIDIwLCA0MCA1MCknXG4gICAgY3FsLmdldEdlb0ZpbHRlcnMod2t0LCAnYW55R2VvJywgJzEwMCcpXG4gICAgZXhwZWN0KCd0ZXN0LXZhbHVlJywgJ0FkZGluZyBib2d1cyBleHBlY3RhdGlvbi4nKS50by5lcXVhbCgndGVzdC12YWx1ZScpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Rlc3QgYWxsIGNhcGFiaWxpdGllcycsICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHR5cGUgaW4gY3FsQ2FwYWJpbGl0eVN0cmluZ3MpIHtcbiAgICAgIGNxbENhcGFiaWxpdHlTdHJpbmdzW3R5cGUgYXMgQ2FwYWJpbGl0eUNhdGVnb3JpZXNUeXBlXS5mb3JFYWNoKFxuICAgICAgICAoY2FwYWJpbGl0eSkgPT4ge1xuICAgICAgICAgIGl0KGAke2NhcGFiaWxpdHl9YCwgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGNhcGFiaWxpdHksICdVbmV4cGVjdGVkIGZpbHRlciB2YWx1ZS4nKS50by5lcXVhbChcbiAgICAgICAgICAgICAgY3FsLndyaXRlKGNxbC5yZWFkKGNhcGFiaWxpdHkpKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Rlc3QgYWxsIGxvZ2ljJywgKCkgPT4ge1xuICAgIGRlc2NyaWJlKCd3aGVyZSB0aGluZ3Mgc3RheSB0aGUgc2FtZSAoYWxyZWFkeSBzaW1wbGlmaWVkKScsICgpID0+IHtcbiAgICAgIGNxbEJvb2xlYW5Mb2dpY1N0cmluZ3NbJ3NhbWUnXS5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgICAgICBpdChgJHtpbnB1dH1gLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGlucHV0LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZXF1YWwoXG4gICAgICAgICAgICBjcWwud3JpdGUoY3FsLnJlYWQoaW5wdXQpKVxuICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVyZSB0aGluZ3MgZGlmZmVyICh0aGV5IGdldCBzaW1wbGlmaWVkKScsICgpID0+IHtcbiAgICAgIGNxbEJvb2xlYW5Mb2dpY1N0cmluZ3NbJ2RpZmZlcmVudCddLmZvckVhY2goKGlucHV0T3V0cHV0UGFpcikgPT4ge1xuICAgICAgICBpdChgJHtpbnB1dE91dHB1dFBhaXIuaW5wdXR9YCwgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChpbnB1dE91dHB1dFBhaXIub3V0cHV0LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZXF1YWwoXG4gICAgICAgICAgICBjcWwud3JpdGUoY3FsLnJlYWQoaW5wdXRPdXRwdXRQYWlyLmlucHV0KSlcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Rlc3QgY29ybmVyIGNhc2VzIC8gc3BlY2lhbCcsICgpID0+IHtcbiAgICBpdCgnaXQgaGFuZGxlcyBlc2NhcGluZyBfIGluIHByb3BlcnRpZXMgdGhhdCBhcmUgbm90IGlkJywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSAnMTIxMjMxMjNfMTIzMjEzMTIzJ1xuICAgICAgY29uc3Qgb3JpZ2luYWxGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJz0nLFxuICAgICAgICAgICAgcHJvcGVydHk6ICd0aXRsZScsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBjcWxUZXh0ID0gY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKVxuICAgICAgY29uc3QgbmV3RmlsdGVyID0gY3FsLnJlYWQoY3FsVGV4dClcbiAgICAgIGNvbnN0IGZpbHRlclRvQ2hlY2sgPSBuZXdGaWx0ZXIuZmlsdGVyc1swXSBhcyBGaWx0ZXJDbGFzc1xuICAgICAgZXhwZWN0KGNxbFRleHQsIGBEb2Vzbid0IGVzY2FwZSBwcm9wZXJseWApLnRvLmVxdWFsKFxuICAgICAgICAnKFwidGl0bGVcIiA9IFxcJzEyMTIzMTIzXFxcXF8xMjMyMTMxMjNcXCcpJ1xuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlclRvQ2hlY2sudmFsdWUpLnRvLmVxdWFsKHZhbHVlKVxuICAgIH0pXG5cbiAgICBpdCgnaXQgaGFuZGxlcyBlc2NhcGluZyBfIGluIHByb3BlcnRpZXMgdGhhdCBhcmUgaWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9ICcxMjEyMzEyM18xMjMyMTMxMjMnXG4gICAgICBjb25zdCBvcmlnaW5hbEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2lkJyxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IGNxbFRleHQgPSBjcWwud3JpdGUob3JpZ2luYWxGaWx0ZXIpXG4gICAgICBjb25zdCBuZXdGaWx0ZXIgPSBjcWwucmVhZChjcWxUZXh0KVxuICAgICAgY29uc3QgZmlsdGVyVG9DaGVjayA9IG5ld0ZpbHRlci5maWx0ZXJzWzBdIGFzIEZpbHRlckNsYXNzXG4gICAgICBleHBlY3QoY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKSwgYERvZXNuJ3QgZXNjYXBlIHByb3Blcmx5YCkudG8uZXF1YWwoXG4gICAgICAgICcoXCJpZFwiID0gXFwnMTIxMjMxMjNfMTIzMjEzMTIzXFwnKSdcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXJUb0NoZWNrLnZhbHVlKS50by5lcXVhbCh2YWx1ZSlcbiAgICB9KVxuXG4gICAgaXQoJ2l0IGhhbmRsZXMgZXNjYXBpbmcgXyBpbiBwcm9wZXJ0aWVzIHRoYXQgYXJlIFwiaWRcIiAoZG91YmxlIHdyYXBwZWQhKScsICgpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gJzEyMTIzMTIzXzEyMzIxMzEyMydcbiAgICAgIGNvbnN0IG9yaWdpbmFsRmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnXCJpZFwiJyxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IGNxbFRleHQgPSBjcWwud3JpdGUob3JpZ2luYWxGaWx0ZXIpXG4gICAgICBjb25zdCBuZXdGaWx0ZXIgPSBjcWwucmVhZChjcWxUZXh0KVxuICAgICAgY29uc3QgZmlsdGVyVG9DaGVjayA9IG5ld0ZpbHRlci5maWx0ZXJzWzBdIGFzIEZpbHRlckNsYXNzXG4gICAgICBleHBlY3QoY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKSwgYERvZXNuJ3QgZXNjYXBlIHByb3Blcmx5YCkudG8uZXF1YWwoXG4gICAgICAgICcoXCJpZFwiID0gXFwnMTIxMjMxMjNfMTIzMjEzMTIzXFwnKSdcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXJUb0NoZWNrLnZhbHVlKS50by5lcXVhbCh2YWx1ZSlcbiAgICB9KVxuXG4gICAgaXQoYGl0IGhhbmRsZXMgZXNjYXBpbmcgXyBpbiBwcm9wZXJ0aWVzIHRoYXQgYXJlICdpZCcgKGRvdWJsZSB3cmFwcGVkISlgLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9ICcxMjEyMzEyM18xMjMyMTMxMjMnXG4gICAgICBjb25zdCBvcmlnaW5hbEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogYCdpZCdgLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgY29uc3QgY3FsVGV4dCA9IGNxbC53cml0ZShvcmlnaW5hbEZpbHRlcilcbiAgICAgIGNvbnN0IG5ld0ZpbHRlciA9IGNxbC5yZWFkKGNxbFRleHQpXG4gICAgICBjb25zdCBmaWx0ZXJUb0NoZWNrID0gbmV3RmlsdGVyLmZpbHRlcnNbMF0gYXMgRmlsdGVyQ2xhc3NcbiAgICAgIGV4cGVjdChjcWwud3JpdGUob3JpZ2luYWxGaWx0ZXIpLCBgRG9lc24ndCBlc2NhcGUgcHJvcGVybHlgKS50by5lcXVhbChcbiAgICAgICAgJyhcImlkXCIgPSBcXCcxMjEyMzEyM18xMjMyMTMxMjNcXCcpJ1xuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlclRvQ2hlY2sudmFsdWUpLnRvLmVxdWFsKHZhbHVlKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2ludmFsaWQgZmlsdGVycyBnZXQgcmVtb3ZlZCcsICgpID0+IHtcbiAgICBpdCgnaGFuZGxlcyB0eXBpY2FsIGFueURhdGUgcmVtb3ZhbCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlEYXRlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0JFRk9SRScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKGAoXFxcImFueVRleHRcXFwiIElMSUtFICclJylgKVxuICAgIH0pXG5cbiAgICBpdCgnaGFuZGxlcyBlbXB0eSByZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKGAoXFxcImFueVRleHRcXFwiIElMSUtFICclJylgKVxuICAgIH0pXG5cbiAgICBpdCgnaGFuZGxlcyBpbnZhbGlkIHZhbHVlcyBpbiByZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFsnYm9ndXMnXSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChgKFxcXCJhbnlUZXh0XFxcIiBJTElLRSAnJScpYClcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgaW52YWxpZCB2YWx1ZXMgbWl4ZWQgd2l0aCB2YWxpZCB2YWx1ZXMgaW4gcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLCAoKSA9PiB7XG4gICAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZylcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5leHRyYSA9IHtcbiAgICAgICAgICBkYXRhdHlwZXM6IERhdGF0eXBlc0pTT05Db25maWcsXG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFsnYm9ndXMnLCAnUGVyc29uJ10sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgICAgdmFsdWU6ICcqJyxcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoKCgoXCJkZXNjcmlwdGlvblwiIElMSUtFIFxcJ3BlcnNvblxcJykpKSkgT1IgKFwiYW55VGV4dFwiIElMSUtFIFxcJyVcXCcpYFxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnaGFuZGxlcyBhbnlEYXRlIHJlbW92YWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlEYXRlJyxcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgICAgdmFsdWU6ICcqJyxcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoYChcXFwiYW55VGV4dFxcXCIgSUxJS0UgJyUnKWApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgndGVzdCByZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsICgpID0+IHtcbiAgICBpdCgnZG9lcyBoYW5kbGUgYSBzaW1wbGUgcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLCAoKSA9PiB7XG4gICAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZylcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5leHRyYSA9IHtcbiAgICAgICAgICBkYXRhdHlwZXM6IERhdGF0eXBlc0pTT05Db25maWcsXG4gICAgICAgIH1cbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFsnUGVyc29uJywgJ01pbGl0YXJ5J10sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKCgoKFwiZGVzY3JpcHRpb25cIiBJTElLRSBcXCdwZXJzb25cXCcpIE9SIChcImRlc2NyaXB0aW9uXCIgSUxJS0UgXFwnbWlsaXRhcnlcXCcpKSkpYFxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBoYW5kbGUgYSBuZWdhdGVkIHJlc2VydmVkLmJhc2ljLWRhdGF0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuZXh0cmEgPSB7XG4gICAgICAgICAgZGF0YXR5cGVzOiBEYXRhdHlwZXNKU09OQ29uZmlnLFxuICAgICAgICB9XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IHRydWUsXG4gICAgICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3Jlc2VydmVkLmJhc2ljLWRhdGF0eXBlJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogWydQZXJzb24nLCAnTWlsaXRhcnknXSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoTk9UICgoKChcImRlc2NyaXB0aW9uXCIgSUxJS0UgXFwncGVyc29uXFwnKSBPUiAoXCJkZXNjcmlwdGlvblwiIElMSUtFIFxcJ21pbGl0YXJ5XFwnKSkpKSlgXG4gICAgICApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgndGVzdCBib29sZWFuIHNlYXJjaCcsICgpID0+IHtcbiAgICBpdCgnZG9lcyBoYW5kbGVzIGEgc2ltcGxlIGJvb2xlYW4gc2VhcmNoJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBjcWw6IGAoYW55VGV4dCBJTElLRSAnKicpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICB0ZXh0OiAnXCIqXCInLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChgKChhbnlUZXh0IElMSUtFICcqJykpYClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCAyJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBjcWw6IGAoYW55VGV4dCBJTElLRSAnZG9nJykgb3IgKGFueVRleHQgSUxJS0UgJ2NhdCcpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykpYFxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBoYW5kbGVzIGEgc2ltcGxlIGJvb2xlYW4gc2VhcmNoIHRoYXQgaXMgZW1wdHknLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYGAsXG4gICAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGV4dDogJycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKGAoKGFueVRleHQgSUxJS0UgJyonKSlgKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBoYW5kbGVzIGEgc2ltcGxlIGJvb2xlYW4gc2VhcmNoIHdpdGggbm90JywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBjcWw6IGAoYW55VGV4dCBJTElLRSAnZG9nJykgb3IgKGFueVRleHQgSUxJS0UgJ2NhdCcpIGFuZCAoTk9UICgoYW55VGV4dCBJTElLRSAnZmlzaCcpKSlgLFxuICAgICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCBvdGhlciB0ZXJtcycsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RhdGF0eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdtZXRhZGF0YS1jb250ZW50LXR5cGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpKSBBTkQgKChcXFwiZGF0YXR5cGVcXFwiIElMSUtFICdNb3ZpbmcgSW1hZ2UnKSBPUiAoXFxcIm1ldGFkYXRhLWNvbnRlbnQtdHlwZVxcXCIgSUxJS0UgJ01vdmluZyBJbWFnZScpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCBvdGhlciB0ZXJtcyBhbmQgbmVnYXRpb25zJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RhdGF0eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdtZXRhZGF0YS1jb250ZW50LXR5cGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoTk9UICgoKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpKSkpIEFORCAoKFxcXCJkYXRhdHlwZVxcXCIgSUxJS0UgJ01vdmluZyBJbWFnZScpIE9SIChcXFwibWV0YWRhdGEtY29udGVudC10eXBlXFxcIiBJTElLRSAnTW92aW5nIEltYWdlJykpYFxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBoYW5kbGVzIGEgc2ltcGxlIGJvb2xlYW4gc2VhcmNoIG90aGVyIHRlcm1zIHdpdGggaW50ZXJzcGVyc2VkIGVycm9ycycsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ21ldGFkYXRhLWNvbnRlbnQtdHlwZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ01vdmluZyBJbWFnZScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGAoKFxcXCJkYXRhdHlwZVxcXCIgSUxJS0UgJ01vdmluZyBJbWFnZScpIE9SIChcXFwibWV0YWRhdGEtY29udGVudC10eXBlXFxcIiBJTElLRSAnTW92aW5nIEltYWdlJykpYFxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZG9lcyBoYW5kbGVzIGEgc2ltcGxlIGJvb2xlYW4gc2VhcmNoIG90aGVyIHRlcm1zIHdpdGggaW50ZXJzcGVyc2VkIGVycm9ycyBhbmQgbmVnYXRpb25zJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgdGV4dDogJ2RvZyBvciBjYXQgYW5kIG5vdCAoZmlzaCknLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWRhdGEtY29udGVudC10eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoXG4gICAgICAgIGBOT1QgKCgoXCJkYXRhdHlwZVwiIElMSUtFIFxcJ01vdmluZyBJbWFnZVxcJykgT1IgKFwibWV0YWRhdGEtY29udGVudC10eXBlXCIgSUxJS0UgXFwnTW92aW5nIEltYWdlXFwnKSkpYFxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ211bHRpcG9seWdvbiBjcWwgc3RyaW5nIHJlYWQgdGVzdCcsICgpID0+IHtcbiAgICBjcWxNdWx0aXBvbHlnb25TdHJpbmdzLmdlb21ldHJpZXMuZm9yRWFjaCgoY2FwYWJpbGl0eSkgPT4ge1xuICAgICAgaXQoYCR7Y2FwYWJpbGl0eX1gLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dCA9IGNxbC5yZWFkKGNhcGFiaWxpdHkuaW5wdXQpXG4gICAgICAgIGNvbnN0IGZpbHRlcnNBcnJheTogYW55W10gPSBbXVxuXG4gICAgICAgIGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dC5maWx0ZXJzLmZvckVhY2goKGZpbHRlcikgPT4ge1xuICAgICAgICAgIGlmIChmaWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXJDbGFzcykge1xuICAgICAgICAgICAgY29uc3QgeyBpZCwgLi4ubmV3RmlsdGVyIH0gPSBmaWx0ZXJcbiAgICAgICAgICAgIGZpbHRlcnNBcnJheS5wdXNoKG5ld0ZpbHRlcilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHsgaWQsIC4uLmV4cGVjdGVkT3V0cHV0IH0gPSBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXRcbiAgICAgICAgZXhwZWN0ZWRPdXRwdXQuZmlsdGVycyA9IGZpbHRlcnNBcnJheVxuICAgICAgICBleHBlY3QoZXhwZWN0ZWRPdXRwdXQsICdVbmV4cGVjdGVkIGZpbHRlciB2YWx1ZS4nKS50by5kZWVwLmVxdWFsKFxuICAgICAgICAgIGNhcGFiaWxpdHkub3V0cHV0XG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgncG9pbnQgYW5kIG11bHRpcG9pbnQgY3FsIHN0cmluZyByZWFkIHRlc3QnLCAoKSA9PiB7XG4gICAgY3FsUG9pbnRTdHJpbmdzLmdlb21ldHJpZXMuZm9yRWFjaCgoY2FwYWJpbGl0eSkgPT4ge1xuICAgICAgaXQoYCR7Y2FwYWJpbGl0eX1gLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dCA9IGNxbC5yZWFkKGNhcGFiaWxpdHkuaW5wdXQpXG4gICAgICAgIGNvbnN0IGZpbHRlcnNBcnJheTogYW55W10gPSBbXVxuXG4gICAgICAgIGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dC5maWx0ZXJzLmZvckVhY2goKGZpbHRlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIC4uLm5ld0ZpbHRlciB9ID0gZmlsdGVyXG4gICAgICAgICAgZmlsdGVyc0FycmF5LnB1c2gobmV3RmlsdGVyKVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCB7IGlkLCAuLi5leHBlY3RlZE91dHB1dCB9ID0gZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0XG4gICAgICAgIGV4cGVjdGVkT3V0cHV0LmZpbHRlcnMgPSBmaWx0ZXJzQXJyYXlcbiAgICAgICAgZXhwZWN0KGV4cGVjdGVkT3V0cHV0LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZGVlcC5lcXVhbChcbiAgICAgICAgICBjYXBhYmlsaXR5Lm91dHB1dFxuICAgICAgICApXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2xpbmVzdHJpbmcgYW5kIG11bHRpbGluZXN0cmluZyBjcWwgc3RyaW5nIHJlYWQgdGVzdCcsICgpID0+IHtcbiAgICBjcWxMaW5lc3RyaW5ncy5nZW9tZXRyaWVzLmZvckVhY2goKGNhcGFiaWxpdHkpID0+IHtcbiAgICAgIGl0KGAke2NhcGFiaWxpdHl9YCwgKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQgPSBjcWwucmVhZChjYXBhYmlsaXR5LmlucHV0KVxuICAgICAgICBjb25zdCBmaWx0ZXJzQXJyYXk6IGFueVtdID0gW11cblxuICAgICAgICBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQuZmlsdGVycy5mb3JFYWNoKChmaWx0ZXIpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGlkLCAuLi5uZXdGaWx0ZXIgfSA9IGZpbHRlclxuICAgICAgICAgIGZpbHRlcnNBcnJheS5wdXNoKG5ld0ZpbHRlcilcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgeyBpZCwgLi4uZXhwZWN0ZWRPdXRwdXQgfSA9IGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dFxuICAgICAgICBleHBlY3RlZE91dHB1dC5maWx0ZXJzID0gZmlsdGVyc0FycmF5XG4gICAgICAgIGV4cGVjdChleHBlY3RlZE91dHB1dCwgJ1VuZXhwZWN0ZWQgZmlsdGVyIHZhbHVlLicpLnRvLmRlZXAuZXF1YWwoXG4gICAgICAgICAgY2FwYWJpbGl0eS5vdXRwdXRcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZW9tZXRyeSBjb2xsZWN0aW9uIGNxbCBzdHJpbmcgcmVhZCB0ZXN0JywgKCkgPT4ge1xuICAgIGNxbEdlb21ldHJ5Q29sbGVjdGlvbnMuZ2VvbWV0cmllcy5mb3JFYWNoKChjYXBhYmlsaXR5KSA9PiB7XG4gICAgICBpdChgJHtjYXBhYmlsaXR5fWAsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0ID0gY3FsLnJlYWQoY2FwYWJpbGl0eS5pbnB1dClcbiAgICAgICAgY29uc3QgZmlsdGVyc0FycmF5OiBhbnlbXSA9IFtdXG5cbiAgICAgICAgZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0LmZpbHRlcnMuZm9yRWFjaCgoZmlsdGVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBpZCwgLi4ubmV3RmlsdGVyIH0gPSBmaWx0ZXJcbiAgICAgICAgICBmaWx0ZXJzQXJyYXkucHVzaChuZXdGaWx0ZXIpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHsgaWQsIC4uLmV4cGVjdGVkT3V0cHV0IH0gPSBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXRcbiAgICAgICAgZXhwZWN0ZWRPdXRwdXQuZmlsdGVycyA9IGZpbHRlcnNBcnJheVxuICAgICAgICBleHBlY3QoZXhwZWN0ZWRPdXRwdXQsICdVbmV4cGVjdGVkIGZpbHRlciB2YWx1ZS4nKS50by5kZWVwLmVxdWFsKFxuICAgICAgICAgIGNhcGFiaWxpdHkub3V0cHV0XG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=