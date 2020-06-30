import * as React from 'react'
import clsx from 'clsx'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'

import Drawer from '@material-ui/core/Drawer'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    branding: {
      transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  })
)

type ShellProps = {
  productImage?: string
  productName?: string
  branding?: string
  lowerLeftBackground?: string
  lowerLeftLogo?: string
  upperLeftLogo?: string
  menuIcon?: string
  Links: React.ComponentType<{ open: boolean }>
  BannerHeader?: React.ReactNode
  BannerFooter?: React.ReactNode
  Content: React.ComponentType
}

export const handleBase64EncodedImages = (url: string) => {
  if (url && url.startsWith('data:')) {
    return url
  }
  return `data:image/png;base64,${url}`
}

export const Shell = ({
  productImage,
  branding,
  productName,
  lowerLeftBackground,
  lowerLeftLogo,
  upperLeftLogo,
  menuIcon,
  Links,
  BannerFooter,
  BannerHeader,
  Content,
}: ShellProps) => {
  let defaultOpen = false

  const classes = useStyles()
  const [open, setOpen] = React.useState(defaultOpen)

  function handleDrawerOpen() {
    localStorage.setItem('shell.drawer', 'true')
    setOpen(true)
  }

  function handleDrawerClose() {
    localStorage.setItem('shell.drawer', 'false')
    setOpen(false)
  }

  return (
    <Grid
      container
      className="h-full w-full overflow-hidden"
      direction="column"
      justify="space-between"
      wrap="nowrap"
    >
      <Grid item style={{ width: '100%' }}>
        {BannerHeader}
      </Grid>
      <Grid
        item
        style={{
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
      >
        <Grid
          container
          direction="row"
          wrap="nowrap"
          alignItems="stretch"
          style={{ height: '100%', width: '100%' }}
        >
          <Grid item>
            <Drawer
              variant="permanent"
              className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              })}
              classes={{
                paper: clsx({
                  [classes.drawerOpen]: open,
                  [classes.drawerClose]: !open,
                }),
              }}
              PaperProps={{
                style: {
                  position: 'absolute',
                },
                elevation: 4,
              }}
              open={open}
            >
              {open ? (
                <>
                  <Grid
                    container
                    wrap="nowrap"
                    alignItems="center"
                    className="w-full h-full overflow-hidden"
                    style={{
                      maxHeight: '64px',
                    }}
                  >
                    <Grid
                      item
                      className="w-full relative"
                      style={{
                        height: upperLeftLogo ? '100%' : 'auto',
                      }}
                    >
                      {upperLeftLogo ? (
                        <img
                          className={`${
                            classes.branding
                          } max-h-full max-w-full absolute left-0 transform -translate-y-1/2 top-1/2`}
                          style={{
                            padding: '5px 0px',
                          }}
                          src={handleBase64EncodedImages(upperLeftLogo)}
                        />
                      ) : (
                        <Grid container direction="column">
                          <Grid item>
                            <Typography>{branding}</Typography>
                          </Grid>
                          <Grid item>
                            <Typography>{productName}</Typography>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                    <Grid item className="ml-auto">
                      <IconButton
                        className="h-auto"
                        onClick={handleDrawerClose}
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <Button
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  className="w-full h-auto"
                  style={{
                    padding: menuIcon ? '0px' : '12px',
                  }}
                >
                  {menuIcon ? (
                    <>
                      <img
                        src={handleBase64EncodedImages(menuIcon)}
                        style={{ width: '51.42px' }}
                      />
                    </>
                  ) : (
                    <MenuIcon />
                  )}
                </Button>
              )}

              <Divider />
              <Links open={open} />

              <Divider />
              <>
                <div className="h-full overflow-hidden relative">
                  {lowerLeftBackground ? (
                    <img
                      className={`${
                        classes.branding
                      } h-full absolute scale-200 opacity-50 -z-1 transform`}
                      src={handleBase64EncodedImages(lowerLeftBackground)}
                    />
                  ) : null}
                  <a
                    href="../"
                    className="absolute bottom-0 bg-transparent p-0 left-1/2 transform -translate-x-1/2"
                  >
                    <img
                      className={classes.branding}
                      style={{
                        width: open ? `${drawerWidth - 20}px` : '52px',
                        padding: open ? `20px` : '5px',
                      }}
                      src={handleBase64EncodedImages(
                        lowerLeftLogo || productImage
                      )}
                    />
                  </a>
                </div>
              </>
            </Drawer>
          </Grid>
          <Grid
            item
            className="w-full"
            style={{
              overflow: 'hidden',
            }}
          >
            <Paper className="w-full h-full">
              <Content />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ width: '100%' }}>
        {BannerFooter}
      </Grid>
    </Grid>
  )
}
