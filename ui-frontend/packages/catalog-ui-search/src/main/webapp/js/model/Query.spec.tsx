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
import { expect } from 'chai'

import {
  getConstrainedNextPageForSourceGroup,
  getIndexOfLastResultForSourceGroup,
  getConstrainedPreviousPageForSourceGroup,
  getConstrainedFinalPageForSourceGroup,
  getCurrentStartAndEndForSourceGroup,
} from './Query.methods'

// Helper function to run a test case
function runTest<T, U>(
  description: string,
  method: (input: T) => U,
  input: T,
  expectedOutput: U
) {
  it(description, (done) => {
    expect(JSON.stringify(method(input))).to.equal(
      JSON.stringify(expectedOutput)
    )
    done()
  })
}

type CaseDataType = Parameters<typeof getConstrainedNextPageForSourceGroup>[0] &
  Parameters<typeof getIndexOfLastResultForSourceGroup>[0] &
  Parameters<typeof getConstrainedPreviousPageForSourceGroup>[0] &
  Parameters<typeof getConstrainedFinalPageForSourceGroup>[0] &
  Parameters<typeof getCurrentStartAndEndForSourceGroup>[0]

type NeccessaryParametersForTests = {
  caseDescription: string
  caseData: CaseDataType
  caseReturns?: {
    constrainedNextPageForSourceGroup?: ReturnType<
      typeof getConstrainedNextPageForSourceGroup
    >
    indexOfLastResultForSourceGroup?: ReturnType<
      typeof getIndexOfLastResultForSourceGroup
    >
    constrainedPreviousPageForSourceGroup?: ReturnType<
      typeof getConstrainedPreviousPageForSourceGroup
    >
    constrainedFinalPageForSourceGroup?: ReturnType<
      typeof getConstrainedFinalPageForSourceGroup
    >
    currentStartAndEndForSourceGroup?: ReturnType<
      typeof getCurrentStartAndEndForSourceGroup
    >
  }
}

