import { SnackProps } from './snack.provider'

export const CLOSEABLE_ERROR = {
  status: 'error',
  closeable: true,
  timeout: 10000,
} as SnackProps

export const CLOSEABLE_WARNING = {
  status: 'warning',
  closeable: true,
  timeout: 10000,
} as SnackProps
