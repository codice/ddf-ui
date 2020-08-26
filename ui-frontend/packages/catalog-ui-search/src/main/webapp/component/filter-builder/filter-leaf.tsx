import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import useTheme from '@material-ui/core/styles/useTheme'
import { HoverButton } from '../button/hover'
import { FilterClass } from './filter.structure'
import Filter from '../../react-component/filter/filter'
import { Memo } from '../memo/memo'

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
      onMouseOver={() => {
        setHover(true)
      }}
      onMouseOut={() => {
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
            hover ? 'opacity-25' : 'opacity-0'
          } hover:opacity-100 focus:opacity-100 transition-opacity duration-200 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
          color="primary"
          variant="contained"
          onClick={() => {
            setFilter({
              ...filter,
              negated: !filter.negated,
            })
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
          borderColor: theme.palette.secondary.main,
        }}
      >
        <Memo dependencies={[filter, setFilter]}>
          <Filter filter={filter} setFilter={setFilter} />
        </Memo>
      </div>
    </div>
  )
}
export default hot(module)(FilterLeaf)
