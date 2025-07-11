import * as React from 'react'
import Button from '@mui/material/Button'
import GetAppIcon from '@mui/icons-material/GetApp'
import { Grid2 } from '@mui/material'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { useDownloadComponent } from '../download/download'
import { useDialog } from '../dialog'

type DownloadButtonProps = {
  lazyResult: LazyQueryResult
}

export const DownloadButton = ({ lazyResult }: DownloadButtonProps) => {
    const DownloadComponent = useDownloadComponent()
    const { setProps } = useDialog()

    return (
        <Grid2 className="h-full">
            <Button
            component="div"
            data-id="download-button"
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                e.stopPropagation()
                setProps({
                open: true,
                children: <DownloadComponent lazyResults={[lazyResult]} />,
                })
            }}
            style={{ height: '100%' }}
            size="small"
            disabled={lazyResult.getDownloadUrl() ? false : true}
            >
            <GetAppIcon />
            </Button>
        </Grid2>
    )
}