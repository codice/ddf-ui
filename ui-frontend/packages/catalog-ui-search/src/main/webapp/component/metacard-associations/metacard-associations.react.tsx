import * as React from 'react'
import { hot } from 'react-hot-loader'
import AssociationsMenuView from '../associations-menu/associations-menu.view'
import Button from '@material-ui/core/Button'
import { TypedUserInstance } from '../singletons/TypedUser'

const MetacardAssociationsView = ({ view }: { view: any }) => {
  return (
    <>
      <div className="content-menu">
        <AssociationsMenuView />
      </div>
      <div className="content-graph" />
      <div className="list-header">
        <div className="header-text header-parent">Parent</div>
        <div className="header-text header-relationship">Relationship</div>
        <div className="header-text header-child">Child</div>
      </div>
      <div className="editor-content" />
      {TypedUserInstance.canWrite(view.lazyResult) ? (
        <React.Fragment>
          <div className="list-footer">
            <div className="footer-text" />
            <Button className="footer-add">
              <span className="fa fa-plus" />
              <span>&nbsp;Add Association</span>
            </Button>
          </div>
          <div className="editor-footer">
            <Button className="footer-edit" color="primary">
              <span className="fa fa-pencil" />
              <span>&nbsp;Edit</span>
            </Button>
            <Button className="footer-cancel">
              <span className="fa fa-times" />
              <span>&nbsp;Cancel</span>
            </Button>
            <Button className="footer-save" variant="contained" color="primary">
              <span className="fa fa-floppy-o" />
              <span>&nbsp;Save</span>
            </Button>
          </div>
        </React.Fragment>
      ) : null}
    </>
  )
}

export default hot(module)(MetacardAssociationsView)
