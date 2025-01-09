import * as React from 'react'

// Convenience wrapper around memo

type MemoProps = {
  children: React.ReactNode | React.ReactNode[]
  dependencies?: any[]
}

export const Memo = ({ dependencies = [], children }: MemoProps) => {
  return React.useMemo(() => {
    return <>{children}</>
  }, dependencies)
}
