import * as React from 'react'
import Card, { CardProps } from '@material-ui/core/Card'
import CardHeader, { CardHeaderProps } from '@material-ui/core/CardHeader'
import CardActions, { CardActionsProps } from '@material-ui/core/CardActions'
import CardContent, { CardContentProps } from '@material-ui/core/CardContent'
import CardActionArea, {
  CardActionAreaProps,
} from '@material-ui/core/CardActionArea'
import Typography, { TypographyProps } from '@material-ui/core/Typography'
import styled from 'styled-components'
import CreateIcon from '@material-ui/icons/AddBox'

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
    return <CardActionArea {...props} buttonRef={ref} />
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
