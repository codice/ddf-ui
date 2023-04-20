import * as React from 'react'
import Card, { CardProps } from '@mui/material/Card'
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader'
import CardActions, { CardActionsProps } from '@mui/material/CardActions'
import CardContent, { CardContentProps } from '@mui/material/CardContent'
import CardActionArea, {
  CardActionAreaProps,
} from '@mui/material/CardActionArea'
import Typography, { TypographyProps } from '@mui/material/Typography'
import styled from 'styled-components'
import CreateIcon from '@mui/icons-material/AddBox'

export const ZeroWidthSpace = () => {
  return <>{String.fromCharCode(8203)}</>
}

export const WrappedHeader = ({ title, ...otherProps }: CardHeaderProps) => {
  return (
    <CardHeader
      title={
        <>
          {title}
          <ZeroWidthSpace />
        </>
      }
      {...otherProps}
    />
  )
}

export const WrappedCard = styled(
  React.forwardRef((props: CardProps, ref: React.Ref<any>) => {
    return <Card {...props} ref={ref} />
  })
)<CardProps>`` as React.ComponentType<CardProps>

export const WrappedCardActions = styled(
  React.forwardRef((props: CardActionsProps, ref: React.Ref<any>) => {
    return <CardActions {...props} ref={ref} />
  })
)<CardActionsProps>`` as React.ComponentType<CardActionsProps>

export const WrappedCardContent = styled(
  React.forwardRef((props: CardContentProps, ref: React.Ref<any>) => {
    return <CardContent {...props} ref={ref} />
  })
)<CardContentProps>`` as React.ComponentType<CardContentProps>

export const WrappedCardContentLabel = (props: TypographyProps) => {
  return <Typography {...props} noWrap style={{ opacity: 0.6 }} />
}

export const WrappedCardContentValue = ({
  children,
  ...otherProps
}: TypographyProps) => {
  return (
    <Typography {...otherProps} noWrap>
      {children}
      <ZeroWidthSpace />
    </Typography>
  )
}

export const WrappedCardActionArea = styled(
  React.forwardRef((props: CardActionAreaProps, ref: React.Ref<any>) => {
    return <CardActionArea {...props} ref={ref} />
  })
)<CardActionAreaProps>``

type CreateCardProps = {
  text: string
  cardProps?: CardProps
}

export const CreateCard = styled(
  React.forwardRef((props: CreateCardProps, ref: React.Ref<any>) => {
    return (
      <WrappedCard {...props.cardProps} ref={ref}>
        <WrappedCardActionArea
          style={{
            height: '100%',
            textAlign: 'center',
          }}
        >
          <WrappedCardContent>
            <CreateIcon
              style={{
                fontSize: '7rem',
              }}
            />
            <h1>{props.text}</h1>
          </WrappedCardContent>
        </WrappedCardActionArea>
      </WrappedCard>
    )
  })
)<CreateCardProps>``