const CasesToTest: NeccessaryParametersForTests[] = [
  // non local sources only
  {
    caseDescription: 'for single non local source without queryStatus',
    caseData: {
      sources: ['Geoserver'],
      queryStatus: {},
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single non local source with queryStatus at beginning of results',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single non local source with queryStatus, at end of results',
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
      isLocal: (id) => ['local'].includes(id),
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
      isLocal: () => false,
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
    caseDescription:
      'for multiple non local sources with queryStatus at beginning of results',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for multiple non local sources with queryStatus mixed between already ended and not yet ended results',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for multiple non local sources with queryStatus at end of results',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single non local source without queryStatus, with count of 3',
    caseData: {
      sources: ['Geoserver'],
      queryStatus: {},
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single non local source with queryStatus at beginning of results, with count of 3',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single non local source with queryStatus, at end of results, with count of 3',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for multiple non local sources only, with no queryStatus, with count of 3',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
      queryStatus: {},
      isLocal: () => false,
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
    caseDescription:
      'for multiple non local sources with queryStatus at beginning of results, with count of 3',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for multiple non local sources with queryStatus mixed between already ended and not yet ended results, with count of 3',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for multiple non local sources with queryStatus at end of results, with count of 3',
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
      isLocal: (id) => ['local'].includes(id),
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for single local source with queryStatus at beginning of results',
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for single local source with queryStatus, at end of results',
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus at beginning of results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus mixed between already ended and not yet ended results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus at end of results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for single local source without queryStatus, with count of 3',
    caseData: {
      sources: ['Geoserver'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for single local source with queryStatus at beginning of results, with count of 3',
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for single local source with queryStatus, at end of results, with count of 3',
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for multiple local sources only, with no queryStatus, with count of 3',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2', 'Geoserver3'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus at beginning of results, with count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus mixed between already ended and not yet ended results, with count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for multiple local sources with queryStatus at end of results, with count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2', 'Geoserver3'].includes(id),
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
    caseDescription:
      'for single local source and single non local source without queryStatus',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for single local source and single non local source with queryStatus at beginning of results',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for single local source and single non local source with queryStatus, at end of results',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources without queryStatus',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at beginning of results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for single local source and single non local source without queryStatus, with a count of 3',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for single local source and single non local source with queryStatus at beginning of results, with a count of 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for single local source and single non local source with queryStatus, at end of results, with a count of 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources without queryStatus, with a count of 3',
    caseData: {
      sources: ['Geoserver1', 'Geoserver2', 'Geoserver3', 'Geoserver4'],
      queryStatus: {},
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with a count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results, with a count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end, with a count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results, with a count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end, with a count of 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for single non local source with queryStatus at beginning of results with 0 hits',
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
      isLocal: (id) => ['local'].includes(id),
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
    caseDescription:
      'for single local source with queryStatus at beginning of results with 0 hits',
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
      isLocal: (id) => ['Geoserver'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results with 0 hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having no hits and non local having hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at end of results, with local having no hits and non local having hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at end of results, with local having hits and non local having no hits',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results with 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having no hits and non local having hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at end of results, with local having no hits and non local having hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at beginning of results, with local having hits and non local having no hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for a local source and non local source with queryStatus at end of results, with local having hits and non local having no hits with count 3',
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
      isLocal: (id) => ['Geoserver1'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with one of each source type having 0 hits',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results with one of each source type having 0 hits',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end with one of each source type having 0 hits',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results with one of each source type having 0 hits',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end with one of each source type having 0 hits',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at beginning of results, with one of each source type having 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between local and non local already ended, and non local not yet ended results with one of each source type having 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with non local being the last to end with one of each source type having 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus mixed between non local already ended, and local not yet ended results with one of each source type having 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
    caseDescription:
      'for multiple local sources and multiple non local sources with queryStatus at end of results, with local being the last to end with one of each source type having 0 hits with count 3',
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
      isLocal: (id) => ['Geoserver1', 'Geoserver2'].includes(id),
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
]

// this will verify that you've set up the test case data correctly, otherwise tests will fail for reasons outside of actual method issues, like returning wrong counts in sources
function verifyCaseData(caseData: CaseDataType, caseDescription: string) {
  const { queryStatus, currentIndexForSourceGroup, count, isLocal } = caseData

  Object.values(queryStatus).forEach((status) => {
    if (isLocal(status.id)) {
      return // we verify this separately
    }
    const currentIndex = currentIndexForSourceGroup[status.id]
    let correctCount = 0
    if (currentIndex <= status.hits) {
      correctCount = Math.min(count, status.hits - currentIndex + 1)
    }
    // based of currentIndex and hits, we can decide if the count on the status is correct
    if (status.count !== correctCount) {
      it(`${caseDescription} status count is incorrect for ${status.id}, expected ${correctCount}, got ${status.count}`, () => {
        expect(status.count).to.equal(correctCount)
      })
    }
  })
  if (Object.values(queryStatus).length > 0) {
    const localStatuses = Object.values(queryStatus).filter((status) =>
      isLocal(status.id)
    )
    if (localStatuses.length > 0) {
      const currentLocalIndex = currentIndexForSourceGroup['local']
      const totalLocalHits = localStatuses.reduce(
        (acc, status) => acc + status.hits,
        0
      )
      const totalLocalCount = localStatuses.reduce(
        (acc, status) => acc + status.count,
        0
      )
      let correctCount = 0
      if (currentLocalIndex <= totalLocalHits) {
        correctCount = Math.min(count, totalLocalHits - currentLocalIndex + 1)
      }
      if (totalLocalCount !== correctCount) {
        it(`${caseDescription} local status count is incorrect, expected ${correctCount}, got ${totalLocalCount}`, () => {
          expect(totalLocalCount).to.equal(correctCount)
        })
      }
    }
  }
}

describe('exercise various edge cases for searches involving sources and paging', () => {
  CasesToTest.forEach((testCase) => {
    const { caseDescription, caseData, caseReturns } = testCase

    if (!caseReturns) {
      return
    }

    // first verify that the status of the case test data is not in an inconsistent state
    verifyCaseData(caseData, caseDescription)

    if (caseReturns.constrainedNextPageForSourceGroup) {
      runTest(
        `calculates next index ${caseDescription}`,
        getConstrainedNextPageForSourceGroup,
        caseData,
        caseReturns.constrainedNextPageForSourceGroup
      )
    }

    if (caseReturns.indexOfLastResultForSourceGroup) {
      runTest(
        `calculates index of last result ${caseDescription}`,
        getIndexOfLastResultForSourceGroup,
        caseData,
        caseReturns.indexOfLastResultForSourceGroup
      )
    }

    if (caseReturns.constrainedPreviousPageForSourceGroup) {
      runTest(
        `calculates previous page ${caseDescription}`,
        getConstrainedPreviousPageForSourceGroup,
        caseData,
        caseReturns.constrainedPreviousPageForSourceGroup
      )
    }

    if (caseReturns.constrainedFinalPageForSourceGroup) {
      runTest(
        `calculates final page ${caseDescription}`,
        getConstrainedFinalPageForSourceGroup,
        caseData,
        caseReturns.constrainedFinalPageForSourceGroup
      )
    }

    if (caseReturns.currentStartAndEndForSourceGroup) {
      runTest(
        `calculates current start and end ${caseDescription}`,
        getCurrentStartAndEndForSourceGroup,
        caseData,
        caseReturns.currentStartAndEndForSourceGroup
      )
    }
  })
})
