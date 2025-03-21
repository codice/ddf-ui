import * as React from 'react'
import { COMMANDS } from '../fetch/fetch'
import { setType } from '../../typescript/hooks'

const getLatestExpiry = async ({
  setSessionRenewDate,
}: {
  setSessionRenewDate: setType<number>
}) => {
  const msUntilTimeout = await COMMANDS.SESSION.EXPIRY()
  var msUntilAutoRenew = Math.max(msUntilTimeout * 0.7, msUntilTimeout - 60000) // 70% or at least one minute before
  setSessionRenewDate(Date.now() + msUntilAutoRenew)
}

export const SessionRefresher = () => {
  const [sessionRenewDate, setSessionRenewDate] = React.useState(
    undefined as number | undefined
  )
  React.useEffect(() => {
    getLatestExpiry({ setSessionRenewDate })
  }, [])
  React.useEffect(() => {
    if (sessionRenewDate === undefined) {
      return
    }
    const timeoutId = setTimeout(async () => {
      await COMMANDS.SESSION.RENEW()
      getLatestExpiry({ setSessionRenewDate })
    }, sessionRenewDate - Date.now())
    return () => {
      clearTimeout(timeoutId)
    }
  }, [sessionRenewDate])

  return null
}
