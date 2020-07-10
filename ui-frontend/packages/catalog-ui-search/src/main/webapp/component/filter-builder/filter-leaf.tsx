import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import MRC from '../../react-component/marionette-region-container'

const FilterLeaf = ({ view, item }: { view: any; item: any }) => {
  const [hover, setHover] = React.useState(false)
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
      <Button
        className={`${
          hover ? 'opacity-100' : 'opacity-0'
        } focus:opacity-100 transition-opacity duration-200 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-0 text-xs z-10`}
        color="primary"
        variant="contained"
      >
        + Not
      </Button>
      <MRC
        view={item.type === 'filter' ? view.filterView : view.constructor}
        viewOptions={{
          isChild: true,
          model: item,
          editing: true,
          suggester: view.options.suggester,
          includedAttributes: view.options.includedAttributes,
          supportedAttributes: view.options.supportedAttributes,
        }}
      />
    </div>
  )
}
export default hot(module)(FilterLeaf)
