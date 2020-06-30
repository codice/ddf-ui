import * as React from 'react'

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { IconProps } from '@material-ui/core/Icon'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    shortName: {
      transition: theme.transitions.create(['opacity', 'transform'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  })
)

type ItemProps = {
  isSelected: boolean
  Icon: React.ComponentType<IconProps>
  shortName: string
  name: string
  wrapperComponentProps: any
  WrapperComponent: React.ComponentType<unknown>
}

const Item = ({
  isSelected,
  Icon,
  shortName,
  name,
  classes,
  open,
  WrapperComponent,
  wrapperComponentProps,
}: ItemProps & { open: boolean; classes: any }) => {
  return (
    <WrapperComponent {...wrapperComponentProps}>
      <ListItem
        button
        selected={isSelected}
        tabIndex={-1}
        style={{ position: 'relative' }}
      >
        <ListItemIcon>
          {Icon ? (
            <>
              <Icon
                className={classes.shortName}
                style={{
                  transform: open ? 'none' : 'translateY(-6px)',
                }}
              />
              <Typography
                className={classes.shortName}
                style={{
                  opacity: open ? 0 : 1,
                  fontSize: '.8rem',
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {shortName}
              </Typography>
            </>
          ) : (
            <></>
          )}
        </ListItemIcon>
        <ListItemText primary={name} />
      </ListItem>
    </WrapperComponent>
  )
}

type LinksProps = {
  items: ItemProps[]
}

export const Links = ({ items }: LinksProps) => {
  return ({ open }: { open: boolean }) => {
    const classes = useStyles()
    return (
      <List>
        {items.map(item => {
          return (
            <Item key={item.name} {...item} open={open} classes={classes} />
          )
        })}
      </List>
    )
  }
}
