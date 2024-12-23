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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3FsLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY3FsLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQzdCLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsV0FBVyxHQUNaLE1BQU0sOENBQThDLENBQUE7QUFDckQsT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBRzFELElBQU0sbUJBQW1CLEdBQUc7SUFDMUIsTUFBTSxFQUFFO1FBQ04sTUFBTSxFQUFFO1lBQ04sVUFBVSxFQUFFO2dCQUNWLEtBQUssRUFBRSxtQkFBbUI7YUFDM0I7WUFDRCxNQUFNLEVBQUU7Z0JBQ04sTUFBTSxFQUFFO29CQUNOLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBQ3hCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsWUFBWTtxQkFDcEI7aUJBQ0Y7Z0JBQ0QsS0FBSyxFQUFFO29CQUNMLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7cUJBQ3ZCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsYUFBYTtxQkFDckI7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFO29CQUNULFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUM7cUJBQzNCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVBQUUsY0FBYztxQkFDdEI7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUM7cUJBQzFCO29CQUNELFVBQVUsRUFBRTt3QkFDVixLQUFLLEVB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QUssQ0FDOUQsVUFBVSxDQUFDLE1BQU0sQ0FDbEIsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuaW1wb3J0IHtcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgY3FsIGZyb20gJy4vY3FsJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgRGF0YVR5cGVzQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL2NvbXBvbmVudC9kYXRhdHlwZXMvZGF0YXR5cGVzJ1xuXG5jb25zdCBEYXRhdHlwZXNKU09OQ29uZmlnID0ge1xuICBncm91cHM6IHtcbiAgICBPYmplY3Q6IHtcbiAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgY2xhc3M6ICdmYSBmYS1maWxlLXRleHQtbycsXG4gICAgICB9LFxuICAgICAgdmFsdWVzOiB7XG4gICAgICAgIFBlcnNvbjoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ3BlcnNvbiddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS11c2VyJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBHcm91cDoge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ2dyb3VwJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXVzZXJzJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBFcXVpcG1lbnQ6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydlcXVpcG1lbnQnXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnZmEgZmEtd3JlbmNoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBQbGF0Zm9ybToge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ3BsYXRmb3JtJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWluZHVzdHJ5JyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBGYWNpbGl0eToge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ2ZhY2lsaXR5J10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWJ1aWxkaW5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIEhhcHBlbmluZ3M6IHtcbiAgICAgIGljb25Db25maWc6IHtcbiAgICAgICAgY2xhc3M6ICdmYSBmYS1ib2x0JyxcbiAgICAgIH0sXG4gICAgICB2YWx1ZXM6IHtcbiAgICAgICAgQ2l2aWw6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWydjaXZpbCddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS11bml2ZXJzaXR5JyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNaWxpdGFyeToge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbJ21pbGl0YXJ5J10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLXNoaWVsZCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgUG9saXRpY2FsOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsncG9saXRpY2FsJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWJhbGFuY2Utc2NhbGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE5hdHVyYWw6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogWyduYXR1cmFsJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWxlYWYnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE90aGVyOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IFsnb3RoZXInXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgICdWaXN1YWwgTWVkaWEnOiB7XG4gICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgIGNsYXNzOiAnZmEgZmEtY2FtZXJhLXJldHJvJyxcbiAgICAgIH0sXG4gICAgICB2YWx1ZXM6IHtcbiAgICAgICAgSW1hZ2U6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkYXRhdHlwZTogWydJbWFnZSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1waWN0dXJlLW8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdNb3ZpbmcgSW1hZ2UnOiB7XG4gICAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgICAgZGF0YXR5cGU6IFsnTW92aW5nIEltYWdlJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpY29uQ29uZmlnOiB7XG4gICAgICAgICAgICBjbGFzczogJ2ZhIGZhLWZpbG0nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdTdGlsbCBJbWFnZSc6IHtcbiAgICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgICBkYXRhdHlwZTogWydTdGlsbCBJbWFnZSddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWNvbkNvbmZpZzoge1xuICAgICAgICAgICAgY2xhc3M6ICdmYSBmYS1jYW1lcmEtcmV0cm8nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59IGFzIERhdGFUeXBlc0NvbmZpZ3VyYXRpb25cblxudHlwZSBDYXBhYmlsaXR5Q2F0ZWdvcmllc1R5cGUgPVxuICB8ICdzdHJpbmdzJ1xuICB8ICdudW1iZXJzJ1xuICB8ICdkYXRlcydcbiAgfCAnYm9vbGVhbnMnXG4gIHwgJ2dlb21ldHJpZXMnXG5cbi8qKlxuICogVGVzdCBhbGwgdGhlIGNhcGFiaWxpdGllcyAod2l0aG91dCBib29sZWFuIGxvZ2ljIGludm9sdmVkKS5cbiAqXG4gKiBsZWZ0IGlzIGlucHV0LCByaWdodCBpcyBleHBlY3RlZCBvdXRwdXQgKGNhbiBkaWZmZXIsIHdlIGRvIG91ciBiZXN0IGVmZm9ydCBidXQgdWx0aW1hdGVseSBzaW1wbGlmeWluZyBjYW4gY2hhbmdlIHRoaW5ncyEpXG4gKiBjYXRlZ29yaXplZCBieSB0eXBlcyBzbyBtYWtlIHRoaXMgZWFzaWVyIHRvIG1haW50YWluIGFuZCB1cGRhdGUgYXMgbmVlZGVkXG4gKi9cbmNvbnN0IGNxbENhcGFiaWxpdHlTdHJpbmdzID0ge1xuICBzdHJpbmdzOiBbXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpYCxcbiAgICBgKFwiYW55VGV4dFwiIExJS0UgJzEnKWAsXG4gICAgYChcImFueVRleHRcIiA9ICcxJylgLFxuICAgIGAocHJveGltaXR5KCdhbnlUZXh0JywyLCdzZWNvbmQgZmlyc3QnKSA9IHRydWUpYCxcbiAgICBgKChcInRpdGxlXCIgSVMgTlVMTCkpYCxcbiAgXSxcbiAgbnVtYmVyczogW1xuICAgIGAoXCJtZWRpYS53aWR0aC1waXhlbHNcIiA+IDApYCxcbiAgICBgKFwibWVkaWEud2lkdGgtcGl4ZWxzXCIgPCAwKWAsXG4gICAgYChcIm1lZGlhLndpZHRoLXBpeGVsc1wiID0gMClgLFxuICAgIGAoXCJtZWRpYS53aWR0aC1waXhlbHNcIiA+PSAwKWAsXG4gICAgYChcIm1lZGlhLndpZHRoLXBpeGVsc1wiIDw9IDApYCxcbiAgICBgKFwibWVkaWEud2lkdGgtcGl4ZWxzXCIgQkVUV0VFTiAwIEFORCAxKWAsXG4gICAgYCgoXCJtZWRpYS53aWR0aC1waXhlbHNcIiBJUyBOVUxMKSlgLFxuICBdLFxuICBkYXRlczogW1xuICAgIGAoXCJtb2RpZmllZFwiIEJFRk9SRSAyMDIwLTEyLTEwVDIwOjMxOjAzLjM4OFopYCxcbiAgICBgKFwibW9kaWZpZWRcIiBBRlRFUiAyMDIwLTEyLTEwVDIwOjMxOjAzLjM4OFopYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQVDFTKScpYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQVDFNKScpYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQVDFIKScpYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQMUQpJylgLFxuICAgIGAoXCJtb2RpZmllZFwiID0gJ1JFTEFUSVZFKFA3RCknKWAsXG4gICAgYChcIm1vZGlmaWVkXCIgPSAnUkVMQVRJVkUoUDFNKScpYCxcbiAgICBgKFwibW9kaWZpZWRcIiA9ICdSRUxBVElWRShQMVkpJylgLFxuICAgIGAoKFwiY3JlYXRlZFwiIElTIE5VTEwpKWAsXG4gIF0sXG4gIGJvb2xlYW5zOiBbXG4gICAgYChcImVudGVycHJpc2VcIiA9IGZhbHNlKWAsXG4gICAgYChcImVudGVycHJpc2VcIiA9IHRydWUpYCxcbiAgICBgKChcImVudGVycHJpc2VcIiBJUyBOVUxMKSlgLFxuICBdLFxuICBnZW9tZXRyaWVzOiBbXG4gICAgYCgoXCJsb2NhdGlvblwiIElTIE5VTEwpKWAsXG4gICAgYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIExJTkVTVFJJTkcoLTEuMzg1MDE1IDExLjcxMzY1NCwtMi42OTE4MzMgMC4zODI0ODMsLTEwLjMyNjQxOCA4LjIyMDEwOSkpKWAsXG4gICAgYChEV0lUSElOKFwiYW55R2VvXCIsIExJTkVTVFJJTkcoLTEuNzE5ODk0IDExLjc2MDI3NCwtMS42MTEzMzEgMy45MzkzOTgsLTguNzc0MDYyIDcuNTY3NzY0KSwgNTAwLCBtZXRlcnMpKWAsXG4gICAgYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIFBPTFlHT04oKC0wLjU4MDYzNCAxMC4yOTUwOTQsMC41NzczNDEgLTEuMTg4NDYxLC01LjA0MTYzOCAtMS4xMDA4OTEsLTAuNTgwNjM0IDEwLjI5NTA5NCkpKSlgLFxuICAgIGAoRFdJVEhJTihcImFueUdlb1wiLCBQT0xZR09OKCgtMC41ODA2MzQgMTAuMjk1MDk0LDAuNTc3MzQxIC0xLjE4ODQ2MSwtNS4wNDE2MzggLTEuMTAwODkxLC0wLjU4MDYzNCAxMC4yOTUwOTQpKSwgNTAwLCBtZXRlcnMpKWAsXG4gICAgYChEV0lUSElOKFwiYW55R2VvXCIsIFBPSU5UKC0yLjcwMzkzMyA0LjcyNjgzOCksIDUyMzI4My45NzExMjEsIG1ldGVycykpYCxcbiAgXSxcbn0gYXMgUmVjb3JkPENhcGFiaWxpdHlDYXRlZ29yaWVzVHlwZSwgQXJyYXk8c3RyaW5nPj5cblxuY29uc3QgY3FsTXVsdGlwb2x5Z29uU3RyaW5ncyA9IHtcbiAgZ2VvbWV0cmllczogW1xuICAgIHtcbiAgICAgIGlucHV0OiBgKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgXG4gICAgICBNVUxUSVBPTFlHT04oXG4gICAgICAgICgoLTAuNTgwNjM0IDEwLjI5NTA5NCwwLjU3NzM0MSAtMS4xODg0NjEsLTUuMDQxNjM4IC0xLjEwMDg5MSwtMC41ODA2MzQgMTAuMjk1MDk0KSksIFxuICAgICAgICAoKDAuNTgwNjM0IDEwLjI5NTA5NCwwLjU3NzM0MSAtMS4xODg0NjEsLTUuMDQxNjM4IC0xLjEwMDg5MSwwLjU4MDYzNCAxMC4yOTUwOTQpKSxcbiAgICAgICAgKCgxMCAxMCwtMTAgLTEwLC0xMCAxMCwxMCAxMCkpXG4gICAgICApKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbLTAuNTgwNjM0LCAxMC4yOTUwOTRdLFxuICAgICAgICAgICAgICAgIFswLjU3NzM0MSwgLTEuMTg4NDYxXSxcbiAgICAgICAgICAgICAgICBbLTUuMDQxNjM4LCAtMS4xMDA4OTFdLFxuICAgICAgICAgICAgICAgIFstMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAncG9seScsXG4gICAgICAgICAgICAgIHBvbHlnb246IFtcbiAgICAgICAgICAgICAgICBbMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgICAgWzAuNTc3MzQxLCAtMS4xODg0NjFdLFxuICAgICAgICAgICAgICAgIFstNS4wNDE2MzgsIC0xLjEwMDg5MV0sXG4gICAgICAgICAgICAgICAgWzAuNTgwNjM0LCAxMC4yOTUwOTRdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAxMF0sXG4gICAgICAgICAgICAgICAgWy0xMCwgLTEwXSxcbiAgICAgICAgICAgICAgICBbLTEwLCAxMF0sXG4gICAgICAgICAgICAgICAgWzEwLCAxMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0xZR09OJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoSU5URVJTRUNUUyhcImFueUdlb1wiLCBNVUxUSVBPTFlHT04oKCgtMC41ODA2MzQgMTAuMjk1MDk0LDAuNTc3MzQxIC0xLjE4ODQ2MSwtNS4wNDE2MzggLTEuMTAwODkxLC0wLjU4MDYzNCAxMC4yOTUwOTQpKSkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdwb2x5JyxcbiAgICAgICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgICAgIFstMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgICAgWzAuNTc3MzQxLCAtMS4xODg0NjFdLFxuICAgICAgICAgICAgICAgIFstNS4wNDE2MzgsIC0xLjEwMDg5MV0sXG4gICAgICAgICAgICAgICAgWy0wLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPTFlHT04nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChEV0lUSElOKFwiYW55R2VvXCIsIE1VTFRJUE9MWUdPTigoKC0wLjU4MDYzNCAxMC4yOTUwOTQsMC41NzczNDEgLTEuMTg4NDYxLC01LjA0MTYzOCAtMS4xMDA4OTEsLTAuNTgwNjM0IDEwLjI5NTA5NCkpKSwgNTAwLCBtZXRlcnMpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdwb2x5JyxcbiAgICAgICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgICAgIFstMC41ODA2MzQsIDEwLjI5NTA5NF0sXG4gICAgICAgICAgICAgICAgWzAuNTc3MzQxLCAtMS4xODg0NjFdLFxuICAgICAgICAgICAgICAgIFstNS4wNDE2MzgsIC0xLjEwMDg5MV0sXG4gICAgICAgICAgICAgICAgWy0wLjU4MDYzNCwgMTAuMjk1MDk0XSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgcG9seWdvbkJ1ZmZlcldpZHRoOiAnNTAwJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPTFlHT04nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIE1VTFRJUE9MWUdPTigoKDE3LjcwNDU2Mzk1MTgyNzMyNSAyNi44MDY3MDg3MjU0NDgyMSwyNi42OTk2MjQ2NjkyODc5OCAxNC45NTYwNzMxNzcwNDc2NjcsOS4yODA2MTgyMDA1NTQ2NDkgMTUuMzEzMDIwMDMwOTE1MTY3LDE3LjcwNDU2Mzk1MTgyNzMyNSAyNi44MDY3MDg3MjU0NDgyMSkpKSkpIE9SIChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIE1VTFRJUE9MWUdPTigoKDM3LjYyMjE5ODM5NzYzMzA3IDIyLjA5NTAxMDI1NDM5NzQwNSw0OC44MzAzMjk2MDkwNzIxNCAzMi41ODkyNDc3NTgxMDE1LDUwLjY4NjQ1MzI0OTE4MzA1IDIxLjA5NTU1OTA2MzU2ODQzLDQwLjE5MjIxNTc0NTQ3ODk3IDE3LjMxMTkyMjQxMjU3MzA5LDM3LjYyMjE5ODM5NzYzMzA3IDIyLjA5NTAxMDI1NDM5NzQwNSkpKSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWzE3LjcwNDU2Mzk1MTgyNzMyNSwgMjYuODA2NzA4NzI1NDQ4MjFdLFxuICAgICAgICAgICAgICAgIFsyNi42OTk2MjQ2NjkyODc5OCwgMTQuOTU2MDczMTc3MDQ3NjY3XSxcbiAgICAgICAgICAgICAgICBbOS4yODA2MTgyMDA1NTQ2NDksIDE1LjMxMzAyMDAzMDkxNTE2N10sXG4gICAgICAgICAgICAgICAgWzE3LjcwNDU2Mzk1MTgyNzMyNSwgMjYuODA2NzA4NzI1NDQ4MjFdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWzM3LjYyMjE5ODM5NzYzMzA3LCAyMi4wOTUwMTAyNTQzOTc0MDVdLFxuICAgICAgICAgICAgICAgIFs0OC44MzAzMjk2MDkwNzIxNCwgMzIuNTg5MjQ3NzU4MTAxNV0sXG4gICAgICAgICAgICAgICAgWzUwLjY4NjQ1MzI0OTE4MzA1LCAyMS4wOTU1NTkwNjM1Njg0M10sXG4gICAgICAgICAgICAgICAgWzQwLjE5MjIxNTc0NTQ3ODk3LCAxNy4zMTE5MjI0MTI1NzMwOV0sXG4gICAgICAgICAgICAgICAgWzM3LjYyMjE5ODM5NzYzMzA3LCAyMi4wOTUwMTAyNTQzOTc0MDVdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufVxuXG5jb25zdCBjcWxQb2ludFN0cmluZ3MgPSB7XG4gIGdlb21ldHJpZXM6IFtcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIFBPSU5UKDEwIDIwKSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIGxhdDogMjAsXG4gICAgICAgICAgICAgIGxvbjogMTAsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIE1VTFRJUE9JTlQoMTAgMjAsIDUgNSkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICBsYXQ6IDIwLFxuICAgICAgICAgICAgICBsb246IDEwLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgICBsYXQ6IDUsXG4gICAgICAgICAgICAgIGxvbjogNSxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBQT0lOVCgxMCAyMCksIDEwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgICAgcmFkaXVzOiAnMTAwJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgTVVMVElQT0lOVCgxMCAyMCksIDEwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgICAgcmFkaXVzOiAnMTAwJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBNVUxUSVBPSU5UKDEwIDIwLCA1IDUpLCAxMDAsIG1ldGVycykpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIGxhdDogMjAsXG4gICAgICAgICAgICAgIGxvbjogMTAsXG4gICAgICAgICAgICAgIHJhZGl1czogJzEwMCcsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIGxhdDogNSxcbiAgICAgICAgICAgICAgbG9uOiA1LFxuICAgICAgICAgICAgICByYWRpdXM6ICcxMDAnLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9JTlRSQURJVVMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbn1cblxuY29uc3QgY3FsTGluZXN0cmluZ3MgPSB7XG4gIGdlb21ldHJpZXM6IFtcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIExJTkVTVFJJTkcoMTAgMjAsIDMwIDMwLCA0MCAyMCkpKWAsXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzMwLCAzMF0sXG4gICAgICAgICAgICAgICAgWzQwLCAyMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIE1VTFRJTElORVNUUklORygoMTAgMTAsIDIwIDIwLCAxMCA0MCksICg0MCA0MCwgMzAgMzAsIDQwIDIwLCAzMCAxMCkpKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgICAgIFsxMCwgMTBdLFxuICAgICAgICAgICAgICAgIFsyMCwgMjBdLFxuICAgICAgICAgICAgICAgIFsxMCwgNDBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzQwLCA0MF0sXG4gICAgICAgICAgICAgICAgWzMwLCAzMF0sXG4gICAgICAgICAgICAgICAgWzQwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzMwLCAxMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgTElORVNUUklORygxMCAyMCwgMzAgMzAsIDQwIDIwKSwgMTAwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZVdpZHRoOiAnMTAwMCcsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbMTAsIDIwXSxcbiAgICAgICAgICAgICAgICBbMzAsIDMwXSxcbiAgICAgICAgICAgICAgICBbNDAsIDIwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgTVVMVElMSU5FU1RSSU5HKCgxMCAxMCwgMjAgMjAsIDEwIDQwKSksIDEwMDAsIG1ldGVycykpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogJzEwMDAnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAxMF0sXG4gICAgICAgICAgICAgICAgWzIwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzEwLCA0MF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgTVVMVElMSU5FU1RSSU5HKCgxMCAxMCwgMjAgMjAsIDEwIDQwKSwgKDQwIDQwLCAzMCAzMCwgNDAgMjAsIDMwIDEwKSksIDEwMDAsIG1ldGVycykpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogJzEwMDAnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAxMF0sXG4gICAgICAgICAgICAgICAgWzIwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzEwLCA0MF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmVXaWR0aDogJzEwMDAnLFxuICAgICAgICAgICAgICBsaW5lOiBbXG4gICAgICAgICAgICAgICAgWzQwLCA0MF0sXG4gICAgICAgICAgICAgICAgWzMwLCAzMF0sXG4gICAgICAgICAgICAgICAgWzQwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzMwLCAxMF0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICBdLFxufVxuXG5jb25zdCBjcWxHZW9tZXRyeUNvbGxlY3Rpb25zID0ge1xuICBnZW9tZXRyaWVzOiBbXG4gICAge1xuICAgICAgaW5wdXQ6IGAoSU5URVJTRUNUUyhcImFueUdlb1wiLCBHRU9NRVRSWUNPTExFQ1RJT04oUE9JTlQoMTAgMjApLCBMSU5FU1RSSU5HKDMwIDMwLCA0MCAyMCkpKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnbGluZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdMSU5FJyxcbiAgICAgICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgICAgIFszMCwgMzBdLFxuICAgICAgICAgICAgICAgIFs0MCwgMjBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIEdFT01FVFJZQ09MTEVDVElPTihHRU9NRVRSWUNPTExFQ1RJT04oUE9JTlQoMTAgMjApKSwgTElORVNUUklORygzMCAzMCwgNDAgMjApKSkpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgIHR5cGU6ICdQT0lOVFJBRElVUycsXG4gICAgICAgICAgICAgIGxhdDogMjAsXG4gICAgICAgICAgICAgIGxvbjogMTAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ2xpbmUnLFxuICAgICAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgICAgIGxpbmU6IFtcbiAgICAgICAgICAgICAgICBbMzAsIDMwXSxcbiAgICAgICAgICAgICAgICBbNDAsIDIwXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgaW5wdXQ6IGAoRFdJVEhJTihcImFueUdlb1wiLCBHRU9NRVRSWUNPTExFQ1RJT04oUE9JTlQoMTAgMjApKSwgMTAwMCwgbWV0ZXJzKSlgLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAgICAgICAgIHR5cGU6ICdHRU9NRVRSWScsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBtb2RlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgdHlwZTogJ1BPSU5UUkFESVVTJyxcbiAgICAgICAgICAgICAgbGF0OiAyMCxcbiAgICAgICAgICAgICAgbG9uOiAxMCxcbiAgICAgICAgICAgICAgcmFkaXVzOiAnMTAwMCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgKERXSVRISU4oXCJhbnlHZW9cIiwgR0VPTUVUUllDT0xMRUNUSU9OKEdFT01FVFJZQ09MTEVDVElPTihQT0xZR09OKCgxMCAyMCwgMTUgMTgsIDUgOSwgMTAgMjApKSksIExJTkVTVFJJTkcoMzAgMzAsIDQwIDIwKSksIDEwMDAsIG1ldGVycykpYCxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgICAgICAgICB0eXBlOiAnR0VPTUVUUlknLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgbW9kZTogJ3BvbHknLFxuICAgICAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgICAgIHBvbHlnb25CdWZmZXJXaWR0aDogJzEwMDAnLFxuICAgICAgICAgICAgICBwb2x5Z29uOiBbXG4gICAgICAgICAgICAgICAgWzEwLCAyMF0sXG4gICAgICAgICAgICAgICAgWzE1LCAxOF0sXG4gICAgICAgICAgICAgICAgWzUsIDldLFxuICAgICAgICAgICAgICAgIFsxMCwgMjBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5lZ2F0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgICAgICAgICAgdHlwZTogJ0dFT01FVFJZJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIG1vZGU6ICdsaW5lJyxcbiAgICAgICAgICAgICAgdHlwZTogJ0xJTkUnLFxuICAgICAgICAgICAgICBsaW5lV2lkdGg6ICcxMDAwJyxcbiAgICAgICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgICAgIFszMCwgMzBdLFxuICAgICAgICAgICAgICAgIFs0MCwgMjBdLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBuZWdhdGVkOiBmYWxzZSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbn1cblxuLyoqXG4gKiBTYW1lIGFzIGFib3ZlLCBidXQgdGhpcyBnb2VzIGJleW9uZCBqdXN0IHRlc3RpbmcgZnVuY3Rpb25zLCBpdCB0ZXN0cyB0aGUgYm9vbGVhbiBsb2dpY1xuICpcbiAqIFRoZSBkaWZmZXJlbnQgc2VjdGlvbiBpcyBmb3IgdGhpbmdzIHRoYXQgdGVjaG5pY2FsbHkgY2FuIGJlIHNpbXBsaWZpZWQgYnkgYm9vbGVhbiBsb2dpYy4gIER1ZSB0byBob3cgcmVjb25zdGl0dXRpb24gd29ya3MsIHV0aWxpemluZyBwb3N0Zml4LCB3ZSBhcmUgZm9yY2VkIHRvIHNpbXBsaWZ5LiAgSWYgd2UgZGlkbid0LCB0aGluZ3Mgd291bGQgZ2V0IHN1cGVyIG5lc3RlZCAobG9va3VwIHBvc3RmaXggbm90YXRpb24gZm9yIG1vcmUgb24gd2h5KS4gIFNvIGluIHNvbWUgY2FzZXMsIHdlIG1pZ2h0IHNpbXBsaWZ5IGJleW9uZCB0aGUgZXhwZWN0YXRpb24uICBUaGUgdHdvIHJlc3VsdHMgd2lsbCBoYXZlIHBhcml0eSB0aG91Z2ggc2luY2Ugd2UgZm9sbG93IGJvb2xlYW4gYWxnZWJyYSBydWxlcy5cbiAqL1xuY29uc3QgY3FsQm9vbGVhbkxvZ2ljU3RyaW5ncyA9IHtcbiAgc2FtZTogW1xuICAgIGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBBTkQgKFwiYW55VGV4dFwiIElMSUtFICcyJylgLFxuICAgIGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKWAsXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMicpKSlgLFxuICAgIGBOT1QgKChcImFueVRleHRcIiBJTElLRSAnJScpIEFORCAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSkpYCxcbiAgICBgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcxJykpKSBPUiAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSkpYCxcbiAgICBgTk9UICgoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSkpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMicpKSkpYCxcbiAgICBgTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSkpKWAsXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykpKWAsXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChOT1QgKChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykpKSkpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgQU5EIChcImFueVRleHRcIiBJTElLRSAnJykpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSlgLFxuICAgIGBOT1QgKChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSkpKWAsXG4gICAgYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSkpYCxcbiAgICBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpIEFORCAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSkpYCxcbiAgXSxcbiAgZGlmZmVyZW50OiBbXG4gICAge1xuICAgICAgaW5wdXQ6IGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoKFwiYW55VGV4dFwiIElMSUtFICcnKSlgLFxuICAgICAgb3V0cHV0OiBgKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKWAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SICgoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpKSkpYCxcbiAgICAgIG91dHB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnJykpKWAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykpYCxcbiAgICAgIG91dHB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKWAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSkpYCxcbiAgICAgIG91dHB1dDogYE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICcxJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcyJykgT1IgKFwiYW55VGV4dFwiIElMSUtFICcnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpKWAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpbnB1dDogYChcImFueVRleHRcIiBJTElLRSAnMScpIE9SIChcImFueVRleHRcIiBJTElLRSAnMicpIE9SICgoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgQU5EIChcImFueVRleHRcIiBJTElLRSAnJykpKWAsXG4gICAgICBvdXRwdXQ6IGAoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJzInKSBPUiAoXCJhbnlUZXh0XCIgSUxJS0UgJycpIE9SIChcImFueVRleHRcIiBJTElLRSAnJykgT1IgKChcImFueVRleHRcIiBJTElLRSAnJykgQU5EIChcImFueVRleHRcIiBJTElLRSAnJykpYCxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlucHV0OiBgTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJyUnKSBBTkQgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICc1JykgQU5EICgoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzEnKSkpIEFORCAoXCJhbnlUZXh0XCIgSUxJS0UgJzMnKSkgQU5EIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnNCcpKSkpKSlgLFxuICAgICAgb3V0cHV0OiBgTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJyUnKSBBTkQgKE5PVCAoKFwiYW55VGV4dFwiIElMSUtFICc1JykgQU5EIChOT1QgKChcImFueVRleHRcIiBJTElLRSAnMScpKSkgQU5EIChcImFueVRleHRcIiBJTElLRSAnMycpIEFORCAoTk9UICgoXCJhbnlUZXh0XCIgSUxJS0UgJzQnKSkpKSkpYCxcbiAgICB9LFxuICBdLFxufSBhcyB7XG4gIHNhbWU6IEFycmF5PHN0cmluZz5cbiAgZGlmZmVyZW50OiBBcnJheTx7IGlucHV0OiBzdHJpbmc7IG91dHB1dDogc3RyaW5nIH0+XG59XG5cbmRlc2NyaWJlKCdyZWFkICYgd3JpdGUgcGFyaXR5IGZvciBjYXBhYmlsaXRpZXMsIGFzIHdlbGwgYXMgYm9vbGVhbiBsb2dpYycsICgpID0+IHtcbiAgaXQoJ1RFU1QgR0VUIEdFTyBGSUxURVJTJywgKCkgPT4ge1xuICAgIGNvbnN0IHdrdCA9ICdHRU9NRVRSWUNPTExFQ1RJT04oUE9JTlQoNTAgNDApLCBMSU5FU1RSSU5HKDEwIDIwLCA0MCA1MCkpJ1xuICAgIGNxbC5nZXRHZW9GaWx0ZXJzKHdrdCwgJ2FueUdlbycsICcxMDAnKVxuICAgIGV4cGVjdCgndGVzdC12YWx1ZScsICdBZGRpbmcgYm9ndXMgZXhwZWN0YXRpb24uJykudG8uZXF1YWwoJ3Rlc3QtdmFsdWUnKVxuICB9KVxuXG4gIGl0KCdURVNUIExJTkVTVFJJTkcgRklMVEVSUycsICgpID0+IHtcbiAgICBjb25zdCB3a3QgPSAnTElORVNUUklORygxMCAyMCwgNDAgNTApJ1xuICAgIGNxbC5nZXRHZW9GaWx0ZXJzKHdrdCwgJ2FueUdlbycsICcxMDAnKVxuICAgIGV4cGVjdCgndGVzdC12YWx1ZScsICdBZGRpbmcgYm9ndXMgZXhwZWN0YXRpb24uJykudG8uZXF1YWwoJ3Rlc3QtdmFsdWUnKVxuICB9KVxuXG4gIGRlc2NyaWJlKCd0ZXN0IGFsbCBjYXBhYmlsaXRpZXMnLCAoKSA9PiB7XG4gICAgZm9yIChjb25zdCB0eXBlIGluIGNxbENhcGFiaWxpdHlTdHJpbmdzKSB7XG4gICAgICBjcWxDYXBhYmlsaXR5U3RyaW5nc1t0eXBlIGFzIENhcGFiaWxpdHlDYXRlZ29yaWVzVHlwZV0uZm9yRWFjaChcbiAgICAgICAgKGNhcGFiaWxpdHkpID0+IHtcbiAgICAgICAgICBpdChgJHtjYXBhYmlsaXR5fWAsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChjYXBhYmlsaXR5LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZXF1YWwoXG4gICAgICAgICAgICAgIGNxbC53cml0ZShjcWwucmVhZChjYXBhYmlsaXR5KSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApXG4gICAgfVxuICB9KVxuXG4gIGRlc2NyaWJlKCd0ZXN0IGFsbCBsb2dpYycsICgpID0+IHtcbiAgICBkZXNjcmliZSgnd2hlcmUgdGhpbmdzIHN0YXkgdGhlIHNhbWUgKGFscmVhZHkgc2ltcGxpZmllZCknLCAoKSA9PiB7XG4gICAgICBjcWxCb29sZWFuTG9naWNTdHJpbmdzWydzYW1lJ10uZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAgICAgaXQoYCR7aW5wdXR9YCwgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChpbnB1dCwgJ1VuZXhwZWN0ZWQgZmlsdGVyIHZhbHVlLicpLnRvLmVxdWFsKFxuICAgICAgICAgICAgY3FsLndyaXRlKGNxbC5yZWFkKGlucHV0KSlcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlcmUgdGhpbmdzIGRpZmZlciAodGhleSBnZXQgc2ltcGxpZmllZCknLCAoKSA9PiB7XG4gICAgICBjcWxCb29sZWFuTG9naWNTdHJpbmdzWydkaWZmZXJlbnQnXS5mb3JFYWNoKChpbnB1dE91dHB1dFBhaXIpID0+IHtcbiAgICAgICAgaXQoYCR7aW5wdXRPdXRwdXRQYWlyLmlucHV0fWAsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoaW5wdXRPdXRwdXRQYWlyLm91dHB1dCwgJ1VuZXhwZWN0ZWQgZmlsdGVyIHZhbHVlLicpLnRvLmVxdWFsKFxuICAgICAgICAgICAgY3FsLndyaXRlKGNxbC5yZWFkKGlucHV0T3V0cHV0UGFpci5pbnB1dCkpXG4gICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd0ZXN0IGNvcm5lciBjYXNlcyAvIHNwZWNpYWwnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IGhhbmRsZXMgZXNjYXBpbmcgXyBpbiBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBpZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gJzEyMTIzMTIzXzEyMzIxMzEyMydcbiAgICAgIGNvbnN0IG9yaWdpbmFsRmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICc9JyxcbiAgICAgICAgICAgIHByb3BlcnR5OiAndGl0bGUnLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgY29uc3QgY3FsVGV4dCA9IGNxbC53cml0ZShvcmlnaW5hbEZpbHRlcilcbiAgICAgIGNvbnN0IG5ld0ZpbHRlciA9IGNxbC5yZWFkKGNxbFRleHQpXG4gICAgICBjb25zdCBmaWx0ZXJUb0NoZWNrID0gbmV3RmlsdGVyLmZpbHRlcnNbMF0gYXMgRmlsdGVyQ2xhc3NcbiAgICAgIGV4cGVjdChjcWxUZXh0LCBgRG9lc24ndCBlc2NhcGUgcHJvcGVybHlgKS50by5lcXVhbChcbiAgICAgICAgJyhcInRpdGxlXCIgPSBcXCcxMjEyMzEyM1xcXFxfMTIzMjEzMTIzXFwnKSdcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXJUb0NoZWNrLnZhbHVlKS50by5lcXVhbCh2YWx1ZSlcbiAgICB9KVxuXG4gICAgaXQoJ2l0IGhhbmRsZXMgZXNjYXBpbmcgXyBpbiBwcm9wZXJ0aWVzIHRoYXQgYXJlIGlkJywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSAnMTIxMjMxMjNfMTIzMjEzMTIzJ1xuICAgICAgY29uc3Qgb3JpZ2luYWxGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJz0nLFxuICAgICAgICAgICAgcHJvcGVydHk6ICdpZCcsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBjcWxUZXh0ID0gY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKVxuICAgICAgY29uc3QgbmV3RmlsdGVyID0gY3FsLnJlYWQoY3FsVGV4dClcbiAgICAgIGNvbnN0IGZpbHRlclRvQ2hlY2sgPSBuZXdGaWx0ZXIuZmlsdGVyc1swXSBhcyBGaWx0ZXJDbGFzc1xuICAgICAgZXhwZWN0KGNxbC53cml0ZShvcmlnaW5hbEZpbHRlciksIGBEb2Vzbid0IGVzY2FwZSBwcm9wZXJseWApLnRvLmVxdWFsKFxuICAgICAgICAnKFwiaWRcIiA9IFxcJzEyMTIzMTIzXzEyMzIxMzEyM1xcJyknXG4gICAgICApXG4gICAgICBleHBlY3QoZmlsdGVyVG9DaGVjay52YWx1ZSkudG8uZXF1YWwodmFsdWUpXG4gICAgfSlcblxuICAgIGl0KCdpdCBoYW5kbGVzIGVzY2FwaW5nIF8gaW4gcHJvcGVydGllcyB0aGF0IGFyZSBcImlkXCIgKGRvdWJsZSB3cmFwcGVkISknLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9ICcxMjEyMzEyM18xMjMyMTMxMjMnXG4gICAgICBjb25zdCBvcmlnaW5hbEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICBwcm9wZXJ0eTogJ1wiaWRcIicsXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBjb25zdCBjcWxUZXh0ID0gY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKVxuICAgICAgY29uc3QgbmV3RmlsdGVyID0gY3FsLnJlYWQoY3FsVGV4dClcbiAgICAgIGNvbnN0IGZpbHRlclRvQ2hlY2sgPSBuZXdGaWx0ZXIuZmlsdGVyc1swXSBhcyBGaWx0ZXJDbGFzc1xuICAgICAgZXhwZWN0KGNxbC53cml0ZShvcmlnaW5hbEZpbHRlciksIGBEb2Vzbid0IGVzY2FwZSBwcm9wZXJseWApLnRvLmVxdWFsKFxuICAgICAgICAnKFwiaWRcIiA9IFxcJzEyMTIzMTIzXzEyMzIxMzEyM1xcJyknXG4gICAgICApXG4gICAgICBleHBlY3QoZmlsdGVyVG9DaGVjay52YWx1ZSkudG8uZXF1YWwodmFsdWUpXG4gICAgfSlcblxuICAgIGl0KGBpdCBoYW5kbGVzIGVzY2FwaW5nIF8gaW4gcHJvcGVydGllcyB0aGF0IGFyZSAnaWQnIChkb3VibGUgd3JhcHBlZCEpYCwgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSAnMTIxMjMxMjNfMTIzMjEzMTIzJ1xuICAgICAgY29uc3Qgb3JpZ2luYWxGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJz0nLFxuICAgICAgICAgICAgcHJvcGVydHk6IGAnaWQnYCxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGNvbnN0IGNxbFRleHQgPSBjcWwud3JpdGUob3JpZ2luYWxGaWx0ZXIpXG4gICAgICBjb25zdCBuZXdGaWx0ZXIgPSBjcWwucmVhZChjcWxUZXh0KVxuICAgICAgY29uc3QgZmlsdGVyVG9DaGVjayA9IG5ld0ZpbHRlci5maWx0ZXJzWzBdIGFzIEZpbHRlckNsYXNzXG4gICAgICBleHBlY3QoY3FsLndyaXRlKG9yaWdpbmFsRmlsdGVyKSwgYERvZXNuJ3QgZXNjYXBlIHByb3Blcmx5YCkudG8uZXF1YWwoXG4gICAgICAgICcoXCJpZFwiID0gXFwnMTIxMjMxMjNfMTIzMjEzMTIzXFwnKSdcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXJUb0NoZWNrLnZhbHVlKS50by5lcXVhbCh2YWx1ZSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdpbnZhbGlkIGZpbHRlcnMgZ2V0IHJlbW92ZWQnLCAoKSA9PiB7XG4gICAgaXQoJ2hhbmRsZXMgdHlwaWNhbCBhbnlEYXRlIHJlbW92YWwnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYW55RGF0ZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdCRUZPUkUnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChgKFxcXCJhbnlUZXh0XFxcIiBJTElLRSAnJScpYClcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgZW1wdHkgcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBbXSxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55VGV4dCcsXG4gICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChgKFxcXCJhbnlUZXh0XFxcIiBJTElLRSAnJScpYClcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgaW52YWxpZCB2YWx1ZXMgaW4gcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBbJ2JvZ3VzJ10sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBwcm9wZXJ0eTogJ2FueVRleHQnLFxuICAgICAgICAgICAgdmFsdWU6ICcqJyxcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHR5cGU6ICdPUicsXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoYChcXFwiYW55VGV4dFxcXCIgSUxJS0UgJyUnKWApXG4gICAgfSlcblxuICAgIGl0KCdoYW5kbGVzIGludmFsaWQgdmFsdWVzIG1peGVkIHdpdGggdmFsaWQgdmFsdWVzIGluIHJlc2VydmVkLmJhc2ljLWRhdGF0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuZXh0cmEgPSB7XG4gICAgICAgICAgZGF0YXR5cGVzOiBEYXRhdHlwZXNKU09OQ29uZmlnLFxuICAgICAgICB9XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBbJ2JvZ3VzJywgJ1BlcnNvbiddLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKCgoKFwiZGVzY3JpcHRpb25cIiBJTElLRSBcXCdwZXJzb25cXCcpKSkpIE9SIChcImFueVRleHRcIiBJTElLRSBcXCclXFwnKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2hhbmRsZXMgYW55RGF0ZSByZW1vdmFsJywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiAnYW55RGF0ZScsXG4gICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICB0eXBlOiAnQkVGT1JFJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgcHJvcGVydHk6ICdhbnlUZXh0JyxcbiAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKGAoXFxcImFueVRleHRcXFwiIElMSUtFICclJylgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Rlc3QgcmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLCAoKSA9PiB7XG4gICAgaXQoJ2RvZXMgaGFuZGxlIGEgc2ltcGxlIHJlc2VydmVkLmJhc2ljLWRhdGF0eXBlJywgKCkgPT4ge1xuICAgICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuZXh0cmEgPSB7XG4gICAgICAgICAgZGF0YXR5cGVzOiBEYXRhdHlwZXNKU09OQ29uZmlnLFxuICAgICAgICB9XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAncmVzZXJ2ZWQuYmFzaWMtZGF0YXR5cGUnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBbJ1BlcnNvbicsICdNaWxpdGFyeSddLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChcbiAgICAgICAgYCgoKChcImRlc2NyaXB0aW9uXCIgSUxJS0UgXFwncGVyc29uXFwnKSBPUiAoXCJkZXNjcmlwdGlvblwiIElMSUtFIFxcJ21pbGl0YXJ5XFwnKSkpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlIGEgbmVnYXRlZCByZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsICgpID0+IHtcbiAgICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKVxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmV4dHJhID0ge1xuICAgICAgICAgIGRhdGF0eXBlczogRGF0YXR5cGVzSlNPTkNvbmZpZyxcbiAgICAgICAgfVxuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgICAgICBuZWdhdGVkOiB0cnVlLFxuICAgICAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXNlcnZlZC5iYXNpYy1kYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdmFsdWU6IFsnUGVyc29uJywgJ01pbGl0YXJ5J10sXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB0eXBlOiAnT1InLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKE5PVCAoKCgoXCJkZXNjcmlwdGlvblwiIElMSUtFIFxcJ3BlcnNvblxcJykgT1IgKFwiZGVzY3JpcHRpb25cIiBJTElLRSBcXCdtaWxpdGFyeVxcJykpKSkpYFxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Rlc3QgYm9vbGVhbiBzZWFyY2gnLCAoKSA9PiB7XG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJyonKWAsXG4gICAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGV4dDogJ1wiKlwiJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGNxbC53cml0ZSh0ZXN0RmlsdGVyKSkudG8uZXF1YWwoYCgoYW55VGV4dCBJTElLRSAnKicpKWApXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIGhhbmRsZXMgYSBzaW1wbGUgYm9vbGVhbiBzZWFyY2ggMicsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKWAsXG4gICAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGV4dDogJ2RvZyBvciBjYXQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChcbiAgICAgICAgYCgoYW55VGV4dCBJTElLRSAnZG9nJykgb3IgKGFueVRleHQgSUxJS0UgJ2NhdCcpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCB0aGF0IGlzIGVtcHR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgdGVzdEZpbHRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICB0eXBlOiAnQk9PTEVBTl9URVhUX1NFQVJDSCcsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICBjcWw6IGBgLFxuICAgICAgICAgICAgICBlcnJvcjogZmFsc2UsXG4gICAgICAgICAgICAgIHRleHQ6ICcnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoY3FsLndyaXRlKHRlc3RGaWx0ZXIpKS50by5lcXVhbChgKChhbnlUZXh0IElMSUtFICcqJykpYClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCB3aXRoIG5vdCcsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgY3FsOiBgKGFueVRleHQgSUxJS0UgJ2RvZycpIG9yIChhbnlUZXh0IElMSUtFICdjYXQnKSBhbmQgKE5PVCAoKGFueVRleHQgSUxJS0UgJ2Zpc2gnKSkpYCxcbiAgICAgICAgICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKSlgXG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIGhhbmRsZXMgYSBzaW1wbGUgYm9vbGVhbiBzZWFyY2ggb3RoZXIgdGVybXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGV4dDogJ2RvZyBvciBjYXQgYW5kIG5vdCAoZmlzaCknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdPUicsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ01vdmluZyBJbWFnZScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWRhdGEtY29udGVudC10eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKSkgQU5EICgoXFxcImRhdGF0eXBlXFxcIiBJTElLRSAnTW92aW5nIEltYWdlJykgT1IgKFxcXCJtZXRhZGF0YS1jb250ZW50LXR5cGVcXFwiIElMSUtFICdNb3ZpbmcgSW1hZ2UnKSlgXG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdkb2VzIGhhbmRsZXMgYSBzaW1wbGUgYm9vbGVhbiBzZWFyY2ggb3RoZXIgdGVybXMgYW5kIG5lZ2F0aW9ucycsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgdGV4dDogJ2RvZyBvciBjYXQgYW5kIG5vdCAoZmlzaCknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdPUicsXG4gICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkYXRhdHlwZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ01vdmluZyBJbWFnZScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWRhdGEtY29udGVudC10eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKE5PVCAoKChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKSkpKSBBTkQgKChcXFwiZGF0YXR5cGVcXFwiIElMSUtFICdNb3ZpbmcgSW1hZ2UnKSBPUiAoXFxcIm1ldGFkYXRhLWNvbnRlbnQtdHlwZVxcXCIgSUxJS0UgJ01vdmluZyBJbWFnZScpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCBvdGhlciB0ZXJtcyB3aXRoIGludGVyc3BlcnNlZCBlcnJvcnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCB0ZXN0RmlsdGVyID0gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICdBTkQnLFxuICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RhdGF0eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICBjcWw6IGAoYW55VGV4dCBJTElLRSAnZG9nJykgb3IgKGFueVRleHQgSUxJS0UgJ2NhdCcpIGFuZCAoTk9UICgoYW55VGV4dCBJTElLRSAnZmlzaCcpKSlgLFxuICAgICAgICAgICAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdtZXRhZGF0YS1jb250ZW50LXR5cGUnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdNb3ZpbmcgSW1hZ2UnLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgKChcXFwiZGF0YXR5cGVcXFwiIElMSUtFICdNb3ZpbmcgSW1hZ2UnKSBPUiAoXFxcIm1ldGFkYXRhLWNvbnRlbnQtdHlwZVxcXCIgSUxJS0UgJ01vdmluZyBJbWFnZScpKWBcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2RvZXMgaGFuZGxlcyBhIHNpbXBsZSBib29sZWFuIHNlYXJjaCBvdGhlciB0ZXJtcyB3aXRoIGludGVyc3BlcnNlZCBlcnJvcnMgYW5kIG5lZ2F0aW9ucycsICgpID0+IHtcbiAgICAgIGNvbnN0IHRlc3RGaWx0ZXIgPSBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0FORCcsXG4gICAgICAgIG5lZ2F0ZWQ6IHRydWUsXG4gICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICAgICAgdHlwZTogJ09SJyxcbiAgICAgICAgICAgIGZpbHRlcnM6IFtcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RhdGF0eXBlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAnTW92aW5nIEltYWdlJyxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0JPT0xFQU5fVEVYVF9TRUFSQ0gnLFxuICAgICAgICAgICAgICAgIG5lZ2F0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIHRleHQ6ICdkb2cgb3IgY2F0IGFuZCBub3QgKGZpc2gpJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ21ldGFkYXRhLWNvbnRlbnQtdHlwZScsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ01vdmluZyBJbWFnZScsXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgbmVnYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHR5cGU6ICdCT09MRUFOX1RFWFRfU0VBUkNIJyxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgIGNxbDogYChhbnlUZXh0IElMSUtFICdkb2cnKSBvciAoYW55VGV4dCBJTElLRSAnY2F0JykgYW5kIChOT1QgKChhbnlUZXh0IElMSUtFICdmaXNoJykpKWAsXG4gICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICB0ZXh0OiAnZG9nIG9yIGNhdCBhbmQgbm90IChmaXNoKScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChjcWwud3JpdGUodGVzdEZpbHRlcikpLnRvLmVxdWFsKFxuICAgICAgICBgTk9UICgoKFwiZGF0YXR5cGVcIiBJTElLRSBcXCdNb3ZpbmcgSW1hZ2VcXCcpIE9SIChcIm1ldGFkYXRhLWNvbnRlbnQtdHlwZVwiIElMSUtFIFxcJ01vdmluZyBJbWFnZVxcJykpKWBcbiAgICAgIClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdtdWx0aXBvbHlnb24gY3FsIHN0cmluZyByZWFkIHRlc3QnLCAoKSA9PiB7XG4gICAgY3FsTXVsdGlwb2x5Z29uU3RyaW5ncy5nZW9tZXRyaWVzLmZvckVhY2goKGNhcGFiaWxpdHkpID0+IHtcbiAgICAgIGl0KGAke2NhcGFiaWxpdHl9YCwgKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQgPSBjcWwucmVhZChjYXBhYmlsaXR5LmlucHV0KVxuICAgICAgICBjb25zdCBmaWx0ZXJzQXJyYXk6IGFueVtdID0gW11cblxuICAgICAgICBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQuZmlsdGVycy5mb3JFYWNoKChmaWx0ZXIpID0+IHtcbiAgICAgICAgICBpZiAoZmlsdGVyIGluc3RhbmNlb2YgRmlsdGVyQ2xhc3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgaWQsIC4uLm5ld0ZpbHRlciB9ID0gZmlsdGVyXG4gICAgICAgICAgICBmaWx0ZXJzQXJyYXkucHVzaChuZXdGaWx0ZXIpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCB7IGlkLCAuLi5leHBlY3RlZE91dHB1dCB9ID0gZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0XG4gICAgICAgIGV4cGVjdGVkT3V0cHV0LmZpbHRlcnMgPSBmaWx0ZXJzQXJyYXlcbiAgICAgICAgZXhwZWN0KGV4cGVjdGVkT3V0cHV0LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZGVlcC5lcXVhbChcbiAgICAgICAgICBjYXBhYmlsaXR5Lm91dHB1dFxuICAgICAgICApXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3BvaW50IGFuZCBtdWx0aXBvaW50IGNxbCBzdHJpbmcgcmVhZCB0ZXN0JywgKCkgPT4ge1xuICAgIGNxbFBvaW50U3RyaW5ncy5nZW9tZXRyaWVzLmZvckVhY2goKGNhcGFiaWxpdHkpID0+IHtcbiAgICAgIGl0KGAke2NhcGFiaWxpdHl9YCwgKCkgPT4ge1xuICAgICAgICBjb25zdCBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQgPSBjcWwucmVhZChjYXBhYmlsaXR5LmlucHV0KVxuICAgICAgICBjb25zdCBmaWx0ZXJzQXJyYXk6IGFueVtdID0gW11cblxuICAgICAgICBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXQuZmlsdGVycy5mb3JFYWNoKChmaWx0ZXIpID0+IHtcbiAgICAgICAgICBjb25zdCB7IGlkLCAuLi5uZXdGaWx0ZXIgfSA9IGZpbHRlclxuICAgICAgICAgIGZpbHRlcnNBcnJheS5wdXNoKG5ld0ZpbHRlcilcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgeyBpZCwgLi4uZXhwZWN0ZWRPdXRwdXQgfSA9IGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dFxuICAgICAgICBleHBlY3RlZE91dHB1dC5maWx0ZXJzID0gZmlsdGVyc0FycmF5XG4gICAgICAgIGV4cGVjdChleHBlY3RlZE91dHB1dCwgJ1VuZXhwZWN0ZWQgZmlsdGVyIHZhbHVlLicpLnRvLmRlZXAuZXF1YWwoXG4gICAgICAgICAgY2FwYWJpbGl0eS5vdXRwdXRcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdsaW5lc3RyaW5nIGFuZCBtdWx0aWxpbmVzdHJpbmcgY3FsIHN0cmluZyByZWFkIHRlc3QnLCAoKSA9PiB7XG4gICAgY3FsTGluZXN0cmluZ3MuZ2VvbWV0cmllcy5mb3JFYWNoKChjYXBhYmlsaXR5KSA9PiB7XG4gICAgICBpdChgJHtjYXBhYmlsaXR5fWAsICgpID0+IHtcbiAgICAgICAgY29uc3QgZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0ID0gY3FsLnJlYWQoY2FwYWJpbGl0eS5pbnB1dClcbiAgICAgICAgY29uc3QgZmlsdGVyc0FycmF5OiBhbnlbXSA9IFtdXG5cbiAgICAgICAgZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0LmZpbHRlcnMuZm9yRWFjaCgoZmlsdGVyKSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBpZCwgLi4ubmV3RmlsdGVyIH0gPSBmaWx0ZXJcbiAgICAgICAgICBmaWx0ZXJzQXJyYXkucHVzaChuZXdGaWx0ZXIpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHsgaWQsIC4uLmV4cGVjdGVkT3V0cHV0IH0gPSBmaWx0ZXJCdWlsZGVyQ2xhc3NPdXRwdXRcbiAgICAgICAgZXhwZWN0ZWRPdXRwdXQuZmlsdGVycyA9IGZpbHRlcnNBcnJheVxuICAgICAgICBleHBlY3QoZXhwZWN0ZWRPdXRwdXQsICdVbmV4cGVjdGVkIGZpbHRlciB2YWx1ZS4nKS50by5kZWVwLmVxdWFsKFxuICAgICAgICAgIGNhcGFiaWxpdHkub3V0cHV0XG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2VvbWV0cnkgY29sbGVjdGlvbiBjcWwgc3RyaW5nIHJlYWQgdGVzdCcsICgpID0+IHtcbiAgICBjcWxHZW9tZXRyeUNvbGxlY3Rpb25zLmdlb21ldHJpZXMuZm9yRWFjaCgoY2FwYWJpbGl0eSkgPT4ge1xuICAgICAgaXQoYCR7Y2FwYWJpbGl0eX1gLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dCA9IGNxbC5yZWFkKGNhcGFiaWxpdHkuaW5wdXQpXG4gICAgICAgIGNvbnN0IGZpbHRlcnNBcnJheTogYW55W10gPSBbXVxuXG4gICAgICAgIGZpbHRlckJ1aWxkZXJDbGFzc091dHB1dC5maWx0ZXJzLmZvckVhY2goKGZpbHRlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgaWQsIC4uLm5ld0ZpbHRlciB9ID0gZmlsdGVyXG4gICAgICAgICAgZmlsdGVyc0FycmF5LnB1c2gobmV3RmlsdGVyKVxuICAgICAgICB9KVxuICAgICAgICBjb25zdCB7IGlkLCAuLi5leHBlY3RlZE91dHB1dCB9ID0gZmlsdGVyQnVpbGRlckNsYXNzT3V0cHV0XG4gICAgICAgIGV4cGVjdGVkT3V0cHV0LmZpbHRlcnMgPSBmaWx0ZXJzQXJyYXlcbiAgICAgICAgZXhwZWN0KGV4cGVjdGVkT3V0cHV0LCAnVW5leHBlY3RlZCBmaWx0ZXIgdmFsdWUuJykudG8uZGVlcC5lcXVhbChcbiAgICAgICAgICBjYXBhYmlsaXR5Lm91dHB1dFxuICAgICAgICApXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19