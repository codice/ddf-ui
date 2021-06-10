import * as React from 'react'
import FakeIcon from '@material-ui/icons/AcUnit'
import Button, { ButtonProps } from '@material-ui/core/Button'
import { LinkProps, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader'
import Tooltip from '@material-ui/core/Tooltip'
import Paper from '@material-ui/core/Paper'
import { Elevations } from '../theme/theme'
import { useIsTruncated } from '../overflow-tooltip/overflow-tooltip'

export type BaseProps = {
  Icon?: React.FC<any>
  expandedLabel: React.ReactNode
  unexpandedLabel: React.ReactNode
  dataId?: string
  expanded: boolean
  orientation?: 'vertical' | 'horizontal'
}

type ExpandingButtonProps =
  | (ButtonProps & {
      component?: undefined
    } & BaseProps)
  | (ButtonProps &
      BaseProps & {
        component: typeof Link
      } & Partial<LinkProps>)
  | (ButtonProps &
      BaseProps & {
        component: 'a'
      } & Partial<React.HTMLAttributes<HTMLAnchorElement>>)
  | (ButtonProps &
      BaseProps & {
        component: typeof Button
      } & Partial<ButtonProps>)

const ExpandingButton = ({
  expanded,
  Icon,
  expandedLabel,
  unexpandedLabel,
  dataId = expandedLabel?.toString() || 'default',
  orientation = 'horizontal',
  ...buttonProps
}: ExpandingButtonProps) => {
  const { className, ...otherButtonProps } = buttonProps
  const isTruncatedState = useIsTruncated<HTMLDivElement>()
  const disableTooltip = (() => {
    if (
      (orientation === 'vertical' && !expanded) ||
      (!unexpandedLabel && !expanded)
    ) {
      return false
    } else {
      return !isTruncatedState.isTruncated
    }
  })()
  return (
    <Tooltip
      title={
        disableTooltip ? (
          ''
        ) : (
          <Paper elevation={Elevations.overlays}>
            <div className="p-2">{expandedLabel}</div>
          </Paper>
        )
      }
      onOpen={() => {
        isTruncatedState.compareSize.current()
      }}
      placement="right"
    >
      <Button
        data-id={dataId}
        fullWidth
        className={`${className} children-block children-h-full transition-all duration-200 ease-in-out whitespace-no-wrap max-w-full overflow-hidden relative outline-none ${
          expanded ? '' : 'p-0'
        }`}
        {...otherButtonProps}
      >
        <div
          className={`flex flex-row flex-no-wrap items-center w-full h-full`}
          ref={isTruncatedState.ref}
        >
          <div
            className={` ${
              expanded ? 'hidden' : ''
            } w-full flex flex-col flex-shrink-0 items-center justify-start flex-no-wrap py-2`}
          >
            {Icon ? <Icon className={`py-1`} /> : null}
            <div
              className={`${
                orientation === 'horizontal'
                  ? 'w-full'
                  : 'writing-mode-vertical-lr'
              } truncate text-center`}
            >
              {unexpandedLabel}
            </div>
          </div>

          <div
            className={`${
              expanded ? '' : 'hidden'
            } pl-4 flex-shrink-1 w-full truncate`}
          >
            <div className="flex flex-row items-center flex-no-wrap w-full">
              {Icon ? (
                <Icon className="transition duration-200 ease-in-out mr-2 flex-shrink-0" />
              ) : (
                <FakeIcon className="transition duration-200 ease-in-out mr-2 opacity-0 flex-shrink-0" />
              )}
              <div className="flex flex-col items-start flex-no-wrap text-lg w-full flex-shrink-1 truncate">
                {expandedLabel}
              </div>
            </div>
          </div>
        </div>
      </Button>
    </Tooltip>
  )
}

export default hot(module)(ExpandingButton)
