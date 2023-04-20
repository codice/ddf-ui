import * as React from 'react'
import { hot } from 'react-hot-loader'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import FilterLeaf from './filter-leaf'
import { useTheme } from '@mui/material/styles'
import { HoverButton } from '../button/hover'
import {
  FilterBuilderClass,
  FilterClass,
  isFilterBuilderClass,
} from './filter.structure'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'
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
}: ChildFilterProps) => {
  return (
    <>
      {!isFirst ? (
        <Grid
          data-id={`filter-settings-container`}
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          wrap="nowrap"
          className="relative"
        >
          <Grid item className="p-2">
            <TextField
              data-id="filter-operator-select"
              value={parentFilter.type}
              onChange={(e) => {
                const newOperator = e.target.value as FilterBuilderClass['type']
                setFilter(
                  new FilterBuilderClass({
                    ...parentFilter,
                    type: newOperator,
                  })
                )
              }}
              select
              variant="outlined"
              size="small"
            >
              {OperatorData.map((operatorInfo) => {
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
              data-id="remove-child-filter-button"
              color="primary"
              onClick={() => {
                const newFilters = parentFilter.filters.slice(0)
                newFilters.splice(index, 1)
                setFilter(
                  new FilterBuilderClass({
                    ...parentFilter,
                    filters: newFilters,
                  })
                )
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
          setFilter={(newChildFilter) => {
            const newFilters = parentFilter.filters.slice(0)
            newFilters.splice(index, 1, newChildFilter)
            setFilter(
              new FilterBuilderClass({
                ...parentFilter,
                filters: newFilters,
              })
            )
          }}
        />
      ) : (
        <FilterLeaf
          filter={filter}
          setFilter={(newChildFilter) => {
            const newFilters = parentFilter.filters.slice(0)
            newFilters.splice(index, 1, newChildFilter)
            setFilter(
              new FilterBuilderClass({
                ...parentFilter,
                filters: newFilters,
              })
            )
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
  React.useEffect(() => {
    filter.filters.forEach((childFilter, index) => {
      if (
        isFilterBuilderClass(childFilter) &&
        childFilter.filters.length === 0
      ) {
        const newFilters = filter.filters.slice(0)
        newFilters.splice(index, 1)
        setFilter(
          new FilterBuilderClass({
            ...filter,
            filters: newFilters,
          })
        )
      }
    })
  }, [filter])

  const EnclosingElement = root ? Paper : Paper // might need to account for change from box
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
            data-id={
              root ? 'root-filter-group-container' : 'filter-group-contianer'
            }
            className={`${
              filter.negated ? 'border px-3 py-4 mt-2' : ''
            } transition-all duration-200`}
            style={{
              borderColor: theme.palette.primary.main,
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
                    data-id="add-field-button"
                    color="primary"
                    onClick={() => {
                      setFilter(
                        new FilterBuilderClass({
                          ...filter,
                          filters: filter.filters.concat([new FilterClass()]),
                        })
                      )
                    }}
                  >
                    <AddIcon className="Mui-text-text-primary" />
                    Field
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    data-id="add-group-button"
                    color="primary"
                    onClick={() => {
                      setFilter(
                        new FilterBuilderClass({
                          ...filter,
                          filters: filter.filters.concat([
                            new FilterBuilderClass(),
                          ]),
                        })
                      )
                    }}
                  >
                    <AddIcon className="Mui-text-text-primary" />
                    Group
                  </Button>
                </Grid>
                {filter.filters.length !== 0 ? (
                  <Grid item className="ml-auto">
                    <Button
                      data-id="remove-first-filter-button"
                      color="primary"
                      onClick={() => {
                        const newFilters = filter.filters.slice(0)
                        newFilters.splice(0, 1)
                        setFilter(
                          new FilterBuilderClass({
                            ...filter,
                            filters: newFilters,
                          })
                        )
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
                    setFilter(
                      new FilterBuilderClass({
                        ...filter,
                        negated: !filter.negated,
                      })
                    )
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
                  data-id="not-group-button"
                  className={`${
                    hover ? 'opacity-25' : 'opacity-0'
                  } hover:opacity-100 focus:opacity-100 transition-opacity duration-200 absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 py-0 px-1 text-xs z-10`}
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setFilter(
                      new FilterBuilderClass({
                        ...filter,
                        negated: !filter.negated,
                      })
                    )
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
