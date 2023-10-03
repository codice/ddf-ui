import * as React from 'react'
import Button from '@mui/material/Button'
import user from '../../component//singletons/user-instance'
import TransferList from '../../component//tabs/metacard/transfer-list'
import { Elevations } from '../../component//theme/theme'
import { useDialog } from '../../component//dialog'
import { TypedUserInstance } from '../../component/singletons/TypedUser'

export default () => {
  const dialogContext = useDialog()
  return (
    <Button
      data-id="manage-attributes-button"
      onClick={() => {
        dialogContext.setProps({
          PaperProps: {
            style: {
              minWidth: 'none',
            },
            elevation: Elevations.panels,
          },
          open: true,
          disableEnforceFocus: true,
          children: (
            <div
              style={{
                minHeight: '60vh',
              }}
            >
              <TransferList
                startingLeft={user
                  .get('user')
                  .get('preferences')
                  .get('inspector-summaryShown')}
                startingRight={TypedUserInstance.getResultsAttributesPossibleTable()}
                startingHideEmpty={user
                  .get('user')
                  .get('preferences')
                  .get('inspector-hideEmpty')}
                onSave={async (active: any, newHideEmpty: any) => {
                  user.get('user').get('preferences').set({
                    'inspector-summaryShown': active,
                    'inspector-hideEmpty': newHideEmpty,
                  })
                  user.savePreferences()
                }}
              />
            </div>
          ),
        })
      }}
      color="primary"
      size="small"
      style={{ height: 'auto' }}
    >
      Manage Attributes
    </Button>
  )
}
