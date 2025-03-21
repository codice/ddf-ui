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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeS5zcGVjLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUU3QixPQUFPLEVBQ0wsb0NBQW9DLEVBQ3BDLGtDQUFrQyxFQUNsQyx3Q0FBd0MsRUFDeEMscUNBQXFDLEVBQ3JDLG1DQUFtQyxHQUNwQyxNQUFNLGlCQUFpQixDQUFBO0FBRXhCLHFDQUFxQztBQUNyQyxTQUFTLE9BQU8sQ0FDZCxXQUFtQixFQUNuQixNQUF1QixFQUN2QixLQUFRLEVBQ1IsY0FBaUI7SUFFakIsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFDLElBQUk7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUMvQixDQUFBO1FBQ0QsSUFBSSxFQUFFLENBQUE7SUFDUixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUE4QkQsSUFBTSxXQUFXLEdBQW1DO0lBQ2xELHlCQUF5QjtJQUN6QjtRQUNFLGVBQWUsRUFBRSxpREFBaUQ7UUFDbEUsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLFdBQVcsRUFBRSxFQUFFO1lBQ2YsT0FBTyxFQUFFLFVBQUMsRUFBRSxJQUFLLE9BQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCO1lBQ3ZDLDBCQUEwQixFQUFFLEVBQUU7WUFDOUIsS0FBSyxFQUFFLENBQUM7U0FDVDtRQUNELFdBQVcsRUFBRTtZQUNYLGlDQUFpQyxFQUFFLEVB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bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHsgZXhwZWN0IH0gZnJvbSAnY2hhaSdcblxuaW1wb3J0IHtcbiAgZ2V0Q29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRDb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwLFxuICBnZXRDdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cCxcbn0gZnJvbSAnLi9RdWVyeS5tZXRob2RzJ1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gcnVuIGEgdGVzdCBjYXNlXG5mdW5jdGlvbiBydW5UZXN0PFQsIFU+KFxuICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICBtZXRob2Q6IChpbnB1dDogVCkgPT4gVSxcbiAgaW5wdXQ6IFQsXG4gIGV4cGVjdGVkT3V0cHV0OiBVXG4pIHtcbiAgaXQoZGVzY3JpcHRpb24sIChkb25lKSA9PiB7XG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KG1ldGhvZChpbnB1dCkpKS50by5lcXVhbChcbiAgICAgIEpTT04uc3RyaW5naWZ5KGV4cGVjdGVkT3V0cHV0KVxuICAgIClcbiAgICBkb25lKClcbiAgfSlcbn1cblxudHlwZSBDYXNlRGF0YVR5cGUgPSBQYXJhbWV0ZXJzPHR5cGVvZiBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA+WzBdICZcbiAgUGFyYW1ldGVyczx0eXBlb2YgZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cD5bMF0gJlxuICBQYXJhbWV0ZXJzPHR5cGVvZiBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwPlswXSAmXG4gIFBhcmFtZXRlcnM8dHlwZW9mIGdldENvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA+WzBdICZcbiAgUGFyYW1ldGVyczx0eXBlb2YgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA+WzBdXG5cbnR5cGUgTmVjY2Vzc2FyeVBhcmFtZXRlcnNGb3JUZXN0cyA9IHtcbiAgY2FzZURlc2NyaXB0aW9uOiBzdHJpbmdcbiAgY2FzZURhdGE6IENhc2VEYXRhVHlwZVxuICBjYXNlUmV0dXJucz86IHtcbiAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA/OiBSZXR1cm5UeXBlPFxuICAgICAgdHlwZW9mIGdldENvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cFxuICAgID5cbiAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwPzogUmV0dXJuVHlwZTxcbiAgICAgIHR5cGVvZiBnZXRJbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwXG4gICAgPlxuICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA/OiBSZXR1cm5UeXBlPFxuICAgICAgdHlwZW9mIGdldENvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXBcbiAgICA+XG4gICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cD86IFJldHVyblR5cGU8XG4gICAgICB0eXBlb2YgZ2V0Q29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cFxuICAgID5cbiAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cD86IFJldHVyblR5cGU8XG4gICAgICB0eXBlb2YgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXBcbiAgICA+XG4gIH1cbn1cblxuY29uc3QgQ2FzZXNUb1Rlc3Q6IE5lY2Nlc3NhcnlQYXJhbWV0ZXJzRm9yVGVzdHNbXSA9IFtcbiAgLy8gbm9uIGxvY2FsIHNvdXJjZXMgb25seVxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOiAnZm9yIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGhvdXQgcXVlcnlTdGF0dXMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydsb2NhbCddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMiB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDEsXG4gICAgICAgIGhpdHM6IDEwMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cywgYXQgZW5kIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDk5IH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAwLFxuICAgICAgICBlbmQ6IDEwMCxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOiAnZm9yIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIG9ubHksIHdpdGggbm8gcXVlcnlTdGF0dXMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoKSA9PiBmYWxzZSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMixcbiAgICAgICAgR2Vvc2VydmVyMjogMixcbiAgICAgICAgR2Vvc2VydmVyMzogMixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBhbHJlYWR5IGVuZGVkIGFuZCBub3QgeWV0IGVuZGVkIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydsb2NhbCddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDQsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwNCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDMxMCxcbiAgICAgICAgZW5kOiAzMTEsXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMzE1LFxuICAgICAgICBlbmQ6IDMxNSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub24gbG9jYWwgc291cmNlcywgY291bnQgb2YgM1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRob3V0IHF1ZXJ5U3RhdHVzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiA0IH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMyxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzLCBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydsb2NhbCddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMTAwIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAxMDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiA5NyB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEwMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEwMCxcbiAgICAgICAgZW5kOiAxMDAsXG4gICAgICAgIGhpdHM6IDEwMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgb25seSwgd2l0aCBubyBxdWVyeVN0YXR1cywgd2l0aCBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHt9LFxuICAgICAgaXNMb2NhbDogKCkgPT4gZmFsc2UsXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogNCxcbiAgICAgICAgR2Vvc2VydmVyMjogNCxcbiAgICAgICAgR2Vvc2VydmVyMzogNCxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiA5LFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBhbHJlYWR5IGVuZGVkIGFuZCBub3QgeWV0IGVuZGVkIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ2xvY2FsJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDMsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMyxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwNixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMzA2LFxuICAgICAgICBlbmQ6IDMxMSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMixcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydsb2NhbCddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjI6IDEwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgR2Vvc2VydmVyMTogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIyOiAxMDYsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwNixcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMjogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDMxNCxcbiAgICAgICAgZW5kOiAzMTUsXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gIG9ubHkgbG9jYWwgc291cmNlc1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOiAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2Ugd2l0aG91dCBxdWVyeVN0YXR1cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAyIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMSxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMsIGF0IGVuZCBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA5OSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAwLFxuICAgICAgICBlbmQ6IDEwMCxcbiAgICAgICAgaGl0czogMTAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOiAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgb25seSwgd2l0aCBubyBxdWVyeVN0YXR1cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMCxcbiAgICAgICAgZW5kOiAwLFxuICAgICAgICBoaXRzOiAwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBhbHJlYWR5IGVuZGVkIGFuZCBub3QgeWV0IGVuZGVkIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwNCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEwNSxcbiAgICAgICAgZW5kOiAxMDUsXG4gICAgICAgIGhpdHM6IDMxNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzE1LFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzE1LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTQsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzE1LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzMTUsXG4gICAgICAgIGVuZDogMzE1LFxuICAgICAgICBoaXRzOiAzMTUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIG9ubHkgbG9jYWwgc291cmNlcywgY291bnQgb2YgM1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIHdpdGhvdXQgcXVlcnlTdGF0dXMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlciddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXInLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlciddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDQgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiAxMDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cywgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogOTcgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEwMCxcbiAgICAgICAgZW5kOiAxMDAsXG4gICAgICAgIGhpdHM6IDEwMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBvbmx5LCB3aXRoIG5vIHF1ZXJ5U3RhdHVzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMyddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNCxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTMsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMyxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBhbHJlYWR5IGVuZGVkIGFuZCBub3QgeWV0IGVuZGVkIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMyxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwNixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxMyxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAzLFxuICAgICAgICBlbmQ6IDEwNSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxMyxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxMyxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAzMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMzEwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDMxMyxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMzEzLFxuICAgICAgICBlbmQ6IDMxNSxcbiAgICAgICAgaGl0czogMzE1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub3cgbGV0J3MgZG8gYSBtaXggb2YgYm90aCBsb2NhbCBhbmQgbm9uIGxvY2FsIHNvdXJjZXNcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSBhbmQgc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aG91dCBxdWVyeVN0YXR1cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2UgYW5kIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDIsIEdlb3NlcnZlcjI6IDIgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwNSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMixcbiAgICAgICAgaGl0czogMjA1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIGFuZCBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzLCBhdCBlbmQgb2YgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDAsIEdlb3NlcnZlcjI6IDEwNSB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAxLCBHZW9zZXJ2ZXIyOiAxMDQgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMSwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjA1LFxuICAgICAgICBlbmQ6IDIwNSxcbiAgICAgICAgaGl0czogMjA1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRob3V0IHF1ZXJ5U3RhdHVzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge30sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMixcbiAgICAgICAgR2Vvc2VydmVyMzogMixcbiAgICAgICAgR2Vvc2VydmVyNDogMixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAzLFxuICAgICAgICBoaXRzOiA0MzAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBsb2NhbCBhbmQgbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBub24gbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDIwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExMixcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTEwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjYxLFxuICAgICAgICBlbmQ6IDI2MSxcbiAgICAgICAgaGl0czogMjY1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIG5vbiBsb2NhbCBiZWluZyB0aGUgbGFzdCB0byBlbmQnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDIwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMjAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTQsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyNjUsXG4gICAgICAgIGVuZDogMjY1LFxuICAgICAgICBoaXRzOiAyNjUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBub24gbG9jYWwgYWxyZWFkeSBlbmRlZCwgYW5kIGxvY2FsIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTcsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTE1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzNDEsXG4gICAgICAgIGVuZDogMzQxLFxuICAgICAgICBoaXRzOiA0MzAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTUsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDQsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDQzMCxcbiAgICAgICAgZW5kOiA0MzAsXG4gICAgICAgIGhpdHM6IDQzMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gbm93IGxldCdzIGRvIGEgbWl4IG9mIGJvdGggbG9jYWwgYW5kIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggYSBjb3VudCBvZiAzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2UgYW5kIHNpbmdsZSBub24gbG9jYWwgc291cmNlIHdpdGhvdXQgcXVlcnlTdGF0dXMsIHdpdGggYSBjb3VudCBvZiAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7fSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3Igc2luZ2xlIGxvY2FsIHNvdXJjZSBhbmQgc2luZ2xlIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBhIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDQsIEdlb3NlcnZlcjI6IDQgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCwgR2Vvc2VydmVyMjogMTA1IH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwMyB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogNixcbiAgICAgICAgaGl0czogMjA1LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbG9jYWwgc291cmNlIGFuZCBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzLCBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBhIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwMyB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwMyB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAwLCBHZW9zZXJ2ZXIyOiAxMDUgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwMCwgR2Vvc2VydmVyMjogMTAwIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMDEsIEdlb3NlcnZlcjI6IDEwMyB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwMyxcbiAgICAgICAgZW5kOiAyMDUsXG4gICAgICAgIGhpdHM6IDIwNSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aG91dCBxdWVyeVN0YXR1cywgd2l0aCBhIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7fSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge30sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHt9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBhIGNvdW50IG9mIDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNCxcbiAgICAgICAgR2Vvc2VydmVyMzogNCxcbiAgICAgICAgR2Vvc2VydmVyNDogNCxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjA1LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiA5LFxuICAgICAgICBoaXRzOiA0MzAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBsb2NhbCBhbmQgbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBub24gbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMjAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTIsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEwOSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDI2MixcbiAgICAgICAgZW5kOiAyNjQsXG4gICAgICAgIGhpdHM6IDI2NSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBub24gbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMjAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAyMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExNSxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogNDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE1LFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDQxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExMixcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0MSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDI2NSxcbiAgICAgICAgZW5kOiAyNjUsXG4gICAgICAgIGhpdHM6IDI2NSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBtaXhlZCBiZXR3ZWVuIG5vbiBsb2NhbCBhbHJlYWR5IGVuZGVkLCBhbmQgbG9jYWwgbm90IHlldCBlbmRlZCByZXN1bHRzLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDIsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTgsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExMixcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAzNDAsXG4gICAgICAgIGVuZDogMzQzLFxuICAgICAgICBoaXRzOiA0MzAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kLCB3aXRoIGEgY291bnQgb2YgMycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTA1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTE1LFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTExLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTYsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDIwNSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxMTUsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMjAyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDExNixcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyMDUsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMTE2LFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiA0MzAsXG4gICAgICAgIGVuZDogNDMwLFxuICAgICAgICBoaXRzOiA0MzAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIG5vdyBsZXQncyB0ZXN0IHdoZW4gdGhlIG51bWJlciBvZiBoaXRzIGlzIDAgZm9yIGNlcnRhaW4gc291cmNlc1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBzaW5nbGUgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzIHdpdGggMCBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnbG9jYWwnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgR2Vvc2VydmVyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IEdlb3NlcnZlcjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBHZW9zZXJ2ZXI6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIHNpbmdsZSBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cyB3aXRoIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlciddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMgd2l0aCAwIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCwgR2Vvc2VydmVyMjogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDAsXG4gICAgICAgIGVuZDogMCxcbiAgICAgICAgaGl0czogMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBiZWdpbm5pbmcgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBoYXZpbmcgbm8gaGl0cyBhbmQgbm9uIGxvY2FsIGhhdmluZyBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAyIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAwLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDEsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBubyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDkgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAsXG4gICAgICAgIGVuZDogMTAsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIG5vIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDIsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMSxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgbm8gaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMiwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMSxcbiAgICAgICAgZW5kOiAxLFxuICAgICAgICBoaXRzOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgYSBsb2NhbCBzb3VyY2UgYW5kIG5vbiBsb2NhbCBzb3VyY2Ugd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBsb2NhbCBoYXZpbmcgaGl0cyBhbmQgbm9uIGxvY2FsIGhhdmluZyBubyBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA5LCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEwLFxuICAgICAgICBlbmQ6IDEwLFxuICAgICAgICBoaXRzOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gbm93IGxldCdzIHRlc3Qgd2hlbiB0aGUgbnVtYmVyIG9mIGhpdHMgaXMgMCBmb3IgY2VydGFpbiBzb3VyY2VzIHdpdGggYSBjb3VudCBvZiAzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMgd2l0aCAwIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDAsIEdlb3NlcnZlcjI6IDAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICBlbmQ6IDAsXG4gICAgICAgIGhpdHM6IDAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIG5vIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDQgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDAsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMyxcbiAgICAgICAgaGl0czogMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIGEgbG9jYWwgc291cmNlIGFuZCBub24gbG9jYWwgc291cmNlIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgaGF2aW5nIG5vIGhpdHMgYW5kIG5vbiBsb2NhbCBoYXZpbmcgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMSddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxLCBHZW9zZXJ2ZXIyOiAxMCB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMCwgR2Vvc2VydmVyMjogMTAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDcgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEsIEdlb3NlcnZlcjI6IDEwIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMTAsXG4gICAgICAgIGVuZDogMTAsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIG5vIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA0LCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDMsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIG5vIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA0LCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMCB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMSwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAxLFxuICAgICAgICBlbmQ6IDMsXG4gICAgICAgIGhpdHM6IDEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBhIGxvY2FsIHNvdXJjZSBhbmQgbm9uIGxvY2FsIHNvdXJjZSB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGVuZCBvZiByZXN1bHRzLCB3aXRoIGxvY2FsIGhhdmluZyBoaXRzIGFuZCBub24gbG9jYWwgaGF2aW5nIG5vIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDogeyBsb2NhbDogMTAsIEdlb3NlcnZlcjI6IDEgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHsgbG9jYWw6IDEwLCBHZW9zZXJ2ZXIyOiAwIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiA3LCBHZW9zZXJ2ZXIyOiAxIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7IGxvY2FsOiAxMCwgR2Vvc2VydmVyMjogMSB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEwLFxuICAgICAgICBlbmQ6IDEwLFxuICAgICAgICBoaXRzOiAxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gbm93IGxldCdzIGRvIG11bHRpcGxlIHNvdXJjZXMgZm9yIGVhY2ggdHlwZSB3aXRoIHNvbWUgaGF2aW5nIDAgaGl0c1xuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIGF0IGJlZ2lubmluZyBvZiByZXN1bHRzLCB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAyLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAyLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogMixcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIG1peGVkIGJldHdlZW4gbG9jYWwgYW5kIG5vbiBsb2NhbCBhbHJlYWR5IGVuZGVkLCBhbmQgbm9uIGxvY2FsIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cyB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAxLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDIsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwMSxcbiAgICAgICAgZW5kOiAyMDEsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIGNhc2VEZXNjcmlwdGlvbjpcbiAgICAgICdmb3IgbXVsdGlwbGUgbG9jYWwgc291cmNlcyBhbmQgbXVsdGlwbGUgbm9uIGxvY2FsIHNvdXJjZXMgd2l0aCBxdWVyeVN0YXR1cyBhdCBlbmQgb2YgcmVzdWx0cywgd2l0aCBub24gbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjEwLFxuICAgICAgICBlbmQ6IDIxMCxcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIG1peGVkIGJldHdlZW4gbm9uIGxvY2FsIGFscmVhZHkgZW5kZWQsIGFuZCBsb2NhbCBub3QgeWV0IGVuZGVkIHJlc3VsdHMgd2l0aCBvbmUgb2YgZWFjaCBzb3VyY2UgdHlwZSBoYXZpbmcgMCBoaXRzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMSxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMSxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMixcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMDEsXG4gICAgICAgIGVuZDogMjAxLFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cycsXG4gICAgY2FzZURhdGE6IHtcbiAgICAgIHNvdXJjZXM6IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJywgJ0dlb3NlcnZlcjMnLCAnR2Vvc2VydmVyNCddLFxuICAgICAgcXVlcnlTdGF0dXM6IHtcbiAgICAgICAgR2Vvc2VydmVyMToge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMScsXG4gICAgICAgICAgY291bnQ6IDEsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMjoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMicsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjM6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjMnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjQ6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjQnLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGlzTG9jYWw6IChpZCkgPT4gWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInXS5pbmNsdWRlcyhpZCksXG4gICAgICBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDEsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBpbmRleE9mTGFzdFJlc3VsdEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyNDogMCxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMTAsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBzdGFydDogMjEwLFxuICAgICAgICBlbmQ6IDIxMCxcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBub3cgbGV0J3MgZG8gbXVsdGlwbGUgc291cmNlcyBmb3IgZWFjaCB0eXBlIHdpdGggc29tZSBoYXZpbmcgMCBoaXRzIHdpdGggYSBjb3VudCBvZiAzXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgYmVnaW5uaW5nIG9mIHJlc3VsdHMsIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAzLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDEwMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY291bnQ6IDMsXG4gICAgfSxcbiAgICBjYXNlUmV0dXJuczoge1xuICAgICAgY29uc3RyYWluZWROZXh0UGFnZUZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiA0LFxuICAgICAgICBHZW9zZXJ2ZXIzOiA0LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDksXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDEsXG4gICAgICAgIGVuZDogNixcbiAgICAgICAgaGl0czogMjEwLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgY2FzZURlc2NyaXB0aW9uOlxuICAgICAgJ2ZvciBtdWx0aXBsZSBsb2NhbCBzb3VyY2VzIGFuZCBtdWx0aXBsZSBub24gbG9jYWwgc291cmNlcyB3aXRoIHF1ZXJ5U3RhdHVzIG1peGVkIGJldHdlZW4gbG9jYWwgYW5kIG5vbiBsb2NhbCBhbHJlYWR5IGVuZGVkLCBhbmQgbm9uIGxvY2FsIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cyB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDMsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMyxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMDMsXG4gICAgICAgIGVuZDogMjA1LFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbm9uIGxvY2FsIGJlaW5nIHRoZSBsYXN0IHRvIGVuZCB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDIsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTEwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMDksXG4gICAgICAgIGVuZDogMjEwLFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgbWl4ZWQgYmV0d2VlbiBub24gbG9jYWwgYWxyZWFkeSBlbmRlZCwgYW5kIGxvY2FsIG5vdCB5ZXQgZW5kZWQgcmVzdWx0cyB3aXRoIG9uZSBvZiBlYWNoIHNvdXJjZSB0eXBlIGhhdmluZyAwIGhpdHMgd2l0aCBjb3VudCAzJyxcbiAgICBjYXNlRGF0YToge1xuICAgICAgc291cmNlczogWydHZW9zZXJ2ZXIxJywgJ0dlb3NlcnZlcjInLCAnR2Vvc2VydmVyMycsICdHZW9zZXJ2ZXI0J10sXG4gICAgICBxdWVyeVN0YXR1czoge1xuICAgICAgICBHZW9zZXJ2ZXIxOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIxJyxcbiAgICAgICAgICBjb3VudDogMyxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMTAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIyOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIyJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyMzoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyMycsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMTAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgICAgR2Vvc2VydmVyNDoge1xuICAgICAgICAgIGlkOiAnR2Vvc2VydmVyNCcsXG4gICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgaGFzUmV0dXJuZWQ6IHRydWUsXG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaXNMb2NhbDogKGlkKSA9PiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMiddLmluY2x1ZGVzKGlkKSxcbiAgICAgIGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIGxvY2FsOiAxMDMsXG4gICAgICAgIEdlb3NlcnZlcjM6IDEwMSxcbiAgICAgICAgR2Vvc2VydmVyNDogMSxcbiAgICAgIH0sXG4gICAgICBjb3VudDogMyxcbiAgICB9LFxuICAgIGNhc2VSZXR1cm5zOiB7XG4gICAgICBjb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwNixcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDExMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAwLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkUHJldmlvdXNQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwMCxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAwLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwOiB7XG4gICAgICAgIHN0YXJ0OiAyMDMsXG4gICAgICAgIGVuZDogMjA1LFxuICAgICAgICBoaXRzOiAyMTAsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBjYXNlRGVzY3JpcHRpb246XG4gICAgICAnZm9yIG11bHRpcGxlIGxvY2FsIHNvdXJjZXMgYW5kIG11bHRpcGxlIG5vbiBsb2NhbCBzb3VyY2VzIHdpdGggcXVlcnlTdGF0dXMgYXQgZW5kIG9mIHJlc3VsdHMsIHdpdGggbG9jYWwgYmVpbmcgdGhlIGxhc3QgdG8gZW5kIHdpdGggb25lIG9mIGVhY2ggc291cmNlIHR5cGUgaGF2aW5nIDAgaGl0cyB3aXRoIGNvdW50IDMnLFxuICAgIGNhc2VEYXRhOiB7XG4gICAgICBzb3VyY2VzOiBbJ0dlb3NlcnZlcjEnLCAnR2Vvc2VydmVyMicsICdHZW9zZXJ2ZXIzJywgJ0dlb3NlcnZlcjQnXSxcbiAgICAgIHF1ZXJ5U3RhdHVzOiB7XG4gICAgICAgIEdlb3NlcnZlcjE6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjEnLFxuICAgICAgICAgIGNvdW50OiAyLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDExMCxcbiAgICAgICAgICBlbGFwc2VkOiA1MDAsXG4gICAgICAgICAgc3VjY2Vzc2Z1bDogdHJ1ZSxcbiAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgIH0sXG4gICAgICAgIEdlb3NlcnZlcjI6IHtcbiAgICAgICAgICBpZDogJ0dlb3NlcnZlcjInLFxuICAgICAgICAgIGNvdW50OiAwLFxuICAgICAgICAgIGhhc1JldHVybmVkOiB0cnVlLFxuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXIzOiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXIzJyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAxMDAsXG4gICAgICAgICAgZWxhcHNlZDogNTAwLFxuICAgICAgICAgIHN1Y2Nlc3NmdWw6IHRydWUsXG4gICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICB9LFxuICAgICAgICBHZW9zZXJ2ZXI0OiB7XG4gICAgICAgICAgaWQ6ICdHZW9zZXJ2ZXI0JyxcbiAgICAgICAgICBjb3VudDogMCxcbiAgICAgICAgICBoYXNSZXR1cm5lZDogdHJ1ZSxcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIGVsYXBzZWQ6IDUwMCxcbiAgICAgICAgICBzdWNjZXNzZnVsOiB0cnVlLFxuICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBpc0xvY2FsOiAoaWQpID0+IFsnR2Vvc2VydmVyMScsICdHZW9zZXJ2ZXIyJ10uaW5jbHVkZXMoaWQpLFxuICAgICAgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgbG9jYWw6IDEwOSxcbiAgICAgICAgR2Vvc2VydmVyMzogMTAxLFxuICAgICAgICBHZW9zZXJ2ZXI0OiAxLFxuICAgICAgfSxcbiAgICAgIGNvdW50OiAzLFxuICAgIH0sXG4gICAgY2FzZVJldHVybnM6IHtcbiAgICAgIGNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTEwLFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDAsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDAsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA2LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY29uc3RyYWluZWRGaW5hbFBhZ2VGb3JTb3VyY2VHcm91cDoge1xuICAgICAgICBsb2NhbDogMTA5LFxuICAgICAgICBHZW9zZXJ2ZXIzOiAxMDEsXG4gICAgICAgIEdlb3NlcnZlcjQ6IDEsXG4gICAgICB9LFxuICAgICAgY3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXA6IHtcbiAgICAgICAgc3RhcnQ6IDIwOSxcbiAgICAgICAgZW5kOiAyMTAsXG4gICAgICAgIGhpdHM6IDIxMCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbl1cblxuLy8gdGhpcyB3aWxsIHZlcmlmeSB0aGF0IHlvdSd2ZSBzZXQgdXAgdGhlIHRlc3QgY2FzZSBkYXRhIGNvcnJlY3RseSwgb3RoZXJ3aXNlIHRlc3RzIHdpbGwgZmFpbCBmb3IgcmVhc29ucyBvdXRzaWRlIG9mIGFjdHVhbCBtZXRob2QgaXNzdWVzLCBsaWtlIHJldHVybmluZyB3cm9uZyBjb3VudHMgaW4gc291cmNlc1xuZnVuY3Rpb24gdmVyaWZ5Q2FzZURhdGEoY2FzZURhdGE6IENhc2VEYXRhVHlwZSwgY2FzZURlc2NyaXB0aW9uOiBzdHJpbmcpIHtcbiAgY29uc3QgeyBxdWVyeVN0YXR1cywgY3VycmVudEluZGV4Rm9yU291cmNlR3JvdXAsIGNvdW50LCBpc0xvY2FsIH0gPSBjYXNlRGF0YVxuXG4gIE9iamVjdC52YWx1ZXMocXVlcnlTdGF0dXMpLmZvckVhY2goKHN0YXR1cykgPT4ge1xuICAgIGlmIChpc0xvY2FsKHN0YXR1cy5pZCkpIHtcbiAgICAgIHJldHVybiAvLyB3ZSB2ZXJpZnkgdGhpcyBzZXBhcmF0ZWx5XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IGN1cnJlbnRJbmRleEZvclNvdXJjZUdyb3VwW3N0YXR1cy5pZF1cbiAgICBsZXQgY29ycmVjdENvdW50ID0gMFxuICAgIGlmIChjdXJyZW50SW5kZXggPD0gc3RhdHVzLmhpdHMpIHtcbiAgICAgIGNvcnJlY3RDb3VudCA9IE1hdGgubWluKGNvdW50LCBzdGF0dXMuaGl0cyAtIGN1cnJlbnRJbmRleCArIDEpXG4gICAgfVxuICAgIC8vIGJhc2VkIG9mIGN1cnJlbnRJbmRleCBhbmQgaGl0cywgd2UgY2FuIGRlY2lkZSBpZiB0aGUgY291bnQgb24gdGhlIHN0YXR1cyBpcyBjb3JyZWN0XG4gICAgaWYgKHN0YXR1cy5jb3VudCAhPT0gY29ycmVjdENvdW50KSB7XG4gICAgICBpdChgJHtjYXNlRGVzY3JpcHRpb259IHN0YXR1cyBjb3VudCBpcyBpbmNvcnJlY3QgZm9yICR7c3RhdHVzLmlkfSwgZXhwZWN0ZWQgJHtjb3JyZWN0Q291bnR9LCBnb3QgJHtzdGF0dXMuY291bnR9YCwgKCkgPT4ge1xuICAgICAgICBleHBlY3Qoc3RhdHVzLmNvdW50KS50by5lcXVhbChjb3JyZWN0Q291bnQpXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbiAgaWYgKE9iamVjdC52YWx1ZXMocXVlcnlTdGF0dXMpLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsb2NhbFN0YXR1c2VzID0gT2JqZWN0LnZhbHVlcyhxdWVyeVN0YXR1cykuZmlsdGVyKChzdGF0dXMpID0+XG4gICAgICBpc0xvY2FsKHN0YXR1cy5pZClcbiAgICApXG4gICAgaWYgKGxvY2FsU3RhdHVzZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY3VycmVudExvY2FsSW5kZXggPSBjdXJyZW50SW5kZXhGb3JTb3VyY2VHcm91cFsnbG9jYWwnXVxuICAgICAgY29uc3QgdG90YWxMb2NhbEhpdHMgPSBsb2NhbFN0YXR1c2VzLnJlZHVjZShcbiAgICAgICAgKGFjYywgc3RhdHVzKSA9PiBhY2MgKyBzdGF0dXMuaGl0cyxcbiAgICAgICAgMFxuICAgICAgKVxuICAgICAgY29uc3QgdG90YWxMb2NhbENvdW50ID0gbG9jYWxTdGF0dXNlcy5yZWR1Y2UoXG4gICAgICAgIChhY2MsIHN0YXR1cykgPT4gYWNjICsgc3RhdHVzLmNvdW50LFxuICAgICAgICAwXG4gICAgICApXG4gICAgICBsZXQgY29ycmVjdENvdW50ID0gMFxuICAgICAgaWYgKGN1cnJlbnRMb2NhbEluZGV4IDw9IHRvdGFsTG9jYWxIaXRzKSB7XG4gICAgICAgIGNvcnJlY3RDb3VudCA9IE1hdGgubWluKGNvdW50LCB0b3RhbExvY2FsSGl0cyAtIGN1cnJlbnRMb2NhbEluZGV4ICsgMSlcbiAgICAgIH1cbiAgICAgIGlmICh0b3RhbExvY2FsQ291bnQgIT09IGNvcnJlY3RDb3VudCkge1xuICAgICAgICBpdChgJHtjYXNlRGVzY3JpcHRpb259IGxvY2FsIHN0YXR1cyBjb3VudCBpcyBpbmNvcnJlY3QsIGV4cGVjdGVkICR7Y29ycmVjdENvdW50fSwgZ290ICR7dG90YWxMb2NhbENvdW50fWAsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QodG90YWxMb2NhbENvdW50KS50by5lcXVhbChjb3JyZWN0Q291bnQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmRlc2NyaWJlKCdleGVyY2lzZSB2YXJpb3VzIGVkZ2UgY2FzZXMgZm9yIHNlYXJjaGVzIGludm9sdmluZyBzb3VyY2VzIGFuZCBwYWdpbmcnLCAoKSA9PiB7XG4gIENhc2VzVG9UZXN0LmZvckVhY2goKHRlc3RDYXNlKSA9PiB7XG4gICAgY29uc3QgeyBjYXNlRGVzY3JpcHRpb24sIGNhc2VEYXRhLCBjYXNlUmV0dXJucyB9ID0gdGVzdENhc2VcblxuICAgIGlmICghY2FzZVJldHVybnMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGZpcnN0IHZlcmlmeSB0aGF0IHRoZSBzdGF0dXMgb2YgdGhlIGNhc2UgdGVzdCBkYXRhIGlzIG5vdCBpbiBhbiBpbmNvbnNpc3RlbnQgc3RhdGVcbiAgICB2ZXJpZnlDYXNlRGF0YShjYXNlRGF0YSwgY2FzZURlc2NyaXB0aW9uKVxuXG4gICAgaWYgKGNhc2VSZXR1cm5zLmNvbnN0cmFpbmVkTmV4dFBhZ2VGb3JTb3VyY2VHcm91cCkge1xuICAgICAgcnVuVGVzdChcbiAgICAgICAgYGNhbGN1bGF0ZXMgbmV4dCBpbmRleCAke2Nhc2VEZXNjcmlwdGlvbn1gLFxuICAgICAgICBnZXRDb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXAsXG4gICAgICAgIGNhc2VEYXRhLFxuICAgICAgICBjYXNlUmV0dXJucy5jb25zdHJhaW5lZE5leHRQYWdlRm9yU291cmNlR3JvdXBcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoY2FzZVJldHVybnMuaW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCkge1xuICAgICAgcnVuVGVzdChcbiAgICAgICAgYGNhbGN1bGF0ZXMgaW5kZXggb2YgbGFzdCByZXN1bHQgJHtjYXNlRGVzY3JpcHRpb259YCxcbiAgICAgICAgZ2V0SW5kZXhPZkxhc3RSZXN1bHRGb3JTb3VyY2VHcm91cCxcbiAgICAgICAgY2FzZURhdGEsXG4gICAgICAgIGNhc2VSZXR1cm5zLmluZGV4T2ZMYXN0UmVzdWx0Rm9yU291cmNlR3JvdXBcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoY2FzZVJldHVybnMuY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cCkge1xuICAgICAgcnVuVGVzdChcbiAgICAgICAgYGNhbGN1bGF0ZXMgcHJldmlvdXMgcGFnZSAke2Nhc2VEZXNjcmlwdGlvbn1gLFxuICAgICAgICBnZXRDb25zdHJhaW5lZFByZXZpb3VzUGFnZUZvclNvdXJjZUdyb3VwLFxuICAgICAgICBjYXNlRGF0YSxcbiAgICAgICAgY2FzZVJldHVybnMuY29uc3RyYWluZWRQcmV2aW91c1BhZ2VGb3JTb3VyY2VHcm91cFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChjYXNlUmV0dXJucy5jb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwKSB7XG4gICAgICBydW5UZXN0KFxuICAgICAgICBgY2FsY3VsYXRlcyBmaW5hbCBwYWdlICR7Y2FzZURlc2NyaXB0aW9ufWAsXG4gICAgICAgIGdldENvbnN0cmFpbmVkRmluYWxQYWdlRm9yU291cmNlR3JvdXAsXG4gICAgICAgIGNhc2VEYXRhLFxuICAgICAgICBjYXNlUmV0dXJucy5jb25zdHJhaW5lZEZpbmFsUGFnZUZvclNvdXJjZUdyb3VwXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKGNhc2VSZXR1cm5zLmN1cnJlbnRTdGFydEFuZEVuZEZvclNvdXJjZUdyb3VwKSB7XG4gICAgICBydW5UZXN0KFxuICAgICAgICBgY2FsY3VsYXRlcyBjdXJyZW50IHN0YXJ0IGFuZCBlbmQgJHtjYXNlRGVzY3JpcHRpb259YCxcbiAgICAgICAgZ2V0Q3VycmVudFN0YXJ0QW5kRW5kRm9yU291cmNlR3JvdXAsXG4gICAgICAgIGNhc2VEYXRhLFxuICAgICAgICBjYXNlUmV0dXJucy5jdXJyZW50U3RhcnRBbmRFbmRGb3JTb3VyY2VHcm91cFxuICAgICAgKVxuICAgIH1cbiAgfSlcbn0pXG4iXX0=