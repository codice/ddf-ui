import * as React from 'react'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useDialog } from '../dialog'
import { Overridable } from '../../js/model/Base/base-classes'
import { useOverridable } from '../../js/model/Base/base-classes.hooks'

export const normalDownload = ({ result }: { result: LazyQueryResult }) => {
  const downloadUrl = result.getDownloadUrl()
  downloadUrl && window.open(downloadUrl)
}

// in ddf-ui, we just open the download url and immediately close the dialog, so it should act as before
export const BaseDownload = ({
  lazyResults,
}: {
  lazyResults: LazyQueryResult[]
}) => {
  const { setProps } = useDialog()

  React.useEffect(() => {
    lazyResults.forEach((lazyResult) => {
      normalDownload({ result: lazyResult })
    })
    setProps({ open: false })
  }, [])

  return <></>
}

export const OverridableDownload = new Overridable(BaseDownload)

export const useDownloadComponent = () => {
  return useOverridable(OverridableDownload)
}
