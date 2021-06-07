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
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { DarkDivider } from '../../component/dark-divider/dark-divider'
import {
  TypedUserInstance,
  useActingRole,
} from '../../component/singletons/TypedUser'
import PersonIcon from '@material-ui/icons/Person'
import { SvgIconProps } from '@material-ui/core'
const user = require('../../component/singletons/user-instance.js')

const AvailableRolesContext = React.createContext({
  availableRoles: [
    {
      value: 'user',
      label: 'user',
    },
  ],
})

const useAvailableRoles = () => {
  const { availableRoles } = React.useContext(AvailableRolesContext)
  return availableRoles
}

const RoleDisplayContext = React.createContext<{
  [key: string]: {
    abbreviated: string
    full: string
    icon: React.FC<any>
  }
}>({
  user: {
    abbreviated: 'user',
    full: 'user',
    icon: PersonIcon,
  },
})

const useRoleDisplay = () => {
  const roleDisplay = React.useContext(RoleDisplayContext)
  return roleDisplay
}

export const RoleIcon = (props: SvgIconProps) => {
  const actingRole = useActingRole()
  const roleDisplay = useRoleDisplay()
  const Icon = roleDisplay[actingRole]
    ? roleDisplay[actingRole].icon
    : PersonIcon
  return <Icon {...props} />
}

export const SmallRoleDisplay = () => {
  const actingRole = useActingRole()
  const roleDisplay = useRoleDisplay()
  const abbreviated = roleDisplay[actingRole]
    ? roleDisplay[actingRole].abbreviated
    : '?'
  return <>role:{abbreviated}</>
}

export const RoleDisplay = () => {
  const actingRole = useActingRole()
  const roleDisplay = useRoleDisplay()
  const full = roleDisplay[actingRole]
    ? roleDisplay[actingRole].full
    : 'unknown'

  return <>role:{full}</>
}

const RolesDropdown = () => {
  const actingRole = useActingRole()
  const availableRoles = useAvailableRoles()
  const roleDisplay = useRoleDisplay()

  return (
    <>
      <label>
        <div className="pb-2 font-normal text-lg">Role</div>
        <Autocomplete
          data-id="role-autocomplete"
          size="small"
          options={availableRoles}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) =>
            value ? option.value === value.value : false
          }
          renderOption={(option) => {
            const Icon = roleDisplay[actingRole]
              ? roleDisplay[option.value].icon
              : PersonIcon
            return (
              <div className="flex flex-row items-center">
                <div className="pr-2">
                  <Icon />
                </div>
                <div>{option.label}</div>
              </div>
            )
          }}
          onChange={(_e, newValue) => {
            TypedUserInstance.setActingRole(newValue.value)
          }}
          disableClearable
          value={availableRoles.find(
            (roleOption) => roleOption.value === actingRole
          )}
          renderInput={(params) => <TextField variant="outlined" {...params} />}
        />
      </label>
    </>
  )
}

const UserComponent = () => {
  const username = user.isGuest() ? 'Guest' : user.getUserName()
  const isGuest = user.isGuest()
  const email = user.getEmail()
  const signOut = () => {
    window.location.href =
      '../../logout?service=' + encodeURIComponent(window.location.href)
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-1 overflow-auto p-2">
        <div className="pb-4 flex flex-row items-center flex-no-wrap">
          <div className="pr-2">
            <RoleIcon />
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
        <RolesDropdown />
      </div>
      <DarkDivider className="my-2" />
      <div className="text-right p-2">
        {isGuest ? (
          <div />
        ) : (
          <Button
            data-id="profile-signout-button"
            variant="contained"
            color="secondary"
            onClick={signOut}
          >
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
}

export default hot(module)(UserComponent)
