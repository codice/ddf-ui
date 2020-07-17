import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import MRC from '../../react-component/marionette-region-container'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useTheme } from '@material-ui/core'
import { HoverButton } from '../button/hover'
import { FilterClass } from './filter.structure'
import Filter from '../../react-component/filter/filter'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

const FilterLeaf = ({ filter, setFilter }: Props) => {
  const [hover, setHover] = React.useState(false)
  const theme = useTheme()
  return (
    <div
      className="relative"
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
      {filter.negated ? (
        <HoverButton
          className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
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
          } focus:opacity-100 transition-opacity duration-200 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
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
        <Filter filter={filter} setFilter={setFilter} />
      </div>
    </div>
  )
}
export default hot(module)(FilterLeaf)
