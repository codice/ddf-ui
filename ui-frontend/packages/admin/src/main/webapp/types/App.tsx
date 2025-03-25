export type ApplicationType = {
  name: string
  description: string
}

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const getDisplayName = (application: ApplicationType) => {
  if (application.description.indexOf('::') !== -1) {
    return application.description.split('::')[1]
  }
  return application.name
    .split('-')
    .map((subname) => capitalize(subname))
    .join(' ')
}

export const getDescription = (application: ApplicationType) => {
  if (application.description.indexOf('::') !== -1) {
    return application.description.split('::')[0]
  } else {
    return application.description
  }
}
