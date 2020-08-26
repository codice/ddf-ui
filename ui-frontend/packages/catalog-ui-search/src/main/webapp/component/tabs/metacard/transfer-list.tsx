/* https://material-ui.com/components/transfer-list/ */
import { hot } from 'react-hot-loader'
import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Theme from '@material-ui/core/styles/Theme'
import createStyles from '@material-ui/core/styles/createStyles'
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
  Paper,
  DialogProps,
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
import { dark, light, Elevations } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
import LeftArrowIcon from '@material-ui/icons/ChevronLeft'
import RightArrowIcon from '@material-ui/icons/ChevronRight'
import CloseIcon from '@material-ui/icons/Close'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
const user = require('../../singletons/user-instance')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 'auto',
    },
    list: {
      width: 400,
      height: 500,
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

const CustomList = ({
  title,
  items,
  total,
  lazyResult,
  updateItems,
  isDnD,
  numberOfChecked,
  handleToggleAll,
  mode,
  classes,
  checkIsReadOnly,
  handleToggle,
  checked,
  dialogContext,
  left,
  right,
  updateActive,
  onSave,
}: {
  title: React.ReactNode
  items: string[]
  total: number
  lazyResult: LazyQueryResult
  updateItems: (arg: string[]) => void
  isDnD: boolean // drag and drop allowed?
  numberOfChecked: (props: any) => number
  handleToggleAll: (props: any) => () => void
  mode: 'loading' | string
  classes: any
  checkIsReadOnly: (props: any) => boolean
  handleToggle: (props: any) => () => void
  checked: string[]
  dialogContext: {
    setProps: React.Dispatch<React.SetStateAction<Partial<DialogProps>>>
  }
  left: string[]
  right: string[]
  updateActive: (arg: any) => void
  onSave: () => void
}) => {
  const [filter, setFilter] = React.useState('')
  const theme = useTheme()
  const numberChecked = numberOfChecked(items)
  const isIndeterminate = numberChecked !== items.length && numberChecked !== 0
  const isCompletelySelected =
    numberChecked === items.length && items.length !== 0
  return (
    <Paper elevation={Elevations.paper}>
      <Grid
        container
        className="p-2 text-xl font-normal relative"
        direction="row"
        wrap="nowrap"
        alignItems="center"
      >
        <Grid item className="absolute left-0 top-0 ml-2 mt-min">
          <Button
            disabled={items.length === 0}
            onClick={handleToggleAll(items)}
            color={
              isIndeterminate || isCompletelySelected ? 'secondary' : 'default'
            }
          >
            {(() => {
              if (isCompletelySelected) {
                return (
                  <>
                    <CheckBoxIcon />
                    {numberOfChecked(items)}{' '}
                  </>
                )
              } else if (isIndeterminate) {
                return (
                  <>
                    <IndeterminateCheckBoxIcon />
                    {numberOfChecked(items)}{' '}
                  </>
                )
              } else {
                return <CheckBoxOutlineBlankIcon />
              }
            })()}
          </Button>
        </Grid>
        <Grid item className="m-auto ">
          {title} ({items.length}/{total})
        </Grid>
      </Grid>
      <DarkDivider className="w-full h-min" />
      <div className="p-2">
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
      </div>
      <DarkDivider className="w-full h-min" />
      {mode === 'loading' ? (
        <CircularProgress />
      ) : (
        <List className={classes.list} dense component="div" role="list">
          {isDnD && (
            <div className="italic px-4 text-xs font-normal">
              Click and drag attributes to reorder.
            </div>
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
                          ? !alias.toLowerCase().includes(filter.toLowerCase())
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
                                  className="p-0"
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
                                  <ListItemText id={labelId} primary={alias} />
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
                                                        lazyResult={lazyResult}
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
                                                        lazyResult={lazyResult}
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
                                                        lazyResult={lazyResult}
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
    </Paper>
  )
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

  return (
    <>
      <div className="text-2xl text-center px-2 pb-2 pt-4 font-normal relative">
        Manage Attributes
        <Button
          className="absolute right-0 top-0 mr-1 mt-1"
          variant="text"
          color="default"
          size="small"
          onClick={() => {
            dialogContext.setProps({
              open: false,
              children: null,
            })
          }}
        >
          <CloseIcon />
        </Button>
      </div>
      <DarkDivider className="w-full h-min" />
      <DialogContent>
        <Grid
          container
          spacing={2}
          justify="center"
          alignItems="center"
          className={classes.root}
        >
          <Grid item>
            <CustomList
              title="Active"
              items={left}
              lazyResult={lazyResult}
              updateItems={setLeft}
              isDnD={true}
              total={left.length + right.length}
              left={left}
              right={right}
              onSave={onSave}
              updateActive={updateActive}
              checkIsReadOnly={checkIsReadOnly}
              numberOfChecked={numberOfChecked}
              handleToggle={handleToggle}
              handleToggleAll={handleToggleAll}
              classes={classes}
              checked={checked}
              dialogContext={dialogContext}
              mode={mode}
            />
          </Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Button
                variant="outlined"
                className={classes.button}
                onClick={handleCheckedRight}
                disabled={leftChecked.length === 0}
                aria-label="move selected right"
              >
                <RightArrowIcon />
              </Button>
              <Button
                variant="outlined"
                className={classes.button}
                onClick={handleCheckedLeft}
                disabled={rightChecked.length === 0}
                aria-label="move selected left"
              >
                <LeftArrowIcon />
              </Button>
            </Grid>
          </Grid>
          <Grid item>
            <CustomList
              title="Hidden"
              items={right}
              lazyResult={lazyResult}
              updateItems={setRight}
              isDnD={false}
              total={left.length + right.length}
              left={left}
              right={right}
              onSave={onSave}
              updateActive={updateActive}
              checkIsReadOnly={checkIsReadOnly}
              numberOfChecked={numberOfChecked}
              handleToggle={handleToggle}
              handleToggleAll={handleToggleAll}
              classes={classes}
              checked={checked}
              dialogContext={dialogContext}
              mode={mode}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DarkDivider className="w-full h-min" />
      <DialogActions>
        <Button
          disabled={mode === 'saving'}
          onClick={() => {
            dialogContext.setProps({
              open: false,
              children: null,
            })
          }}
          variant="text"
          color="primary"
          className="mr-2"
        >
          Cancel
        </Button>
        <Button
          className="ml-2"
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
