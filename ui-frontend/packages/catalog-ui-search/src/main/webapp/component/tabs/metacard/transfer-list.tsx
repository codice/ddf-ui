/* https://material-ui.com/components/transfer-list/ */
import { hot } from 'react-hot-loader'
import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@material-ui/core'
import { useDialog } from '@connexta/atlas/atoms/dialog'
import TypedMetacardDefs from './metacardDefinitions'
import EditIcon from '@material-ui/icons/Edit'
import { Editor } from './summary'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import {
  DropResult,
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd'
import extension from '../../../extension-points'
const user = require('../../singletons/user-instance')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    cardHeader: {
      padding: theme.spacing(1, 2),
    },
    list: {
      width: 400,
      height: 500,
      backgroundColor: theme.palette.background.paper,
      overflow: 'auto',
    },
    button: {
      margin: theme.spacing(0.5, 0),
    },
  })
)

function not(a: string[], b: string[]) {
  return a.filter(value => b.indexOf(value) === -1)
}

function intersection(a: string[], b: string[]) {
  return a.filter(value => b.indexOf(value) !== -1)
}

function union(a: string[], b: string[]) {
  return [...a, ...not(b, a)]
}

const TransferList = ({
  startingLeft,
  startingRight,
  updateActive,
  lazyResult,
  onSave,
}: {
  startingLeft: string[]
  startingRight: string[]
  updateActive: (arg: any) => void
  lazyResult: LazyQueryResult
  onSave: () => void
}) => {
  const classes = useStyles()
  const dialogContext = useDialog()
  const [mode, setMode] = React.useState('loading' as
    | 'normal'
    | 'saving'
    | 'loading')
  const [checked, setChecked] = React.useState<string[]>([])
  const [left, setLeft] = React.useState(startingLeft)
  const [right, setRight] = React.useState(startingRight)
  const [
    customEditableAttributes,
    setCustomEditableAttributes,
  ] = React.useState([] as string[])

  React.useEffect(() => {
    setMode('loading')
    getCustomAttrs()
  }, [])

  const getCustomAttrs = async () => {
    const attrs = await extension.customEditableAttributes()
    if (attrs !== undefined) {
      setCustomEditableAttributes(attrs)
    }
    setMode('normal')
  }

  const checkIsReadOnly = (attribute: string) => {
    const perm = extension.customCanWritePermission({
      attribute,
      lazyResult,
      user,
      editableAttributes: customEditableAttributes,
    })
    if (perm !== undefined) {
      return !perm
    }
    return (
      (lazyResult.isRemote() &&
        !(user.canWrite(lazyResult.getBackbone()) as boolean)) ||
      TypedMetacardDefs.isReadonly({ attr: attribute })
    )
  }

  const theme = useTheme()

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
  }

  const numberOfChecked = (items: string[]) =>
    intersection(checked, items).length

  const handleToggleAll = (items: string[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items))
    } else {
      setChecked(union(checked, items))
    }
  }

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked))
    setLeft(not(left, leftChecked))
    setChecked(not(checked, leftChecked))
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(not(right, rightChecked))
    setChecked(not(checked, rightChecked))
  }

  const customList = (
    title: React.ReactNode,
    items: string[],
    lazyResult: LazyQueryResult,
    updateItems: (arg: string[]) => void,
    isDnD: boolean // Is drag and drop allowed?
  ) => {
    const [filter, setFilter] = React.useState('')

    return (
      <Card>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Checkbox
              onClick={handleToggleAll(items)}
              checked={
                numberOfChecked(items) === items.length && items.length !== 0
              }
              indeterminate={
                numberOfChecked(items) !== items.length &&
                numberOfChecked(items) !== 0
              }
              disabled={items.length === 0}
              inputProps={{ 'aria-label': 'all items selected' }}
            />
          }
          title={title}
          subheader={`${numberOfChecked(items)}/${items.length} selected`}
        />
        <Divider />
        <TextField
          size="small"
          variant="outlined"
          label="Filter by keyword"
          fullWidth={true}
          value={filter}
          inputProps={{
            style:
              filter !== ''
                ? {
                    borderBottom: `1px solid ${theme.palette.secondary.main}`,
                  }
                : {},
          }}
          onChange={e => {
            setFilter(e.target.value)
          }}
        />
        <Divider />
        {mode === 'loading' ? (
          <CircularProgress />
        ) : (
          <List className={classes.list} dense component="div" role="list">
            {isDnD && (
              <Typography variant="caption">
                Click and drag attributes to reorder.
              </Typography>
            )}
            <DragDropContext
              onDragEnd={(result: DropResult) => {
                //Put these NO-OPs up front for performance reasons:
                //1. If the item is dropped outside the list, do nothing
                //2. If the item is moved into the same place, do nothing
                if (!result.destination) {
                  return
                }
                if (result.source.index === result.destination.index) {
                  return
                }

                if (result.reason === 'DROP' && result.destination) {
                  const originalIndex = result.source.index
                  const destIndex = result.destination.index
                  const clonedList = items.slice()
                  clonedList.splice(originalIndex, 1)
                  clonedList.splice(destIndex, 0, result.draggableId)
                  updateItems(clonedList)
                }
              }}
            >
              <Droppable droppableId="test">
                {provided => {
                  return (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {items.map((value: string, index: number) => {
                        const labelId = `transfer-list-all-item-${value}-label`
                        const alias = TypedMetacardDefs.getAlias({
                          attr: value,
                        })
                        const isReadonly = checkIsReadOnly(value)
                        const isFiltered =
                          filter !== ''
                            ? !alias
                                .toLowerCase()
                                .includes(filter.toLowerCase())
                            : false

                        return isFiltered ? null : (
                          <Draggable
                            draggableId={value}
                            index={index}
                            key={value}
                            isDragDisabled={!isDnD}
                          >
                            {provided => {
                              return (
                                //@ts-ignore
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <ListItem
                                    key={value}
                                    role="listitem"
                                    button
                                    onClick={handleToggle(value)}
                                  >
                                    <ListItemIcon>
                                      <Checkbox
                                        checked={checked.indexOf(value) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{
                                          'aria-labelledby': labelId,
                                        }}
                                      />
                                    </ListItemIcon>
                                    <ListItemText
                                      id={labelId}
                                      primary={alias}
                                    />
                                    {!isReadonly && (
                                      <Button
                                        style={{
                                          pointerEvents: 'all',
                                          height: '100%',
                                        }}
                                        onClick={() => {
                                          dialogContext.setProps({
                                            PaperProps: {
                                              style: {
                                                minWidth: 'none',
                                              },
                                            },
                                            open: true,
                                            children: (
                                              <div
                                                style={{
                                                  padding: '10px',
                                                  minHeight: '30em',
                                                  minWidth: '60vh',
                                                }}
                                              >
                                                <Editor
                                                  attr={value}
                                                  lazyResult={lazyResult}
                                                  /* Re-open this modal again but with the current state
                                              This maintains the state so that if we haven't saved,
                                              we can come back to where we were working */
                                                  goBack={() => {
                                                    dialogContext.setProps({
                                                      open: true,
                                                      children: (
                                                        <TransferList
                                                          startingLeft={left}
                                                          startingRight={right}
                                                          updateActive={
                                                            updateActive
                                                          }
                                                          lazyResult={
                                                            lazyResult
                                                          }
                                                          onSave={onSave}
                                                        />
                                                      ),
                                                    })
                                                  }}
                                                  onCancel={() => {
                                                    dialogContext.setProps({
                                                      open: true,
                                                      children: (
                                                        <TransferList
                                                          startingLeft={left}
                                                          startingRight={right}
                                                          updateActive={
                                                            updateActive
                                                          }
                                                          lazyResult={
                                                            lazyResult
                                                          }
                                                          onSave={onSave}
                                                        />
                                                      ),
                                                    })
                                                  }}
                                                  onSave={() => {
                                                    dialogContext.setProps({
                                                      open: true,
                                                      children: (
                                                        <TransferList
                                                          startingLeft={left}
                                                          startingRight={right}
                                                          updateActive={
                                                            updateActive
                                                          }
                                                          lazyResult={
                                                            lazyResult
                                                          }
                                                          onSave={onSave}
                                                        />
                                                      ),
                                                    })
                                                  }}
                                                />
                                              </div>
                                            ),
                                          })
                                        }}
                                      >
                                        <EditIcon />
                                      </Button>
                                    )}
                                  </ListItem>
                                </div>
                              )
                            }}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )
                }}
              </Droppable>
            </DragDropContext>
          </List>
        )}
      </Card>
    )
  }

  return (
    <>
      <DialogTitle style={{ textAlign: 'center' }}>
        Manage Attributes
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Grid
          container
          spacing={2}
          justify="center"
          alignItems="center"
          className={classes.root}
        >
          <Grid item>
            {customList('Active', left, lazyResult, setLeft, true)}
          </Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Button
                variant="outlined"
                size="small"
                className={classes.button}
                onClick={handleCheckedRight}
                disabled={leftChecked.length === 0}
                aria-label="move selected right"
              >
                &gt;
              </Button>
              <Button
                variant="outlined"
                size="small"
                className={classes.button}
                onClick={handleCheckedLeft}
                disabled={rightChecked.length === 0}
                aria-label="move selected left"
              >
                &lt;
              </Button>
            </Grid>
          </Grid>
          <Grid item>
            {customList('Hidden', right, lazyResult, setRight, false)}
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          disabled={mode === 'saving'}
          onClick={() => {
            setMode('saving')
            updateActive(left)
            onSave()
            dialogContext.setProps({
              open: false,
              children: null,
            })
          }}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
      {mode === 'saving' ? (
        <LinearProgress
          style={{
            width: '100%',
            height: '10px',
            position: 'absolute',
            left: '0px',
            bottom: '0%',
          }}
          variant="indeterminate"
        />
      ) : null}
    </>
  )
}

export default hot(module)(TransferList)
