// since this doesn't have any dependencies, it's better off in it's own file
export const useElevatedRightsCookieName = 'useElevatedRights'

export function getIsUsingElevatedRights(): boolean {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${useElevatedRightsCookieName}=`))
  if (cookie) {
    return cookie.split('=')[1] === 'true'
  }
  return false
}

export function setIsUsingElevatedRights(value: boolean) {
  document.cookie = `${useElevatedRightsCookieName}=${value}; path=/`
}
