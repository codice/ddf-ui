import * as React from 'react'
import { hot } from 'react-hot-loader'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FilterLeaf from './filter-leaf'
import useTheme from '@material-ui/core/styles/useTheme'
import { HoverButton } from '../button/hover'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from './filter.structure'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import AddIcon from '@material-ui/icons/Add'
import _ from 'lodash'
import { Memo } from '../memo/memo'
import { Elevations } from '../theme/theme'
const OperatorData = [
  {
    label: 'AND',
    value: 'AND',
  },
  {
    label: 'OR',
    value: 'OR',
  },
  {
    label: 'NOT AND',
    value: 'NOT AND',
  },
  {
    label: 'NOT OR',
    value: 'NOT OR',
  },
]

type ChildFilterProps = {
  parentFilter: FilterBuilderClass
  filter: FilterBuilderClass | FilterClass
  setFilter: (filter: FilterBuilderClass) => void
  index: number
  isFirst: boolean
  isLast: boolean
}

const ChildFilter = ({
  parentFilter,
  filter,
  setFilter,
  index,
  isFirst,
  isLast,
}: ChildFilterProps) => {
  return (
    <>
      {!isFirst ? (
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="center"
          wrap="nowrap"
          className="relative"
        >
          <Grid item className="p-2">
            <TextField
              value={parentFilter.type}
              onChange={e => {
                const newOperator = e.target.value as FilterBuilderClass['type']
                setFilter({
                  ...parentFilter,
                  type: newOperator,
                })
              }}
              select
              variant="outlined"
              size="small"
            >
              {OperatorData.map(operatorInfo => {
                return (
                  <MenuItem key={operatorInfo.value} value={operatorInfo.value}>
                    {operatorInfo.label}
                  </MenuItem>
                )
              })}
            </TextField>
          </Grid>
          <Grid item className="ml-auto position absolute right-0">
            <Button
              color="primary"
              onClick={() => {
                const newFilters = parentFilter.filters.slice(0)
                newFilters.splice(index, 1)
                setFilter({
                  ...parentFilter,
                  filters: newFilters,
                })
              }}
            >
              Remove
            </Button>
          </Grid>
        </Grid>
      ) : null}
      {isFilterBuilderClass(filter) ? (
        <FilterBranch
          filter={filter}
          setFilter={newChildFilter => {
            const newFilters = parentFilter.filters.slice(0)
            newFilters.splice(index, 1, newChildFilter)
            setFilter({
              ...parentFilter,
              filters: newFilters,
            })
          }}
        />
      ) : (
        <FilterLeaf
          filter={filter}
          setFilter={newChildFilter => {
            const newFilters = parentFilter.filters.slice(0)
            newFilters.splice(index, 1, newChildFilter)
            setFilter({
              ...parentFilter,
              filters: newFilters,
            })
          }}
        />
      )}
    </>
  )
}

type Props = {
  filter: FilterBuilderClass
  setFilter: (filter: FilterBuilderClass) => void
  root?: boolean
}

const FilterBranch = ({ filter, setFilter, root = false }: Props) => {
  const [hover, setHover] = React.useState(false)
  const theme = useTheme()

  /**
   * Any non root branches lacking filters are pruned.
   */
  React.useEffect(
    () => {
      filter.filters.forEach((childFilter, index) => {
        if (
          isFilterBuilderClass(childFilter) &&
          childFilter.filters.length === 0
        ) {
          const newFilters = filter.filters.slice(0)
          newFilters.splice(index, 1)
          setFilter({
            ...filter,
            filters: newFilters,
          })
        }
      })
    },
    [filter]
  )

  const EnclosingElement = root ? Box : Paper
  return (
    <div
      onMouseOver={() => {
        setHover(true)
      }}
      onMouseOut={() => {
        setHover(false)
      }}
    >
      <EnclosingElement
        elevation={Elevations.panels}
        className={root ? '' : 'px-3 py-2'}
      >
        <div className=" relative">
          <div
            className={`${
              filter.negated ? 'border px-3 py-4 mt-2' : ''
            } transition-all duration-200`}
            style={{
              borderColor: theme.palette.secondary.main,
            }}
          >
            <Grid item className="w-full filter-actions">
              <Grid
                container
                direction="row"
                alignItems="center"
                className="w-full"
              >
                <Grid item>
                  <Button
                    color="primary"
                    onClick={() => {
                      setFilter({
                        ...filter,
                        filters: filter.filters.concat([new FilterClass()]),
                      })
                    }}
                  >
                    <Box color="text.primary">
                      <AddIcon />
                    </Box>
                    Field
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color="primary"
                    onClick={() => {
                      setFilter({
                        ...filter,
                        filters: filter.filters.concat([
                          new FilterBuilderClass(),
                        ]),
                      })
                    }}
                  >
                    <Box color="text.primary">
                      <AddIcon />
                    </Box>
                    Group
                  </Button>
                </Grid>
                {filter.filters.length !== 0 ? (
                  <Grid item className="ml-auto">
                    <Button
                      color="primary"
                      onClick={() => {
                        const newFilters = filter.filters.slice(0)
                        newFilters.splice(0, 1)
                        setFilter({
                          ...filter,
                          filters: newFilters,
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
            {filter.negated ? (
              <>
                <HoverButton
                  className={`absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 py-0 px-1 text-xs z-10`}
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setFilter({
                      ...filter,
                      negated: !filter.negated,
                    })
                  }}
                >
                  {({ hover }) => {
                    if (hover) {
                      return <>Remove Not</>
                    } else {
                      return <>NOT</>
                    }
                  }}
                </HoverButton>
              </>
            ) : (
              <>
                <Button
                  className={`${
                    hover ? 'opacity-25' : 'opacity-0'
                  } hover:opacity-100 focus:opacity-100 transition-opacity duration-200 absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 py-0 px-1 text-xs z-10`}
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setFilter({
                      ...filter,
                      negated: !filter.negated,
                    })
                  }}
                >
                  + Not Group
                </Button>
              </>
            )}
            <Memo dependencies={[filter]}>
              <>
                {filter.filters.map((childFilter, index) => {
                  return (
                    <ChildFilter
                      key={childFilter.id}
                      parentFilter={filter}
                      filter={childFilter}
                      setFilter={setFilter}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === filter.filters.length - 1}
                    />
                  )
                })}
              </>
            </Memo>
          </div>
        </div>
      </EnclosingElement>
    </div>
  )
}
export default hot(module)(FilterBranch)
