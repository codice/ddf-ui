/* https://material-ui.com/components/transfer-list/ */
import { hot } from 'react-hot-loader'
import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '@material-ui/core/styles/Theme... Remove this comment to see the full error message
import Theme from '@material-ui/core/styles/Theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextField from '@material-ui/core/TextField'
import useTheme from '@material-ui/core/styles/useTheme'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import { DialogProps } from '@material-ui/core/Dialog'
import { useDialog } from '../../dialog'
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
// @ts-ignore ts-migrate(6133) FIXME: 'dark' is declared but its value is never read.
import { dark, light, Elevations } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
import LeftArrowIcon from '@material-ui/icons/ChevronLeft'
import RightArrowIcon from '@material-ui/icons/ChevronRight'
import CloseIcon from '@material-ui/icons/Close'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
const user = require('../../singletons/user-instance')

function not(a: string[], b: string[]) {
  return a.filter((value) => b.indexOf(value) === -1)
}

function intersection(a: string[], b: string[]) {
  return a.filter((value) => b.indexOf(value) !== -1)
}

function union(a: string[], b: string[]) {
  return [...a, ...not(b, a)]
}

const getAmountChecked = (items: CheckedType) => {
  return Object.values(items).filter((a) => a).length
}

const CustomList = ({
  title,
  items,
  lazyResult,
  updateItems,
  isDnD,
  handleToggleAll,
  mode,
  handleToggle,
  startOver,
  totalPossible,
}: {
  title: React.ReactNode
  items: CheckedType
  lazyResult?: LazyQueryResult
  updateItems: SetCheckedType
  isDnD: boolean // drag and drop allowed?
  handleToggleAll: (props: any) => () => void
  mode: 'loading' | string
  handleToggle: (props: any) => () => void
  startOver: () => void
  totalPossible: number
}) => {
  const dialogContext = useDialog()
  const [filter, setFilter] = React.useState('')
  const theme = useTheme()
  const numberChecked = getAmountChecked(items)
  const total = Object.keys(items).length
  const isIndeterminate = numberChecked !== total && numberChecked !== 0
  const isCompletelySelected = numberChecked === total && total !== 0
  const { isNotWritable } = useCustomReadOnlyCheck()
  return (
    <Paper
      // @ts-ignore ts-migrate(2533) FIXME: Object is possibly 'null' or 'undefined'.
      data-id={`${title.toLowerCase()}-container`}
      elevation={Elevations.paper}
    >
      <Grid
        container
        className="p-2 text-xl font-normal relative"
        direction="row"
        wrap="nowrap"
        alignItems="center"
      >
        <Grid item className="absolute left-0 top-0 ml-2 mt-min">
          <Button
            // @ts-ignore ts-migrate(2533) FIXME: Object is possibly 'null' or 'undefined'.
            data-id={`${title.toLowerCase()}-select-all-checkbox`}
            disabled={Object.keys(items).length === 0}
            onClick={handleToggleAll(items)}
            color={
              isIndeterminate || isCompletelySelected ? 'default' : 'default'
            }
          >
            {(() => {
              if (isCompletelySelected) {
                return (
                  <>
                    <CheckBoxIcon />
                    {numberChecked}{' '}
                  </>
                )
              } else if (isIndeterminate) {
                return (
                  <>
                    <IndeterminateCheckBoxIcon />
                    {numberChecked}{' '}
                  </>
                )
              } else {
                return <CheckBoxOutlineBlankIcon />
              }
            })()}
          </Button>
        </Grid>
        <Grid item className="m-auto ">
          {title} ({total}/{totalPossible})
        </Grid>
      </Grid>
      <DarkDivider className="w-full h-min" />
      <div className="p-2">
        <TextField
          data-id="filter-input"
          size="small"
          variant="outlined"
          label="Filter by keyword"
          fullWidth={true}
          value={filter}
          inputProps={{
            style:
              filter !== ''
                ? {
                    borderBottom: `1px solid ${theme.palette.warning.main}`,
                  }
                : {},
          }}
          onChange={(e) => {
            setFilter(e.target.value)
          }}
        />
      </div>
      <DarkDivider className="w-full h-min" />
      {mode === 'loading' ? (
        <CircularProgress />
      ) : (
        <List
          className="w-common h-common overflow-auto"
          dense
          component="div"
          role="list"
        >
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
                const clonedList = Object.keys(items)
                clonedList.splice(originalIndex, 1)
                clonedList.splice(destIndex, 0, result.draggableId)
                updateItems(
                  clonedList.reduce((blob, attr) => {
                    blob[attr] = items[attr]
                    return blob
                  }, {} as CheckedType)
                )
              }
            }}
          >
            <Droppable droppableId="test">
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {Object.keys(items).map((value: string, index: number) => {
                      const labelId = `transfer-list-all-item-${value}-label`
                      const alias = TypedMetacardDefs.getAlias({
                        attr: value,
                      })
                      const isReadonly = lazyResult
                        ? isNotWritable({
                            attribute: value,
                            lazyResult,
                          })
                        : true
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
                          {(provided) => {
                            return (
                              // @ts-ignore ts-migrate(2322) FIXME: Type 'DragEvent<HTMLDivElement>' is missing the fo... Remove this comment to see the full error message
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <ListItem
                                  data-id="attribute-container"
                                  key={value}
                                  role="listitem"
                                  button
                                  className="p-0"
                                  onClick={handleToggle(value)}
                                >
                                  <ListItemIcon>
                                    <Checkbox
                                      data-id="select-checkbox"
                                      checked={items[value]}
                                      tabIndex={-1}
                                      disableRipple
                                      inputProps={{
                                        'aria-labelledby': labelId,
                                      }}
                                      color="default"
                                    />
                                  </ListItemIcon>
                                  <ListItemText id={labelId} primary={alias} />
                                  {!isReadonly && lazyResult && (
                                    <Button
                                      data-id="edit-button"
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
                                                goBack={startOver}
                                                onCancel={startOver}
                                                onSave={startOver}
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

const getCustomEditableAttributes = (async () => {
  const attrs = await extension.customEditableAttributes()
  return attrs
})()

export const useCustomReadOnlyCheck = () => {
  const [
    customEditableAttributes,
    setCustomEditableAttributes,
  ] = React.useState([] as string[])
  const [loading, setLoading] = React.useState(true)

  const initializeCustomEditableAttributes = async () => {
    const attrs = await getCustomEditableAttributes
    if (attrs !== undefined) {
      setCustomEditableAttributes(attrs)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    initializeCustomEditableAttributes()
  }, [])

  return {
    loading,
    isNotWritable: ({
      attribute,
      lazyResult,
    }: {
      attribute: string
      lazyResult: LazyQueryResult
    }) => {
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
    },
  }
}

const convertAttrListToMap = (attrs: string[]) => {
  return attrs.reduce((blob, attr) => {
    blob[attr] = false
    return blob
  }, {} as { [key: string]: boolean })
}
type CheckedType = {
  [key: string]: boolean
}
type SetCheckedType = React.Dispatch<React.SetStateAction<CheckedType>>

const TransferList = ({
  startingLeft,
  startingRight,
  lazyResult,
  onSave,
}: {
  startingLeft: string[]
  startingRight: string[]
  lazyResult?: LazyQueryResult
  onSave: (arg: string[]) => void
}) => {
  const dialogContext = useDialog()
  const [mode, setMode] = React.useState(
    'loading' as 'normal' | 'saving' | 'loading'
  )
  const [left, setLeft] = React.useState(convertAttrListToMap(startingLeft))
  const [right, setRight] = React.useState(convertAttrListToMap(startingRight))
  const { loading } = useCustomReadOnlyCheck()
  React.useEffect(() => {
    if (!loading) {
      setMode('normal')
    }
  }, [loading])

  const generateHandleToggle = ({
    setState,
    state,
  }: {
    setState: SetCheckedType
    state: CheckedType
  }) => {
    return (value: string) => () => {
      setState({
        ...state,
        [value]: !Boolean(state[value]),
      })
    }
  }

  const generateHandleToggleAll = ({
    setState,
    state,
  }: {
    setState: SetCheckedType
    state: CheckedType
  }) => {
    return () => () => {
      if (Object.values(state).includes(false)) {
        setState(
          Object.keys(state).reduce((blob, attr) => {
            blob[attr] = true
            return blob
          }, {} as CheckedType)
        )
      } else {
        setState(
          Object.keys(state).reduce((blob, attr) => {
            blob[attr] = false
            return blob
          }, {} as CheckedType)
        )
      }
    }
  }

  const moveRight = () => {
    const checkedLeft = Object.entries(left)
      .filter((a) => a[1])
      .reduce((blob, a) => {
        blob[a[0]] = false
        return blob
      }, {} as CheckedType)
    const nonCheckedLeft = Object.entries(left)
      .filter((a) => !a[1])
      .reduce((blob, a) => {
        blob[a[0]] = a[1]
        return blob
      }, {} as CheckedType)
    setRight({
      ...right,
      ...checkedLeft,
    })
    setLeft(nonCheckedLeft)
  }

  const moveLeft = () => {
    const checkedRight = Object.entries(right)
      .filter((a) => a[1])
      .reduce((blob, a) => {
        blob[a[0]] = false
        return blob
      }, {} as CheckedType)
    const nonCheckedRight = Object.entries(right)
      .filter((a) => !a[1])
      .reduce((blob, a) => {
        blob[a[0]] = a[1]
        return blob
      }, {} as CheckedType)
    setLeft({
      ...left,
      ...checkedRight,
    })
    setRight(nonCheckedRight)
  }

  const hasLeftChecked = Object.entries(left).find((a) => a[1]) !== undefined
  const hasRightChecked = Object.entries(right).find((a) => a[1]) !== undefined
  const startOver = () => {
    dialogContext.setProps({
      open: true,
      children: (
        <TransferList
          startingLeft={Object.keys(left)}
          startingRight={Object.keys(right)}
          lazyResult={lazyResult}
          onSave={onSave}
        />
      ),
    })
  }
  const totalPossible = startingLeft.length + startingRight.length

  return (
    <>
      <div className="text-2xl text-center px-2 pb-2 pt-4 font-normal relative">
        Manage Attributes
        <Button
          data-id="close-button"
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
          className="m-auto"
        >
          <Grid item>
            <CustomList
              title="Active"
              items={left}
              lazyResult={lazyResult}
              updateItems={setLeft}
              isDnD={true}
              startOver={startOver}
              handleToggle={generateHandleToggle({
                setState: setLeft,
                state: left,
              })}
              handleToggleAll={generateHandleToggleAll({
                setState: setLeft,
                state: left,
              })}
              totalPossible={totalPossible}
              mode={mode}
            />
          </Grid>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Button
                data-id="move-right-button"
                variant="outlined"
                className="m-1"
                onClick={moveRight}
                disabled={!hasLeftChecked}
                aria-label="move selected right"
              >
                <RightArrowIcon />
              </Button>
              <Button
                data-id="move-left-button"
                variant="outlined"
                className="m-1"
                onClick={moveLeft}
                disabled={!hasRightChecked}
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
              startOver={startOver}
              handleToggle={generateHandleToggle({
                setState: setRight,
                state: right,
              })}
              handleToggleAll={generateHandleToggleAll({
                setState: setRight,
                state: right,
              })}
              mode={mode}
              totalPossible={totalPossible}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DarkDivider className="w-full h-min" />
      <DialogActions>
        <Button
          data-id="dialog-save-button"
          disabled={mode === 'saving'}
          onClick={() => {
            dialogContext.setProps({
              open: false,
              children: null,
            })
          }}
          variant="text"
          color="secondary"
          className="mr-2"
        >
          Cancel
        </Button>
        <Button
          className="ml-2"
          disabled={mode === 'saving'}
          onClick={() => {
            setMode('saving')
            onSave(Object.keys(left))
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
