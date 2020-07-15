import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import MRC from '../../react-component/marionette-region-container'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import { useTheme } from '@material-ui/core'
import { HoverButton } from '../button/hover'

const FilterLeaf = ({ view, item }: { view: any; item: any }) => {
  const [hover, setHover] = React.useState(false)
  const [negated, setNegated] = React.useState(Boolean(item.get('negated')))
  const { listenTo } = useBackbone()
  const theme = useTheme()
  React.useEffect(() => {
    listenTo(item, 'change', () => {
      setNegated(Boolean(item.get('negated')))
    })
  }, [])
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
      {negated ? (
        <HoverButton
          className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 py-0 px-1 text-xs z-10`}
          color="primary"
          variant="contained"
          onClick={() => {
            item.set('negated', !Boolean(item.get('negated')))
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
            item.set('negated', !Boolean(item.get('negated')))
          }}
        >
          + Not
        </Button>
      )}
      <MRC
        view={item.type === 'filter' ? view.filterView : view.constructor}
        viewOptions={{
          isChild: true,
          model: item,
          editing: true,
          suggester: view.options.suggester,
          includedAttributes: view.options.includedAttributes,
        }}
        className={`${
          negated ? 'border px-3 py-4 mt-2' : ''
        } transition-all duration-200`}
        style={{
          borderColor: theme.palette.primary.main,
        }}
      />
    </div>
  )
}
export default hot(module)(FilterLeaf)
