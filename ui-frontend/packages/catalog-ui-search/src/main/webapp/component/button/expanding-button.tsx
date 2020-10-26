import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button, { ButtonProps } from '@material-ui/core/Button'
import { LinkProps, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader'

type ExpandingButtonProps =
  | (ButtonProps & {
      expanded: boolean
      Icon?: React.FC<React.HTMLAttributes<HTMLDivElement>>
      iconPosition?: 'start' | 'end'
      expandedText: string
      unexpandedText: string
      component?: undefined
    })
  | (ButtonProps & {
      expanded: boolean
      Icon?: React.FC<React.HTMLAttributes<HTMLDivElement>>
      iconPosition?: 'start' | 'end'
      expandedText: string
      unexpandedText: string
      component: typeof Link
    } & Partial<LinkProps>)
  | (ButtonProps & {
      expanded: boolean
      Icon?: React.FC<React.HTMLAttributes<HTMLDivElement>>
      iconPosition?: 'start' | 'end'
      expandedText: string
      unexpandedText: string
      component: 'a'
    } & Partial<React.HTMLAttributes<HTMLAnchorElement>>)

const ExpandingButton = ({
  expanded,
  iconPosition,
  Icon,
  expandedText,
  unexpandedText,
  dataId=expandedText,
  ...buttonProps
}: ExpandingButtonProps) => {
  const { className, ...otherButtonProps } = buttonProps
  return (
    <Button
      data-id={`sidebar-${dataId
        .toLowerCase()
        .split(' ')
        .join('-')}-button`}
      fullWidth
      className={`${className} transition-all duration-200 ease-in-out h-16 whitespace-no-wrap max-w-full overflow-hidden relative outline-none ${
        expanded ? '' : 'p-0'
      }`}
      {...otherButtonProps}
    >
      <Grid
        alignItems="center"
        container
        className="w-full"
        direction={iconPosition === 'end' && expanded ? 'row-reverse' : 'row'}
        wrap="nowrap"
      >
        <Grid item className="pl-5">
          {Icon ? (
            <Icon
              className="transition duration-200 ease-in-out"
              style={{
                transform: expanded
                  ? 'none'
                  : 'translateX(2px) translateY(-10px)',
              }}
            />
          ) : null}
          {Icon ? (
            <Typography
              variant="body2"
              className={`${
                expanded ? 'opacity-0' : 'opacity-100'
              } transform -translate-x-1/2 -translate-y-1 absolute left-1/2 bottom-0 transition duration-200 ease-in-out`}
            >
              {unexpandedText}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              className={`${
                expanded ? 'opacity-0' : 'opacity-100'
              } transform -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 transition duration-200 ease-in-out`}
            >
              {unexpandedText}
            </Typography>
          )}
        </Grid>
        <Grid
          item
          className={`${
            expanded ? 'opacity-100' : 'opacity-0'
          } pl-4 transition duration-200 ease-in-out`}
        >
          <Typography variant="h6">{expandedText}</Typography>
        </Grid>
      </Grid>
    </Button>
  )
}

export default hot(module)(ExpandingButton)
