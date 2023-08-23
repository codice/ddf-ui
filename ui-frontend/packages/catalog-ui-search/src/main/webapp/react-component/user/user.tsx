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
import * as React from 'react'
import { hot } from 'react-hot-loader'
import Button from '@mui/material/Button'
import { DarkDivider } from '../../component/dark-divider/dark-divider'
import {
  TypedUserInstance,
  useActingRole,
} from '../../component/singletons/TypedUser'
import PersonIcon from '@mui/icons-material/Person'
import user from '../../component/singletons/user-instance'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import ExtensionPoints from '../../extension-points/extension-points'

export const EnhancedRolesContext = React.createContext<{
  enhancedRoles: string[]
}>({
  enhancedRoles: [],
})

const useEnhancedRoles = () => {
  const { enhancedRoles } = React.useContext(EnhancedRolesContext)
  return enhancedRoles
}

export const RoleDisplay = () => {
  const actingRole = useActingRole()
  const enhancedRoles = useEnhancedRoles()

  if (actingRole === 'enhanced' && enhancedRoles.length > 0) {
    return <>Advanced</>
  }
  return null
}

const RolesToggle = () => {
  const actingRole = useActingRole()
  const enhancedRoles = useEnhancedRoles()

  if (!enhancedRoles || enhancedRoles.length === 0) {
    return null
  }

  return (
    <div className="ml-1 pt-4">
      <div className="font-normal text-lg">Role</div>
      <FormControlLabel
        className="pb-4"
        label={<Typography variant="body2">Advanced</Typography>}
        control={
          <Switch
            color="primary"
            checked={actingRole === 'enhanced'}
            onChange={(e) =>
              TypedUserInstance.setActingRole(
                e.target.checked ? 'enhanced' : 'user'
              )
            }
          />
        }
      />
      <div className={`${actingRole === 'user' ? 'opacity-50' : ''}`}>
        <div className="pb-1 font-normal italic">My Advanced Roles</div>
        {enhancedRoles.map((role) => {
          return <div className="text-sm">{role}</div>
        })}
      </div>
    </div>
  )
}

const UserComponent = () => {
  const username = user.getUserName()
  const email = user.getEmail()
  const signOut = () => {
    window.location.href =
      '../../logout?service=' + encodeURIComponent(window.location.href)
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="shrink-1 overflow-auto p-2">
        <div className="flex flex-row items-center flex-nowrap">
          <div className="pr-2">
            <PersonIcon />
          </div>
          <div>
            <div
              data-id="profile-username"
              className="info-username is-large-font is-bold"
            >
              {username}
            </div>
            <div data-id="profile-email" className="info-email is-medium-font">
              {email}
            </div>
          </div>
        </div>
        <RolesToggle />
        <ExtensionPoints.userInformation />
      </div>
      <DarkDivider className="my-2 shrink-0" />
      <div className="text-right p-2 shrink-0">
        <Button
          data-id="profile-signout-button"
          color="primary"
          variant="contained"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default hot(module)(UserComponent)
