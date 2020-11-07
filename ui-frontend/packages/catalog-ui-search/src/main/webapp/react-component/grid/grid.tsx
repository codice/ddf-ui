import * as React from 'react'
import Grid, { GridProps } from '@material-ui/core/Grid'
import styled from 'styled-components'

export const WrappedGrid = styled(
  React.forwardRef((props: GridProps, ref: React.Ref<any>) => {
    return <Grid {...props} ref={ref} />
  })
)<GridProps>`` as React.ComponentType<GridProps>

const GridItem = styled(WrappedGrid)`
  > * {
    height: 100%;
  }
`

type CardGridProps = {
  gridProps?: GridProps
  gridItemProps?: GridProps
  children?: React.ReactNode
}

export const WrappedCardGridItem = ({
  children,
  gridItemProps,
}: CardGridProps) => {
  return (
    // @ts-ignore
    <GridItem {...gridItemProps} item xs={12} sm={6} md={4} lg={3} xl={2}>
      {children}
    </GridItem>
  )
}

export const WrappedCardGrid = styled(
  ({ gridProps, children }: CardGridProps) => {
    return (
      // @ts-ignore
      <WrappedGrid
        container
        spacing={3}
        direction="row"
        justify="flex-start"
        wrap="wrap"
        {...gridProps}
      >
        {children}
      </WrappedGrid>
    )
  }
)<CardGridProps>`` as React.ComponentType<CardGridProps>
