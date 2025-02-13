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
import { getConstrainedNextPageForSourceGroup, getIndexOfLastResultForSourceGroup, getConstrainedPreviousPageForSourceGroup, getConstrainedFinalPageForSourceGroup, getCurrentStartAndEndForSourceGroup, } from './Query.methods';
// Helper function to run a test case
function runTest(description, method, input, expectedOutput) {
    it(description, function (done) {
        expect(JSON.stringify(method(input))).to.equal(JSON.stringify(expectedOutput));
        done();
    });
}
var CasesToTest = [
    // non local sources only
    {
        caseDescription: 'for single non local source without queryStatus',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {},
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { Geoserver: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single non local source with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: { Geoserver: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 2 },
            indexOfLastResultForSourceGroup: { Geoserver: 100 },
            constrainedPreviousPageForSourceGroup: { Geoserver: 1 },
            constrainedFinalPageForSourceGroup: { Geoserver: 100 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for single non local source with queryStatus, at end of results',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: { Geoserver: 100 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 100 },
            indexOfLastResultForSourceGroup: { Geoserver: 100 },
            constrainedPreviousPageForSourceGroup: { Geoserver: 99 },
            constrainedFinalPageForSourceGroup: { Geoserver: 100 },
            currentStartAndEndForSourceGroup: {
                start: 100,
                end: 100,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources only, with no queryStatus',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {},
            isLocal: function () { return false; },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 2,
                Geoserver2: 2,
                Geoserver3: 2,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 110,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus mixed between already ended and not yet ended results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 105,
                Geoserver3: 105,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 106,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 104,
                Geoserver3: 104,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 110,
            },
            currentStartAndEndForSourceGroup: {
                start: 310,
                end: 311,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus at end of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 110,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 110,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 110,
            },
            currentStartAndEndForSourceGroup: {
                start: 315,
                end: 315,
                hits: 315,
            },
        },
    },
    // non local sources, count of 3
    {
        caseDescription: 'for single non local source without queryStatus, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {},
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { Geoserver: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single non local source with queryStatus at beginning of results, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: { Geoserver: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 4 },
            indexOfLastResultForSourceGroup: { Geoserver: 100 },
            constrainedPreviousPageForSourceGroup: { Geoserver: 1 },
            constrainedFinalPageForSourceGroup: { Geoserver: 100 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for single non local source with queryStatus, at end of results, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: { Geoserver: 100 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 100 },
            indexOfLastResultForSourceGroup: { Geoserver: 100 },
            constrainedPreviousPageForSourceGroup: { Geoserver: 97 },
            constrainedFinalPageForSourceGroup: { Geoserver: 100 },
            currentStartAndEndForSourceGroup: {
                start: 100,
                end: 100,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources only, with no queryStatus, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {},
            isLocal: function () { return false; },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus at beginning of results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 3,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 4,
                Geoserver2: 4,
                Geoserver3: 4,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 1,
                Geoserver2: 1,
                Geoserver3: 1,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 9,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus mixed between already ended and not yet ended results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 3,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 103,
                Geoserver3: 103,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 106,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 100,
                Geoserver3: 100,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            currentStartAndEndForSourceGroup: {
                start: 306,
                end: 311,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple non local sources with queryStatus at end of results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 2,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            indexOfLastResultForSourceGroup: {
                Geoserver1: 100,
                Geoserver2: 105,
                Geoserver3: 110,
            },
            constrainedPreviousPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 106,
            },
            constrainedFinalPageForSourceGroup: {
                Geoserver1: 101,
                Geoserver2: 106,
                Geoserver3: 109,
            },
            currentStartAndEndForSourceGroup: {
                start: 314,
                end: 315,
                hits: 315,
            },
        },
    },
    //  only local sources
    {
        caseDescription: 'for single local source without queryStatus',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { local: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single local source with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: { local: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 2 },
            indexOfLastResultForSourceGroup: { local: 100 },
            constrainedPreviousPageForSourceGroup: { local: 1 },
            constrainedFinalPageForSourceGroup: { local: 100 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for single local source with queryStatus, at end of results',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: { local: 100 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 100 },
            indexOfLastResultForSourceGroup: { local: 100 },
            constrainedPreviousPageForSourceGroup: { local: 99 },
            constrainedFinalPageForSourceGroup: { local: 100 },
            currentStartAndEndForSourceGroup: {
                start: 100,
                end: 100,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources only, with no queryStatus',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                local: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 2,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 315,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus mixed between already ended and not yet ended results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 105,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 106,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 104,
            },
            constrainedFinalPageForSourceGroup: {
                local: 315,
            },
            currentStartAndEndForSourceGroup: {
                start: 105,
                end: 105,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus at end of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 315,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 315,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 314,
            },
            constrainedFinalPageForSourceGroup: {
                local: 315,
            },
            currentStartAndEndForSourceGroup: {
                start: 315,
                end: 315,
                hits: 315,
            },
        },
    },
    // only local sources, count of 3
    {
        caseDescription: 'for single local source without queryStatus, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { local: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single local source with queryStatus at beginning of results, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: { local: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 4 },
            indexOfLastResultForSourceGroup: { local: 100 },
            constrainedPreviousPageForSourceGroup: { local: 1 },
            constrainedFinalPageForSourceGroup: { local: 100 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for single local source with queryStatus, at end of results, with count of 3',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: { local: 100 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 100 },
            indexOfLastResultForSourceGroup: { local: 100 },
            constrainedPreviousPageForSourceGroup: { local: 97 },
            constrainedFinalPageForSourceGroup: { local: 100 },
            currentStartAndEndForSourceGroup: {
                start: 100,
                end: 100,
                hits: 100,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources only, with no queryStatus, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                local: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus at beginning of results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 4,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 313,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus mixed between already ended and not yet ended results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 103,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 106,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 100,
            },
            constrainedFinalPageForSourceGroup: {
                local: 313,
            },
            currentStartAndEndForSourceGroup: {
                start: 103,
                end: 105,
                hits: 315,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources with queryStatus at end of results, with count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id); },
            currentIndexForSourceGroup: {
                local: 313,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 313,
            },
            indexOfLastResultForSourceGroup: {
                local: 315,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 310,
            },
            constrainedFinalPageForSourceGroup: {
                local: 313,
            },
            currentStartAndEndForSourceGroup: {
                start: 313,
                end: 315,
                hits: 315,
            },
        },
    },
    // now let's do a mix of both local and non local sources
    {
        caseDescription: 'for single local source and single non local source without queryStatus',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single local source and single non local source with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 2, Geoserver2: 2 },
            indexOfLastResultForSourceGroup: { local: 100, Geoserver2: 105 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 101, Geoserver2: 105 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 2,
                hits: 205,
            },
        },
    },
    {
        caseDescription: 'for single local source and single non local source with queryStatus, at end of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 101, Geoserver2: 105 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 101, Geoserver2: 105 },
            indexOfLastResultForSourceGroup: { local: 100, Geoserver2: 105 },
            constrainedPreviousPageForSourceGroup: { local: 101, Geoserver2: 104 },
            constrainedFinalPageForSourceGroup: { local: 101, Geoserver2: 105 },
            currentStartAndEndForSourceGroup: {
                start: 205,
                end: 205,
                hits: 205,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources without queryStatus',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at beginning of results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 1,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 2,
                Geoserver3: 2,
                Geoserver4: 2,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 430,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 1,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 111,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 112,
            },
            indexOfLastResultForSourceGroup: {
                local: 40,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 41,
                Geoserver3: 110,
                Geoserver4: 110,
            },
            constrainedFinalPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            currentStartAndEndForSourceGroup: {
                start: 261,
                end: 261,
                hits: 265,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 1,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            indexOfLastResultForSourceGroup: {
                local: 40,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 114,
            },
            constrainedFinalPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            currentStartAndEndForSourceGroup: {
                start: 265,
                end: 265,
                hits: 265,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 116,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 117,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 115,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 341,
                end: 341,
                hits: 430,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 204,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 430,
                end: 430,
                hits: 430,
            },
        },
    },
    // now let's do a mix of both local and non local sources with a count of 3
    {
        caseDescription: 'for single local source and single non local source without queryStatus, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single local source and single non local source with queryStatus at beginning of results, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 3,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 4, Geoserver2: 4 },
            indexOfLastResultForSourceGroup: { local: 100, Geoserver2: 105 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 101, Geoserver2: 103 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 6,
                hits: 205,
            },
        },
    },
    {
        caseDescription: 'for single local source and single non local source with queryStatus, at end of results, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 3,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 101, Geoserver2: 103 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 101, Geoserver2: 103 },
            indexOfLastResultForSourceGroup: { local: 100, Geoserver2: 105 },
            constrainedPreviousPageForSourceGroup: { local: 100, Geoserver2: 100 },
            constrainedFinalPageForSourceGroup: { local: 101, Geoserver2: 103 },
            currentStartAndEndForSourceGroup: {
                start: 203,
                end: 205,
                hits: 205,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources without queryStatus, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {},
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {},
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {},
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {},
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 3,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 4,
                Geoserver3: 4,
                Geoserver4: 4,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 9,
                hits: 430,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 3,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 112,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            indexOfLastResultForSourceGroup: {
                local: 40,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 41,
                Geoserver3: 109,
                Geoserver4: 109,
            },
            constrainedFinalPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            currentStartAndEndForSourceGroup: {
                start: 262,
                end: 264,
                hits: 265,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 20,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 1,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            indexOfLastResultForSourceGroup: {
                local: 40,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 112,
            },
            constrainedFinalPageForSourceGroup: {
                local: 41,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            currentStartAndEndForSourceGroup: {
                start: 265,
                end: 265,
                hits: 265,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 2,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 1,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 115,
                Geoserver3: 111,
                Geoserver4: 115,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 118,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 112,
                Geoserver3: 111,
                Geoserver4: 112,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 340,
                end: 343,
                hits: 430,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end, with a count of 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 105,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 115,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            indexOfLastResultForSourceGroup: {
                local: 205,
                Geoserver3: 110,
                Geoserver4: 115,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 202,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            constrainedFinalPageForSourceGroup: {
                local: 205,
                Geoserver3: 111,
                Geoserver4: 116,
            },
            currentStartAndEndForSourceGroup: {
                start: 430,
                end: 430,
                hits: 430,
            },
        },
    },
    // now let's test when the number of hits is 0 for certain sources
    {
        caseDescription: 'for single non local source with queryStatus at beginning of results with 0 hits',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['local'].includes(id); },
            currentIndexForSourceGroup: { Geoserver: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { Geoserver: 1 },
            indexOfLastResultForSourceGroup: { Geoserver: 0 },
            constrainedPreviousPageForSourceGroup: { Geoserver: 1 },
            constrainedFinalPageForSourceGroup: { Geoserver: 1 },
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for single local source with queryStatus at beginning of results with 0 hits',
        caseData: {
            sources: ['Geoserver'],
            queryStatus: {
                Geoserver: {
                    id: 'Geoserver',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver'].includes(id); },
            currentIndexForSourceGroup: { local: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1 },
            indexOfLastResultForSourceGroup: { local: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1 },
            constrainedFinalPageForSourceGroup: { local: 1 },
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results with 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having no hits and non local having hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 2 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 10 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 10 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at end of results, with local having no hits and non local having hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 10 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 10 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 10 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 9 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 10 },
            currentStartAndEndForSourceGroup: {
                start: 10,
                end: 10,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 2, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 2, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 1,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at end of results, with local having hits and non local having no hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 10, Geoserver2: 1 },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 10, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 9, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 10,
                end: 10,
                hits: 10,
            },
        },
    },
    // now let's test when the number of hits is 0 for certain sources with a count of 3
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results with 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 0,
                end: 0,
                hits: 0,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having no hits and non local having hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 3,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 4 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 10 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 10 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at end of results, with local having no hits and non local having hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 10 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 1, Geoserver2: 10 },
            indexOfLastResultForSourceGroup: { local: 0, Geoserver2: 10 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 7 },
            constrainedFinalPageForSourceGroup: { local: 1, Geoserver2: 10 },
            currentStartAndEndForSourceGroup: {
                start: 10,
                end: 10,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 4, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 1, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 4, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 1, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 3,
                hits: 10,
            },
        },
    },
    {
        caseDescription: 'for a local source and non local source with queryStatus at end of results, with local having hits and non local having no hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 10,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1'].includes(id); },
            currentIndexForSourceGroup: { local: 10, Geoserver2: 1 },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: { local: 10, Geoserver2: 1 },
            indexOfLastResultForSourceGroup: { local: 10, Geoserver2: 0 },
            constrainedPreviousPageForSourceGroup: { local: 7, Geoserver2: 1 },
            constrainedFinalPageForSourceGroup: { local: 10, Geoserver2: 1 },
            currentStartAndEndForSourceGroup: {
                start: 10,
                end: 10,
                hits: 10,
            },
        },
    },
    // now let's do multiple sources for each type with some having 0 hits
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with one of each source type having 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 2,
                Geoserver3: 2,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 110,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 2,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results with one of each source type having 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 101,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 101,
                Geoserver3: 102,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 100,
                Geoserver3: 100,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 110,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 201,
                end: 201,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end with one of each source type having 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 101,
                Geoserver3: 110,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 101,
                Geoserver3: 110,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 110,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 210,
                end: 210,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results with one of each source type having 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 101,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 102,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 110,
                Geoserver3: 100,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 100,
                Geoserver3: 100,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 110,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 201,
                end: 201,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end with one of each source type having 0 hits',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 1,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 110,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            count: 1,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 110,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 110,
                Geoserver3: 100,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 109,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 110,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 210,
                end: 210,
                hits: 210,
            },
        },
    },
    // now let's do multiple sources for each type with some having 0 hits with a count of 3
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with one of each source type having 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 4,
                Geoserver3: 4,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 1,
                Geoserver3: 1,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 1,
                end: 6,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results with one of each source type having 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 101,
                Geoserver3: 103,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 101,
                Geoserver3: 106,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 100,
                Geoserver3: 100,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 203,
                end: 205,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end with one of each source type having 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 2,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 100,
                Geoserver3: 110,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 101,
                Geoserver3: 106,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 101,
                Geoserver3: 109,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 209,
                end: 210,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results with one of each source type having 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 3,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 103,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 106,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 110,
                Geoserver3: 100,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 100,
                Geoserver3: 100,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 109,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 203,
                end: 205,
                hits: 210,
            },
        },
    },
    {
        caseDescription: 'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end with one of each source type having 0 hits with count 3',
        caseData: {
            sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
            queryStatus: {
                Geoserver1: {
                    id: 'Geoserver1',
                    count: 2,
                    hasReturned: true,
                    hits: 110,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver2: {
                    id: 'Geoserver2',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver3: {
                    id: 'Geoserver3',
                    count: 0,
                    hasReturned: true,
                    hits: 100,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
                Geoserver4: {
                    id: 'Geoserver4',
                    count: 0,
                    hasReturned: true,
                    hits: 0,
                    elapsed: 500,
                    successful: true,
                    warnings: [],
                },
            },
            isLocal: function (id) { return ['Geoserver1', 'Geoserver2'].includes(id); },
            currentIndexForSourceGroup: {
                local: 109,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            count: 3,
        },
        caseReturns: {
            constrainedNextPageForSourceGroup: {
                local: 109,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            indexOfLastResultForSourceGroup: {
                local: 110,
                Geoserver3: 100,
                Geoserver4: 0,
            },
            constrainedPreviousPageForSourceGroup: {
                local: 106,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            constrainedFinalPageForSourceGroup: {
                local: 109,
                Geoserver3: 101,
                Geoserver4: 1,
            },
            currentStartAndEndForSourceGroup: {
                start: 209,
                end: 210,
                hits: 210,
            },
        },
    },
];
// this will verify that you've set up the test case data correctly, otherwise tests will fail for reasons outside of actual method issues, like returning wrong counts in sources
function verifyCaseData(caseData, caseDescription) {
    var queryStatus = caseData.queryStatus, currentIndexForSourceGroup = caseData.currentIndexForSourceGroup, count = caseData.count, isLocal = caseData.isLocal;
    Object.values(queryStatus).forEach(function (status) {
        if (isLocal(status.id)) {
            return; // we verify this separately
        }
        var currentIndex = currentIndexForSourceGroup[status.id];
        var correctCount = 0;
        if (currentIndex <= status.hits) {
            correctCount = Math.min(count, status.hits - currentIndex + 1);
        }
        // based of currentIndex and hits, we can decide if the count on the status is correct
        if (status.count !== correctCount) {
            it("".concat(caseDescription, " status count is incorrect for ").concat(status.id, ", expected ").concat(correctCount, ", got ").concat(status.count), function () {
                expect(status.count).to.equal(correctCount);
            });
        }
    });
    if (Object.values(queryStatus).length > 0) {
        var localStatuses = Object.values(queryStatus).filter(function (status) {
            return isLocal(status.id);
        });
        if (localStatuses.length > 0) {
            var currentLocalIndex = currentIndexForSourceGroup['local'];
            var totalLocalHits = localStatuses.reduce(function (acc, status) { return acc + status.hits; }, 0);
            var totalLocalCount_1 = localStatuses.reduce(function (acc, status) { return acc + status.count; }, 0);
            var correctCount_1 = 0;
            if (currentLocalIndex <= totalLocalHits) {
                correctCount_1 = Math.min(count, totalLocalHits - currentLocalIndex + 1);
            }
            if (totalLocalCount_1 !== correctCount_1) {
                it("".concat(caseDescription, " local status count is incorrect, expected ").concat(correctCount_1, ", got ").concat(totalLocalCount_1), function () {
                    expect(totalLocalCount_1).to.equal(correctCount_1);
                });
            }
        }
    }
}
describe('exercise various edge cases for searches involving sources and paging', function () {
    CasesToTest.forEach(function (testCase) {
        var caseDescription = testCase.caseDescription, caseData = testCase.caseData, caseReturns = testCase.caseReturns;
        if (!caseReturns) {
            return;
        }
        // first verify that the status of the case test data is not in an inconsistent state
        verifyCaseData(caseData, caseDescription);
        if (caseReturns.constrainedNextPageForSourceGroup) {
            runTest("calculates next index ".concat(caseDescription), getConstrainedNextPageForSourceGroup, caseData, caseReturns.constrainedNextPageForSourceGroup);
        }
        if (caseReturns.indexOfLastResultForSourceGroup) {
            runTest("calculates index of last result ".concat(caseDescription), getIndexOfLastResultForSourceGroup, caseData, caseReturns.indexOfLastResultForSourceGroup);
        }
        if (caseReturns.constrainedPreviousPageForSourceGroup) {
            runTest("calculates previous page ".concat(caseDescription), getConstrainedPreviousPageForSourceGroup, caseData, caseReturns.constrainedPreviousPageForSourceGroup);
        }
        if (caseReturns.constrainedFinalPageForSourceGroup) {
            runTest("calculates final page ".concat(caseDescription), getConstrainedFinalPageForSourceGroup, caseData, caseReturns.constrainedFinalPageForSourceGroup);
        }
        if (caseReturns.currentStartAndEndForSourceGroup) {
            runTest("calculates current start and end ".concat(caseDescription), getCurrentStartAndEndForSourceGroup, caseData, caseReturns.currentStartAndEndForSourceGroup);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeS5zcGVjLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUU3QixPQUFPLEVBQ0wsb0NBQW9DLEVBQ3BDLGtDQUFrQyxFQUNsQyx3Q0FBd0MsRUFDeEMscUNBQXFDLEVBQ3JDLG1DQUFtQyxHQUNwQyxNQUFNLGlCQUFpQixDQUFBO0FBRXhCLHFDQUFxQztBQUNyQyxTQUFTLE9BQU8sQ0FDZCxXQUFtQixFQUNuQixNQUF1QixFQUN2QixLQUFRLEVBQ1IsY0FBaUI7SUFFakIsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLElBQUk7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUMvQixDQUFBO1FBQ0QsSUFBSSxFQUFFLENBQUE7SUFDUixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUE4QkQsSUFBTSxXQUFXLEdBQW1DO0lBQ2xELHlCQUF5QjtJQUN6QjtRQUNFLGVBQWUsRUFBRSxpREFBaUQ7UUFDbEUsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLFdBQVcsRUFBRSxFQUFFO1lBQ2YsT0FBTyxFQUFFLFVBQUMsRUFBRSxJQUFLLE9BQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCO1lBQ3ZDLDBCQUEwQixFQUFFLEVBQUU7WUFDOUIsS0FBSyxFQUFFLENBQUM7U0FDVDtRQUNELFdBQVcsRUFBRTtZQUNYLGlDQUFpQyxFQUFFLEVB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O1FBQ3JGLGNBQWMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUE7UUFFekMsSUFBSSxXQUFXLENBQUMsaUNBQWlDLEVBQUU7WUFDakQsT0FBTyxDQUNMLGdDQUF5QixlQUFlLENBQUUsRUFDMUMsb0NBQW9DLEVBQ3BDLFFBQVEsRUFDUixXQUFXLENBQUMsaUNBQWlDLENBQzlDLENBQUE7U0FDRjtRQUVELElBQUksV0FBVyxDQUFDLCtCQUErQixFQUFFO1lBQy9DLE9BQU8sQ0FDTCwwQ0FBbUMsZUFBZSxDQUFFLEVBQ3BELGtDQUFrQyxFQUNsQyxRQUFRLEVBQ1IsV0FBVyxDQUFDLCtCQUErQixDQUM1QyxDQUFBO1NBQ0Y7UUFFRCxJQUFJLFdBQVcsQ0FBQyxxQ0FBcUMsRUFBRTtZQUNyRCxPQUFPLENBQ0wsbUNBQTRCLGVBQWUsQ0FBRSxFQUM3Qyx3Q0FBd0MsRUFDeEMsUUFBUSxFQUNSLFdBQVcsQ0FBQyxxQ0FBcUMsQ0FDbEQsQ0FBQTtTQUNGO1FBRUQsSUFBSSxXQUFXLENBQUMsa0NBQWtDLEVBQUU7WUFDbEQsT0FBTyxDQUNMLGdDQUF5QixlQUFlLENBQUUsRUFDMUMscUNBQXFDLEVBQ3JDLFFBQVEsRUFDUixXQUFXLENBQUMsa0NBQWtDLENBQy9DLENBQUE7U0FDRjtRQUVELElBQUksV0FBVyxDQUFDLGdDQUFnQyxFQUFFO1lBQ2hELE9BQU8sQ0FDTCwyQ0FBb0MsZUFBZSxDQUFFLEVBQ3JELG1DQUFtQyxFQUNuQyxRQUFRLEVBQ1IsV0FBVyxDQUFDLGdDQUFnQyxDQUM3QyxDQUFBO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuXG5pbXBvcnQge1xuICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldEluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXAsXG4gIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldENvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXAsXG4gIGdldEN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwLFxufSBmcm9tICcuL1F1ZXJ5Lm1ldGhvZHMnXG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBydW4gYSB0ZXN0IGNhc2VcbmZ1bmN0aW9uIHJ1blRlc3Q8VCwgVT4oXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcsXG4gIG1ldGhvZDogKGlucHV0OiBUKSA9PiBVLFxuICBpbnB1dDogVCxcbiAgZXhwZWN0ZWRPdXRwdXQ6IFVcbikge1xuICBpdChkZXNjcmlwdGlvbiwgKGRvbmUpID0+IHtcbiAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkobWV0aG9kKGlucHV0KSkpLnRvLmVxdWFsKFxuICAgICAgSlNPTi5zdHJpbmdpZnkoZXhwZWN0ZWRPdXRwdXQpXG4gICAgKVxuICAgIGRvbmUoKVxuICB9KVxufVxuXG50eXBlIENhc2VEYXRhVHlwZSA9IFBhcmFtZXRlcnM8dHlwZW9mIGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cD5bMF0gJlxuICBQYXJhbWV0ZXJzPHR5cGVvZiBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwPlswXSAmXG4gIFBhcmFtZXRlcnM8dHlwZW9mIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA+WzBdICZcbiAgUGFyYW1ldGVyczx0eXBlb2YgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cD5bMF0gJlxuICBQYXJhbWV0ZXJzPHR5cGVvZiBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cD5bMF1cblxudHlwZSBOZWNjZXNzYXJ5UGFyYW1ldGVyc0ZvclRlc3RzID0ge1xuICBjYXNlRGVzY3JpcHRpb246IHN0cmluZ1xuICBjYXNlRGF0YTogQ2FzZURhdGFUeXBlXG4gIGNhc2VSZXR1cm5zPzoge1xuICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cD86IFJldHVyblR5cGU8XG4gICAgICB0eXBlb2YgZ2V0Q29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwXG4gICAgPlxuICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA/OiBSZXR1cm5UeXBlPFxuICAgICAgdHlwZW9mIGdldEluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXBcbiAgICA+XG4gICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cD86IFJldHVyblR5cGU8XG4gICAgICB0eXBlb2YgZ2V0Q29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cFxuICAgID5cbiAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwPzogUmV0dXJuVHlwZTxcbiAgICAgIHR5cGVvZiBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwXG4gICAgPlxuICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwPzogUmV0dXJuVHlwZTxcbiAgICAgIHR5cGVvZiBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cFxuICAgID5cbiAgfVxufVxuXG5jb25zdCBDYXNlc1RvVGVzdDogTmVjY2Vzc2FyeVBhcmFtZXRlcnNGb3JUZXN0c1tdID0gW1xuICAvLyBub24gbG9jYWwgc291cmNlcyBvbmx5XG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246ICdmb3Igc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aG91dCBxdWVyeVN0YXR1cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAyIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMSxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzLCBhdCBlbmQgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogOTkgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxMDAsXG4gICAgICAgIGVuZDogMTAwLFxuICAgICAgICBoaXRzOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246ICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgb25seSwgd2l0aCBubyBxdWVyeVN0YXR1cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6ICgpID0+IGZhbHNlLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAyLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAyLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDMsXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGFscmVhZHkgZW5kZWQgYW5kIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwNSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwNixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA0LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMzEwLFxuICAgICAgICBlbmQ6IDMxMSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzMTUsXG4gICAgICAgIGVuZDogMzE1LFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIG5vbiBsb2NhbCBzb3VyY2VzLCBjb3VudCBvZiAzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGhvdXQgcXVlcnlTdGF0dXMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDQgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMsIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDk3IH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAwLFxuICAgICAgICBlbmQ6IDEwMCxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyBvbmx5LCB3aXRoIG5vIHF1ZXJ5U3RhdHVzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoKSA9PiBmYWxzZSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiA0LFxuICAgICAgICBHZW9zZXJ2ZXIyOiA0LFxuICAgICAgICBHZW9zZXJ2ZXIzOiA0LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDksXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGFscmVhZHkgZW5kZWQgYW5kIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwMyxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAzLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTA2LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzMDYsXG4gICAgICAgIGVuZDogMzExLFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAyLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTA2LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMzE0LFxuICAgICAgICBlbmQ6IDMxNSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyAgb25seSBsb2NhbCBzb3VyY2VzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246ICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSB3aXRob3V0IHF1ZXJ5U3RhdHVzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlciddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDIgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAxLFxuICAgICAgICBoaXRzOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cywgYXQgZW5kIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlciddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDk5IH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxMDAsXG4gICAgICAgIGVuZDogMTAwLFxuICAgICAgICBoaXRzOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246ICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBvbmx5LCB3aXRoIG5vIHF1ZXJ5U3RhdHVzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAxLFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGFscmVhZHkgZW5kZWQgYW5kIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwNSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwNixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA0LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTA1LFxuICAgICAgICBlbmQ6IDEwNSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDMxNSxcbiAgICAgICAgZW5kOiAzMTUsXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gb25seSBsb2NhbCBzb3VyY2VzLCBjb3VudCBvZiAzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2Ugd2l0aG91dCBxdWVyeVN0YXR1cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogNCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDMsXG4gICAgICAgIGhpdHM6IDEwMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzLCBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA5NyB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAwLFxuICAgICAgICBlbmQ6IDEwMCxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIG9ubHksIHdpdGggbm8gcXVlcnlTdGF0dXMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxMyxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGFscmVhZHkgZW5kZWQgYW5kIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAzLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA2LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzEzLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxMDMsXG4gICAgICAgIGVuZDogMTA1LFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzEzLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzEzLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzEzLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzMTMsXG4gICAgICAgIGVuZDogMzE1LFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIG5vdyBsZXQncyBkbyBhIG1peCBvZiBib3RoIGxvY2FsIGFuZCBub24gbG9jYWwgc291cmNlc1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIGFuZCBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRob3V0IHF1ZXJ5U3RhdHVzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSBhbmQgc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMiwgR2Vvc2VydmVyMjogMiB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAyLFxuICAgICAgICBoaXRzOiAyMDUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2UgYW5kIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMsIGF0IGVuZCBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAxLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAxLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwNCB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAxLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMDUsXG4gICAgICAgIGVuZDogMjA1LFxuICAgICAgICBoaXRzOiAyMDUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGhvdXQgcXVlcnlTdGF0dXMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAyLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAyLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDMsXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGxvY2FsIGFuZCBub24gbG9jYWwgYWxyZWFkeSBlbmRlZCwgYW5kIG5vbiBsb2NhbCBub3QgeWV0IGVuZGVkIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDIwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMjAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTExLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTEyLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyNjEsXG4gICAgICAgIGVuZDogMjYxLFxuICAgICAgICBoaXRzOiAyNjUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbm9uIGxvY2FsIGJlaW5nIHRoZSBsYXN0IHRvIGVuZCcsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMjAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDI2NSxcbiAgICAgICAgZW5kOiAyNjUsXG4gICAgICAgIGhpdHM6IDI2NSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIG5vbiBsb2NhbCBhbHJlYWR5IGVuZGVkLCBhbmQgbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTE2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExNyxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDM0MSxcbiAgICAgICAgZW5kOiAzNDEsXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogNDMwLFxuICAgICAgICBlbmQ6IDQzMCxcbiAgICAgICAgaGl0czogNDMwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub3cgbGV0J3MgZG8gYSBtaXggb2YgYm90aCBsb2NhbCBhbmQgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBhIGNvdW50IG9mIDNcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSBhbmQgc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aG91dCBxdWVyeVN0YXR1cywgd2l0aCBhIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIGFuZCBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogNCwgR2Vvc2VydmVyMjogNCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTAzIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiA2LFxuICAgICAgICBoaXRzOiAyMDUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2UgYW5kIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMsIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTAzIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTAzIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAsIEdlb3NlcnZlcjI6IDEwNSB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwLCBHZW9zZXJ2ZXIyOiAxMDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTAzIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjAzLFxuICAgICAgICBlbmQ6IDIwNSxcbiAgICAgICAgaGl0czogMjA1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRob3V0IHF1ZXJ5U3RhdHVzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0LFxuICAgICAgICBHZW9zZXJ2ZXIzOiA0LFxuICAgICAgICBHZW9zZXJ2ZXI0OiA0LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDksXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIGxvY2FsIGFuZCBub24gbG9jYWwgYWxyZWFkeSBlbmRlZCwgYW5kIG5vbiBsb2NhbCBub3QgeWV0IGVuZGVkIHJlc3VsdHMsIHdpdGggYSBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDIwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExMixcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTA5LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjYyLFxuICAgICAgICBlbmQ6IDI2NCxcbiAgICAgICAgaGl0czogMjY1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIG5vbiBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQsIHdpdGggYSBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDIwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTEyLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjY1LFxuICAgICAgICBlbmQ6IDI2NSxcbiAgICAgICAgaGl0czogMjY1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIG1peGVkIGJldHdlZW4gbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBsb2NhbCBub3QgeWV0IGVuZGVkIHJlc3VsdHMsIHdpdGggYSBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMixcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTE1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExOCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTIsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTEyLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDM0MCxcbiAgICAgICAgZW5kOiAzNDMsXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQsIHdpdGggYSBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDIsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDQzMCxcbiAgICAgICAgZW5kOiA0MzAsXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gbm93IGxldCdzIHRlc3Qgd2hlbiB0aGUgbnVtYmVyIG9mIGhpdHMgaXMgMCBmb3IgY2VydGFpbiBzb3VyY2VzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMgd2l0aCAwIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydsb2NhbCddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzIHdpdGggMCBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cyB3aXRoIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBubyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDIgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDAsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMSxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIG5vIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAwLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogOSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxMCxcbiAgICAgICAgZW5kOiAxMCxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgbm8gaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMiwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAxLFxuICAgICAgICBoaXRzOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBoYXZpbmcgaGl0cyBhbmQgbm9uIGxvY2FsIGhhdmluZyBubyBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAyLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDEsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIG5vIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDksIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAsXG4gICAgICAgIGVuZDogMTAsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub3cgbGV0J3MgdGVzdCB3aGVuIHRoZSBudW1iZXIgb2YgaGl0cyBpcyAwIGZvciBjZXJ0YWluIHNvdXJjZXMgd2l0aCBhIGNvdW50IG9mIDNcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cyB3aXRoIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCwgR2Vvc2VydmVyMjogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBoYXZpbmcgbm8gaGl0cyBhbmQgbm9uIGxvY2FsIGhhdmluZyBoaXRzIHdpdGggY291bnQgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogNCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBoYXZpbmcgbm8gaGl0cyBhbmQgbm9uIGxvY2FsIGhhdmluZyBoaXRzIHdpdGggY291bnQgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAwLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogNyB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxMCxcbiAgICAgICAgZW5kOiAxMCxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgbm8gaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDQsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMyxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgbm8gaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDQsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMyxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgbm8gaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDcsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAsXG4gICAgICAgIGVuZDogMTAsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub3cgbGV0J3MgZG8gbXVsdGlwbGUgc291cmNlcyBmb3IgZWFjaCB0eXBlIHdpdGggc29tZSBoYXZpbmcgMCBoaXRzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIsXG4gICAgICAgIEdlb3NlcnZlcjM6IDIsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAyLFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBsb2NhbCBhbmQgbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBub24gbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMixcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjAxLFxuICAgICAgICBlbmQ6IDIwMSxcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIG5vbiBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQgd2l0aCBvbmUgb2YgZWFjaCBzb3VyY2UgdHlwZSBoYXZpbmcgMCBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMTAsXG4gICAgICAgIGVuZDogMjEwLFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBub24gbG9jYWwgYWxyZWFkeSBlbmRlZCwgYW5kIGxvY2FsIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cyB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwMSxcbiAgICAgICAgZW5kOiAyMDEsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQgd2l0aCBvbmUgb2YgZWFjaCBzb3VyY2UgdHlwZSBoYXZpbmcgMCBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMTAsXG4gICAgICAgIGVuZDogMjEwLFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIG5vdyBsZXQncyBkbyBtdWx0aXBsZSBzb3VyY2VzIGZvciBlYWNoIHR5cGUgd2l0aCBzb21lIGhhdmluZyAwIGhpdHMgd2l0aCBhIGNvdW50IG9mIDNcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBvbmUgb2YgZWFjaCBzb3VyY2UgdHlwZSBoYXZpbmcgMCBoaXRzIHdpdGggY291bnQgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQsXG4gICAgICAgIEdlb3NlcnZlcjM6IDQsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiA2LFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBsb2NhbCBhbmQgbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBub24gbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAzLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwMyxcbiAgICAgICAgZW5kOiAyMDUsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBub24gbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMixcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwOSxcbiAgICAgICAgZW5kOiAyMTAsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIG5vbiBsb2NhbCBhbHJlYWR5IGVuZGVkLCBhbmQgbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMyxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwMyxcbiAgICAgICAgZW5kOiAyMDUsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQgd2l0aCBvbmUgb2YgZWFjaCBzb3VyY2UgdHlwZSBoYXZpbmcgMCBoaXRzIHdpdGggY291bnQgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDIsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjA5LFxuICAgICAgICBlbmQ6IDIxMCxcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXVxuXG4vLyB0aGlzIHdpbGwgdmVyaWZ5IHRoYXQgeW91J3ZlIHNldCB1cCB0aGUgdGVzdCBjYXNlIGRhdGEgY29ycmVjdGx5LCBvdGhlcndpc2UgdGVzdHMgd2lsbCBmYWlsIGZvciByZWFzb25zIG91dHNpZGUgb2YgYWN0dWFsIG1ldGhvZCBpc3N1ZXMsIGxpa2UgcmV0dXJuaW5nIHdyb25nIGNvdW50cyBpbiBzb3VyY2VzXG5mdW5jdGlvbiB2ZXJpZnlDYXNlRGF0YShjYXNlRGF0YTogQ2FzZURhdGFUeXBlLCBjYXNlRGVzY3JpcHRpb246IHN0cmluZykge1xuICBjb25zdCB7IHF1ZXJ5U3RhdHVzLCBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cCwgY291bnQsIGlzTG9jYWwgfSA9IGNhc2VEYXRhXG5cbiAgT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykuZm9yRWFjaCgoc3RhdHVzKSA9PiB7XG4gICAgaWYgKGlzTG9jYWwoc3RhdHVzLmlkKSkge1xuICAgICAgcmV0dXJuIC8vIHdlIHZlcmlmeSB0aGlzIHNlcGFyYXRlbHlcbiAgICB9XG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXBbc3RhdHVzLmlkXVxuICAgIGxldCBjb3JyZWN0Q291bnQgPSAwXG4gICAgaWYgKGN1cnJlbnRJbmRleCA8PSBzdGF0dXMuaGl0cykge1xuICAgICAgY29ycmVjdENvdW50ID0gTWF0aC5taW4oY291bnQsIHN0YXR1cy5oaXRzIC0gY3VycmVudEluZGV4ICsgMSlcbiAgICB9XG4gICAgLy8gYmFzZWQgb2YgY3VycmVudEluZGV4IGFuZCBoaXRzLCB3ZSBjYW4gZGVjaWRlIGlmIHRoZSBjb3VudCBvbiB0aGUgc3RhdHVzIGlzIGNvcnJlY3RcbiAgICBpZiAoc3RhdHVzLmNvdW50ICE9PSBjb3JyZWN0Q291bnQpIHtcbiAgICAgIGl0KGAke2Nhc2VEZXNjcmlwdGlvbn0gc3RhdHVzIGNvdW50IGlzIGluY29ycmVjdCBmb3IgJHtzdGF0dXMuaWR9LCBleHBlY3RlZCAke2NvcnJlY3RDb3VudH0sIGdvdCAke3N0YXR1cy5jb3VudH1gLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChzdGF0dXMuY291bnQpLnRvLmVxdWFsKGNvcnJlY3RDb3VudClcbiAgICAgIH0pXG4gICAgfVxuICB9KVxuICBpZiAoT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxvY2FsU3RhdHVzZXMgPSBPYmplY3QudmFsdWVzKHF1ZXJ5U3RhdHVzKS5maWx0ZXIoKHN0YXR1cykgPT5cbiAgICAgIGlzTG9jYWwoc3RhdHVzLmlkKVxuICAgIClcbiAgICBpZiAobG9jYWxTdGF0dXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjdXJyZW50TG9jYWxJbmRleCA9IGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwWydsb2NhbCddXG4gICAgICBjb25zdCB0b3RhbExvY2FsSGl0cyA9IGxvY2FsU3RhdHVzZXMucmVkdWNlKFxuICAgICAgICAoYWNjLCBzdGF0dXMpID0+IGFjYyArIHN0YXR1cy5oaXRzLFxuICAgICAgICAwXG4gICAgICApXG4gICAgICBjb25zdCB0b3RhbExvY2FsQ291bnQgPSBsb2NhbFN0YXR1c2VzLnJlZHVjZShcbiAgICAgICAgKGFjYywgc3RhdHVzKSA9PiBhY2MgKyBzdGF0dXMuY291bnQsXG4gICAgICAgIDBcbiAgICAgIClcbiAgICAgIGxldCBjb3JyZWN0Q291bnQgPSAwXG4gICAgICBpZiAoY3VycmVudExvY2FsSW5kZXggPD0gdG90YWxMb2NhbEhpdHMpIHtcbiAgICAgICAgY29ycmVjdENvdW50ID0gTWF0aC5taW4oY291bnQsIHRvdGFsTG9jYWxIaXRzIC0gY3VycmVudExvY2FsSW5kZXggKyAxKVxuICAgICAgfVxuICAgICAgaWYgKHRvdGFsTG9jYWxDb3VudCAhPT0gY29ycmVjdENvdW50KSB7XG4gICAgICAgIGl0KGAke2Nhc2VEZXNjcmlwdGlvbn0gbG9jYWwgc3RhdHVzIGNvdW50IGlzIGluY29ycmVjdCwgZXhwZWN0ZWQgJHtjb3JyZWN0Q291bnR9LCBnb3QgJHt0b3RhbExvY2FsQ291bnR9YCwgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdCh0b3RhbExvY2FsQ291bnQpLnRvLmVxdWFsKGNvcnJlY3RDb3VudClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZGVzY3JpYmUoJ2V4ZXJjaXNlIHZhcmlvdXMgZWRnZSBjYXNlcyBmb3Igc2VhcmNoZXMgaW52b2x2aW5nIHNvdXJjZXMgYW5kIHBhZ2luZycsICgpID0+IHtcbiAgQ2FzZXNUb1Rlc3QuZm9yRWFjaCgodGVzdENhc2UpID0+IHtcbiAgICBjb25zdCB7IGNhc2VEZXNjcmlwdGlvbiwgY2FzZURhdGEsIGNhc2VSZXR1cm5zIH0gPSB0ZXN0Q2FzZVxuXG4gICAgaWYgKCFjYXNlUmV0dXJucykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZmlyc3QgdmVyaWZ5IHRoYXQgdGhlIHN0YXR1cyBvZiB0aGUgY2FzZSB0ZXN0IGRhdGEgaXMgbm90IGluIGFuIGluY29uc2lzdGVudCBzdGF0ZVxuICAgIHZlcmlmeUNhc2VEYXRhKGNhc2VEYXRhLCBjYXNlRGVzY3JpcHRpb24pXG5cbiAgICBpZiAoY2FzZVJldHVybnMuY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwKSB7XG4gICAgICBydW5UZXN0KFxuICAgICAgICBgY2FsY3VsYXRlcyBuZXh0IGluZGV4ICR7Y2FzZURlc2NyaXB0aW9ufWAsXG4gICAgICAgIGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgICAgICAgY2FzZURhdGEsXG4gICAgICAgIGNhc2VSZXR1cm5zLmNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChjYXNlUmV0dXJucy5pbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwKSB7XG4gICAgICBydW5UZXN0KFxuICAgICAgICBgY2FsY3VsYXRlcyBpbmRleCBvZiBsYXN0IHJlc3VsdCAke2Nhc2VEZXNjcmlwdGlvbn1gLFxuICAgICAgICBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwLFxuICAgICAgICBjYXNlRGF0YSxcbiAgICAgICAgY2FzZVJldHVybnMuaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChjYXNlUmV0dXJucy5jb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwKSB7XG4gICAgICBydW5UZXN0KFxuICAgICAgICBgY2FsY3VsYXRlcyBwcmV2aW91cyBwYWdlICR7Y2FzZURlc2NyaXB0aW9ufWAsXG4gICAgICAgIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXAsXG4gICAgICAgIGNhc2VEYXRhLFxuICAgICAgICBjYXNlUmV0dXJucy5jb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKGNhc2VSZXR1cm5zLmNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXApIHtcbiAgICAgIHJ1blRlc3QoXG4gICAgICAgIGBjYWxjdWxhdGVzIGZpbmFsIHBhZ2UgJHtjYXNlRGVzY3JpcHRpb259YCxcbiAgICAgICAgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cCxcbiAgICAgICAgY2FzZURhdGEsXG4gICAgICAgIGNhc2VSZXR1cm5zLmNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXBcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoY2FzZVJldHVybnMuY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXApIHtcbiAgICAgIHJ1blRlc3QoXG4gICAgICAgIGBjYWxjdWxhdGVzIGN1cnJlbnQgc3RhcnQgYW5kIGVuZCAke2Nhc2VEZXNjcmlwdGlvbn1gLFxuICAgICAgICBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCxcbiAgICAgICAgY2FzZURhdGEsXG4gICAgICAgIGNhc2VSZXR1cm5zLmN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwXG4gICAgICApXG4gICAgfVxuICB9KVxufSlcbiJdfQ==