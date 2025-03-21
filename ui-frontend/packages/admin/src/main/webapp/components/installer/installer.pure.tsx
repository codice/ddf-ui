import * as React from 'react'

export type ProfileType = {
  defaultApplications: string[]
  description: string
  name: string
}

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const getDisplayName = (profile: ProfileType | undefined) => {
  if (profile === undefined) {
    return ''
  }
  return capitalize(profile.name.split('-')[1])
}

export const InstallerContext = React.createContext({
  profiles: [] as ProfileType[],
  profile: undefined as ProfileType | undefined,
  setProfile: (_profile: ProfileType | undefined) => {},
  nextStep: () => {},
  previousStep: () => {},
})
