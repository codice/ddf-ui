import * as React from 'react'
import { hot } from 'react-hot-loader'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import {
  TruncatingFilterType,
  FilterType,
} from '../../../js/model/LazyQueryResult/types'
import AddIcon from '@material-ui/icons/Add'
import Box from '@material-ui/core/Box'
const CQLUtils = require('catalog-ui-search/src/main/webapp/js/CQLUtils.js')

type QueryEditorProps = {
  query: any
}

const Field = ({ filter }: { filter: TruncatingFilterType }) => {
  return (
    <div>
      Field
      <Button />
      <Button />
    </div>
  )
}

const Examples = [
  {
    cql: '(X AND Y AND Z) OR A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'X',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Y',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'AND',
        },

        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'OR',
    },
  },
  {
    cql: '(X AND Y) OR Z OR A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'X',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Y',
            },
          ],
          type: 'AND',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'Z',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'OR',
    },
  },
  {
    cql: '((X AND Y) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '((X AND Y) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '(((NOT X) AND Y) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                  negated: true,
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '((NOT(X AND Y)) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
              ],
              negated: true,
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '((X AND (NOT Y)) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                  negated: true,
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '(((NOT X) AND (NOT Y)) OR Z) AND A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                  negated: true,
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                  negated: true,
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'OR',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: '((NOT X) AND (NOT Y) AND Z) OR A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'X',
              negated: true,
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Y',
              negated: true,
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'AND',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'OR',
    },
  },
  {
    cql: '((NOT(X AND Y) AND Z) OR A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
              ],
              type: 'AND',
              negated: true,
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'AND',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'OR',
    },
  },
  {
    cql: '((NOT((NOT X) AND (NOT Y)) AND Z) OR A',
    filterTree: {
      filters: [
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'X',
                  negated: true,
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                  negated: true,
                },
              ],
              type: 'AND',
              negated: true,
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'Z',
            },
          ],
          type: 'AND',
        },
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'A',
        },
      ],
      type: 'OR',
    },
  },
  {
    cql: 'X AND ((Y AND Z) OR (NOT A))',
    filterTree: {
      filters: [
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'X',
        },
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Z',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'A',
              negated: true,
            },
          ],
          type: 'OR',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: 'X AND ((Y AND Z) OR A)',
    filterTree: {
      filters: [
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'X',
        },
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Z',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'A',
              negated: true,
            },
          ],
          type: 'OR',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: 'X AND (Y AND Z AND A)',
    filterTree: {
      filters: [
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'X',
        },
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Z',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'A',
                },
              ],
              type: 'AND',
            },
          ],
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: 'X AND ((Y AND Z) OR A OR B)',
    filterTree: {
      filters: [
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'X',
        },
        {
          filters: [
            {
              filters: [
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Y',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'Z',
                },
              ],
              type: 'AND',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'A',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'B',
            },
          ],
          type: 'OR',
        },
      ],
      type: 'AND',
    },
  },
  {
    cql: 'X AND (((Y AND Z) OR A) AND B)',
    filterTree: {
      filters: [
        {
          type: 'ILIKE',
          property: 'anyText',
          value: 'X',
        },
        {
          filters: [
            {
              filters: [
                {
                  filters: [
                    {
                      type: 'ILIKE',
                      property: 'anyText',
                      value: 'Y',
                    },
                    {
                      type: 'ILIKE',
                      property: 'anyText',
                      value: 'Z',
                    },
                  ],
                  type: 'AND',
                },
                {
                  type: 'ILIKE',
                  property: 'anyText',
                  value: 'A',
                },
              ],
              type: 'OR',
            },
            {
              type: 'ILIKE',
              property: 'anyText',
              value: 'B',
            },
          ],
          type: 'AND',
        },
      ],
      type: 'AND',
    },
  },
] as {
  cql: string
  filterTree: FilterType
}[]

/**
 * Composed of fields, each with a remove button, and at the bottom buttons to add another field or group
 */
const Group = ({ filter }: { filter: FilterType }) => {
  return (
    <>
      <div>Group</div>
      {filter.filters.map(subfilter => {
        if (isTruncatingFilter({ filter: subfilter })) {
          return <Field filter={subfilter as TruncatingFilterType} />
        } else {
          return <Group filter={subfilter as FilterType} />
        }
      })}
      <div>Group</div>
      <Grid container direction="row" alignItems="center" className="w-full">
        <Grid item>
          <Button variant="text" color="inherit">
            <AddIcon /> <Box color="primary.main">Field</Box>
          </Button>
        </Grid>
        <Grid item>
          <Button>
            <AddIcon /> <Box color="primary.main">Group</Box>
          </Button>
        </Grid>
        <Grid item className="ml-auto">
          <Button>
            <Box color="primary.main">Remove</Box>
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

const transformFilterTree = ({
  filterTree,
}: {
  filterTree: TruncatingFilterType | FilterType
}): FilterType => {
  if (isTruncatingFilter({ filter: filterTree })) {
    return {
      filters: [filterTree],
      type: 'AND',
    }
  }
  return filterTree as FilterType
}

const isTruncatingFilter = ({
  filter,
}: {
  filter: FilterType | TruncatingFilterType
}) => {
  return filter.filters === undefined
}

export const QueryEditor = ({ query }: QueryEditorProps) => {
  const [filterTree, setFilterTree] = React.useState<FilterType>(
    transformFilterTree({ filterTree: query.get('filterTree') })
  )
  console.log(filterTree)
  const { listenTo } = useBackbone()

  React.useEffect(() => {
    listenTo(query, 'change:filterTree', () => {
      setFilterTree(
        transformFilterTree({ filterTree: query.get('filterTree') })
      )
    })
  }, [])

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className="px-3 py-2"
    >
      <Group filter={filterTree} />
    </Grid>
  )
}

export default hot(module)(QueryEditor)
