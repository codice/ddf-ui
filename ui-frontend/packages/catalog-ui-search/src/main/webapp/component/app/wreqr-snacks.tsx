import React from 'react'
import useSnack from '../hooks/useSnack'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import { SnackProps } from '../snack/snack.provider'
import wreqr from '../../js/wreqr'
/**
 *  Would be nice to eventually remove, but for now this is easier than removing announcements from non view areas
 */
export const WreqrSnacks = () => {
  const addSnack = useSnack()
  useListenTo(
    (wreqr as any).vent,
    'snack',
    ({ message, snackProps }: { message: string; snackProps: SnackProps }) => {
      addSnack(message, snackProps)
    }
  )
  return <></>
}
