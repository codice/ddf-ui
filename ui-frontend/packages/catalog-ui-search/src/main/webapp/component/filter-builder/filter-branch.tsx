import * as React from 'react'
import { hot } from 'react-hot-loader'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FilterLeaf from './filter-leaf'
import { useTheme } from '@material-ui/core/styles'
import { HoverButton } from '../button/hover'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from './filter.structure'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import AddIcon from '@material-ui/icons/Add'

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

type Props = {
  filter: FilterBuilderClass
  setFilter: (filter: FilterBuilderClass) => void
}

const FilterBranch = ({ filter, setFilter }: Props) => {
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

  return (
    <div
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseOver={() => {
        setHover(true)
      }}
      onMouseOut={() => {
        setHover(false)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
    >
      <Paper elevation={10} className="p-2 ">
        <div className="relative">
          {filter.negated ? (
            <HoverButton
              className={`absolute left-0 transform -translate-y-1/2 py-0 px-1 text-xs z-10`}
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
          ) : (
            <Button
              className={`${
                hover ? 'opacity-100' : 'opacity-0'
              } focus:opacity-100 transition-opacity duration-200 absolute left-0 transform -translate-y-1/2 py-0 px-1 text-xs z-10`}
              color="primary"
              variant="contained"
              onClick={() => {
                setFilter({
                  ...filter,
                  negated: !filter.negated,
                })
              }}
            >
              + Not
            </Button>
          )}
          <div
            className={`${
              filter.negated ? 'border px-3 py-4 mt-2' : ''
            } transition-all duration-200`}
            style={{
              borderColor: theme.palette.primary.main,
            }}
          >
            {filter.filters.map((childFilter, index) => {
              return (
                <React.Fragment key={index}>
                  {index > 0 ? (
                    <Grid
                      container
                      direction="row"
                      alignItems="center"
                      justify="center"
                      wrap="nowrap"
                    >
                      <Grid item className="p-4">
                        <TextField
                          value={filter.operator}
                          onChange={e => {
                            const newOperator = e.target
                              .value as FilterBuilderClass['operator']
                            setFilter({
                              ...filter,
                              operator: newOperator,
                            })
                          }}
                          select
                          variant="outlined"
                        >
                          {OperatorData.map(operatorInfo => {
                            return (
                              <MenuItem
                                key={operatorInfo.value}
                                value={operatorInfo.value}
                              >
                                {operatorInfo.label}
                              </MenuItem>
                            )
                          })}
                        </TextField>
                      </Grid>
                    </Grid>
                  ) : null}
                  {isFilterBuilderClass(childFilter) ? (
                    <FilterBranch
                      filter={childFilter}
                      setFilter={newChildFilter => {
                        const newFilters = filter.filters.slice(0)
                        newFilters.splice(index, 1, newChildFilter)
                        setFilter({
                          ...filter,
                          filters: newFilters,
                        })
                      }}
                    />
                  ) : (
                    <FilterLeaf
                      filter={childFilter}
                      setFilter={newChildFilter => {
                        const newFilters = filter.filters.slice(0)
                        newFilters.splice(index, 1, newChildFilter)
                        setFilter({
                          ...filter,
                          filters: newFilters,
                        })
                      }}
                    />
                  )}
                  {!isFilterBuilderClass(childFilter) ? (
                    <Grid item className="w-full filter-actions">
                      <Grid
                        container
                        direction="row"
                        alignItems="center"
                        className="w-full"
                      >
                        {index === filter.filters.length - 1 ? (
                          <>
                            <Grid item>
                              <Button
                                onClick={() => {
                                  setFilter({
                                    ...filter,
                                    filters: filter.filters.concat([
                                      new FilterClass(),
                                    ]),
                                  })
                                }}
                              >
                                <AddIcon />
                                <Box color="primary.main">Field</Box>
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                onClick={() => {
                                  setFilter({
                                    ...filter,
                                    filters: filter.filters.concat([
                                      new FilterBuilderClass(),
                                    ]),
                                  })
                                }}
                              >
                                <AddIcon />
                                <Box color="primary.main">Group</Box>
                              </Button>
                            </Grid>
                          </>
                        ) : null}
                        <Grid item className="ml-auto">
                          <Button
                            onClick={() => {
                              const newFilters = filter.filters.slice(0)
                              newFilters.splice(index, 1)
                              setFilter({
                                ...filter,
                                filters: newFilters,
                              })
                            }}
                          >
                            <Box color="primary.main">Remove</Box>
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  ) : null}
                </React.Fragment>
              )
            })}
            {filter.filters.length >= 1 &&
            !isFilterBuilderClass(filter.filters[filter.filters.length - 1]) ? (
              <></>
            ) : (
              <Grid item className="w-full filter-actions">
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  className="w-full"
                >
                  <Grid item>
                    <Button
                      onClick={() => {
                        setFilter({
                          ...filter,
                          filters: filter.filters.concat([new FilterClass()]),
                        })
                      }}
                    >
                      <AddIcon />
                      <Box color="primary.main">Field</Box>
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      onClick={() => {
                        setFilter({
                          ...filter,
                          filters: filter.filters.concat([
                            new FilterBuilderClass(),
                          ]),
                        })
                      }}
                    >
                      <AddIcon />
                      <Box color="primary.main">Group</Box>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </div>
        </div>
      </Paper>
    </div>
  )
}
export default hot(module)(FilterBranch)
