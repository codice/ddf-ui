import { Suspense } from 'react'
import { Skeleton } from '@mui/material'

export const SuspenseWrapper = ({
  fallback,
  children,
}: {
  fallback?: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <Suspense
      fallback={
        fallback ?? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}
