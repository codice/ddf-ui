import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import { HoverButton } from '../button/hover'
import { FilterClass } from './filter.structure'
import FilterPropertyAutocomplete from '../../react-component/filter/filter'
import { Memo } from '../memo/memo'
import { ValidationResult } from '../../react-component/location/validators'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
  errorListener?: (validationResults: {
    [key: string]: ValidationResult | undefined
  }) => void
}

export const FilterNegationControls = ({
  filter,
  setFilter,
  children,
}: Props & {
  children: React.ReactNode
}) => {
  const [hover, setHover] = React.useState(false)
  const theme = useTheme()
  return (
    <div
      className="relative"
      onMouseOver={() => {
        setHover(true)
      }}
      onMouseOut={() => {
        setHover(false)
      }}
    >
      {filter.negated ? (
        <HoverButton
          data-id="remove-not-button"
          className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
          color="primary"
          variant="contained"
          onClick={() => {
            setFilter(
              new FilterClass({
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
      ) : (
        <Button
          data-id="not-field-button"
          className={`${
            hover ? 'opacity-25' : 'opacity-0'
          } hover:opacity-100 focus:opacity-100 transition-opacity duration-200 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
          color="primary"
          variant="contained"
          onClick={() => {
            setFilter(
              new FilterClass({
                ...filter,
                negated: !filter.negated,
              })
            )
          }}
        >
          + Not Field
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
        {children}
      </div>
    </div>
  )
}

const FilterLeaf = ({ filter, setFilter, errorListener }: Props) => {
  return (
    <FilterNegationControls filter={filter} setFilter={setFilter}>
      <Memo dependencies={[filter, setFilter]}>
        <FilterPropertyAutocomplete
          filter={filter}
          setFilter={setFilter}
          errorListener={errorListener}
        />
      </Memo>
    </FilterNegationControls>
  )
}
export default hot(module)(FilterLeaf)
