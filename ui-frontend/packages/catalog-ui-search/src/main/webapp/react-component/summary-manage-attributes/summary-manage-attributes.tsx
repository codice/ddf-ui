/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import user from '../../component/singletons/user-instance'
import TransferList from '../../component/tabs/metacard/transfer-list'
import { TypedUserInstance } from '../../component/singletons/TypedUser'
import { StartupDataStore } from '../../js/model/Startup/startup'

export default ({ isExport = false }: { isExport?: boolean }) => {
  const requiredAttributes =
    StartupDataStore.Configuration.getRequiredExportAttributes()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        data-id="manage-attributes-button"
        onClick={() => setOpen(true)}
        color="primary"
        size="small"
        style={{ height: 'auto' }}
      >
        {isExport ? 'Select Attributes to Export' : 'Manage Attributes'}
      </Button>

      <Dialog open={open} disableEnforceFocus maxWidth="md" fullWidth>
        <TransferList
          startingLeft={TypedUserInstance.getResultsAttributesSummaryShown()}
          requiredAttributes={requiredAttributes}
          startingRight={TypedUserInstance.getResultsAttributesPossibleSummaryShown()}
          startingHideEmpty={user
            .get('user')
            .get('preferences')
            .get('inspector-hideEmpty')}
          onSave={(active: any, newHideEmpty: any) => {
            user.get('user').get('preferences').set({
              'inspector-summaryShown': active,
              'inspector-hideEmpty': newHideEmpty,
            })
            user.savePreferences()
          }}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    </>
  )
}
