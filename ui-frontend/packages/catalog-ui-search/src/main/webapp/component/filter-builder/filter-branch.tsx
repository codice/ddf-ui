import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@material-ui/core/Button'
import MRC from '../../react-component/marionette-region-container'
import Paper from '@material-ui/core/Paper'

const FilterBranch = ({ view, item }: { view: any; item: any }) => {
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
        } focus:opacity-100 transition-opacity duration-200 absolute left-0 transform -translate-y-1/2 p-0 text-xs z-10`}
        color="primary"
        variant="contained"
      >
        + Not
      </Button>
      <Paper elevation={10} className="p-2 ">
        <MRC
          key={item.cid}
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
      </Paper>
    </div>
  )
}
export default hot(module)(FilterBranch)
