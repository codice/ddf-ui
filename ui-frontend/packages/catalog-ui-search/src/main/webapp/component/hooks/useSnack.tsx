import { useContext } from 'react'
import { SnackBarContext } from '../snack/snack.provider'

const useSnack = () => useContext(SnackBarContext)

export default useSnack
