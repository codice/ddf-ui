/* https://material-ui.com/components/transfer-list/ */
import { hot } from 'react-hot-loader'
import React from 'react'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import { useDialog } from '../../dialog'
import EditIcon from '@mui/icons-material/Edit'
import { Editor } from './summary'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import {
  DropResult,
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd'
import extension from '../../../extension-points'
import { Elevations } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
import LeftArrowIcon from '@mui/icons-material/ChevronLeft'
import RightArrowIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { AutoVariableSizeList } from 'react-window-components'
import debounce from 'lodash.debounce'
import { Memo } from '../../memo/memo'
import { TypedUserInstance } from '../../singletons/TypedUser'
import user from '../../singletons/user-instance'
import ExtensionPoints from '../../../extension-points/extension-points'
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks'
import { StartupDataStore } from '../../../js/model/Startup/startup'
import { useConfiguration } from '../../../js/model/Startup/configuration.hooks'
const getAmountChecked = (items: CheckedType) => {
  return Object.values(items).filter((a) => a).length
}
const handleShiftClick = ({
  items,
  filteredItemArray,
  setItems,
  item,
}: {
  items: CheckedType
  item: string
  filteredItemArray: string[]
  setItems: SetCheckedType
}) => {
  const defaultMin = filteredItemArray.length
  const defaultMax = -1
  const firstIndex = filteredItemArray.reduce((min, filteredItem, index) => {
    if (items[filteredItem]) {
      return Math.min(min, index)
    }
    return min
  }, defaultMin)
  const lastIndex = filteredItemArray.reduce((max, filteredItem, index) => {
    if (items[filteredItem]) {
      return Math.max(max, index)
    }
    return max
  }, defaultMax)
  const indexClicked = filteredItemArray.indexOf(item)
  if (firstIndex === defaultMin && lastIndex === defaultMax) {
    setItems({
      ...items,
      [item]: true,
    })
  } else if (indexClicked <= firstIndex) {
    // traverse from target to next until firstIndex
    const updates = filteredItemArray.slice(indexClicked, firstIndex + 1)
    setItems({
      ...items,
      ...updates.reduce((blob, filteredItem) => {
        blob[filteredItem] = true
        return blob
      }, {} as CheckedType),
    })
  } else if (indexClicked >= lastIndex) {
    // traverse from target to prev until lastIndex
    const updates = filteredItemArray.slice(lastIndex, indexClicked + 1)
    setItems({
      ...items,
      ...updates.reduce((blob, filteredItem) => {
        blob[filteredItem] = true
        return blob
      }, {} as CheckedType),
    })
  } else {
    // traverse from target to prev until something doesn't change
    const closestPreviousIndex = filteredItemArray
      .slice(0, indexClicked - 1)
      .reduce((max, filteredItem, index) => {
        if (items[filteredItem]) {
          return Math.max(max, index)
        }
        return max
      }, defaultMax)
    const updates = filteredItemArray.slice(
      closestPreviousIndex,
      indexClicked + 1
    )
    setItems({
      ...items,
      ...updates.reduce((blob, filteredItem) => {
        blob[filteredItem] = true
        return blob
      }, {} as CheckedType),
    })
  }
}
const ItemRow = ({
  value,
  lazyResult,
  startOver,
  measure,
  filter,
}: {
  value: string
  lazyResult?: LazyQueryResult
  startOver: () => void
  measure?: () => void
  filter?: string
}) => {
  const MetacardDefinitions = useMetacardDefinitions()
  const dialogContext = useDialog()
  const { setItems, items, filteredItemArray } =
    React.useContext(CustomListContext)
  const { isNotWritable } = useCustomReadOnlyCheck()
  React.useEffect(() => {
    if (measure) measure()
  }, [])
  const alias = MetacardDefinitions.getAlias(value)
  const isReadonly = lazyResult
    ? isNotWritable({
        attribute: value,
        lazyResult,
      })
    : true
  if (filter && !alias.toLowerCase().includes(filter.toLowerCase())) {
    return null
  }
  const CustomAttributeEditor = lazyResult
    ? ExtensionPoints.attributeEditor(lazyResult, value)
    : null
  return (
    <div
      data-id="attribute-container"
      role="listitem"
      className="p-0 flex w-full"
    >
      <Button
        onClick={(event) => {
          if (event.shiftKey) {
            handleShiftClick({
              items,
              item: value,
              setItems,
              filteredItemArray,
            })
          } else if (event.ctrlKey || event.metaKey) {
            setItems({
              ...items,
              [value]: !items[value],
            })
          } else {
            setItems({
              ...items,
              [value]: !items[value],
            })
          }
        }}
        size="medium"
      >
        {items[value] ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      </Button>
      <Button
        fullWidth
        size="medium"
        className="justify-start"
        onClick={(event) => {
          if (event.shiftKey) {
            handleShiftClick({
              items,
              item: value,
              setItems,
              filteredItemArray,
            })
          } else if (event.ctrlKey || event.metaKey) {
            setItems({
              ...items,
              [value]: !items[value],
            })
          } else {
            // really the only difference from the checkbox click event, where we turn off everything but this one
            setItems({
              ...Object.keys(items).reduce((blob, val) => {
                blob[val] = false
                return blob
              }, {} as CheckedType),
              [value]: !items[value],
            })
          }
        }}
      >
        {alias}
      </Button>
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
              children: CustomAttributeEditor ? (
                <CustomAttributeEditor
                  attribute={value}
                  result={lazyResult}
                  onCancel={startOver}
                  onSave={startOver}
                  goBack={startOver}
                />
              ) : (
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
    </div>
  )
}
const CustomListContext = React.createContext({
  items: {} as CheckedType,
  setItems: (() => {}) as SetCheckedType,
  filteredItemArray: [] as string[],
})
const filterUpdate = ({
  filter,
  setItemArray,
  items,
}: {
  items: {
    [key: string]: boolean
  }
  filter: string
  setItemArray: (val: string[]) => void
}) => {
  setItemArray(
    Object.keys(items).filter((attr) => {
      const alias = StartupDataStore.MetacardDefinitions.getAlias(attr)
      const isFiltered =
        filter !== ''
          ? !alias.toLowerCase().includes(filter.toLowerCase())
          : false
      return !isFiltered
    })
  )
}
const generateDebouncedFilterUpdate = () => {
  return debounce(filterUpdate, 500)
}
/**
 * At the moment, we only virtualize the right side since that's likely to be huge whereas the left isn't (it also has DND on left, which makes things diff to virtualize)
 */
const CustomList = ({
  title,
  items,
  lazyResult,
  updateItems,
  isDnD,
  handleToggleAll,
  mode,
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
  startOver: () => void
  totalPossible: number
}) => {
  const itemsRef = React.useRef(items)
  itemsRef.current = items // don't see a performant way besides this to allow us to avoid rerendering DnD but allow it to update the item orders correctly
  const [filter, setFilter] = React.useState('')
  const [unfilteredItemArray, setUnfilteredItemArray] = React.useState(
    Object.keys(items)
  )
  const [filteredItemArray, setFilteredItemArray] = React.useState(
    Object.keys(items)
  )
  const [isFiltering, setIsFiltering] = React.useState(false)
  const debouncedFilterUpdate = React.useRef(generateDebouncedFilterUpdate())
  const numberChecked = getAmountChecked(items)
  const total = Object.keys(items).length
  const isIndeterminate = numberChecked !== total && numberChecked !== 0
  const isCompletelySelected = numberChecked === total && total !== 0
  React.useEffect(() => {
    setUnfilteredItemArray(Object.keys(items))
  }, [Object.keys(items).toString()])
  React.useEffect(() => {
    setIsFiltering(true)
    debouncedFilterUpdate.current({
      items,
      filter,
      setItemArray: setFilteredItemArray,
    })
  }, [Object.keys(items).toString(), filter])
  React.useEffect(() => {
    setIsFiltering(false)
  }, [filteredItemArray])
  // memo this, other wise the creation of the new object each time is seen as a "change"
  const memoProviderValue = React.useMemo(() => {
    return { items, setItems: updateItems, filteredItemArray }
  }, [items, updateItems])
  return (
    <CustomListContext.Provider value={memoProviderValue}>
      <Paper
        data-id={`${(title as any).toLowerCase()}-container`}
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
              data-id={`${(title as any).toLowerCase()}-select-all-checkbox`}
              disabled={Object.keys(items).length === 0}
              onClick={handleToggleAll(items)}
              color="primary"
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
            className="w-common h-common overflow-hidden relative"
            dense
            component="div"
            role="list"
          >
            {isFiltering ? (
              <LinearProgress
                className="w-full h-1 absolute left-0 top-0"
                variant="indeterminate"
              />
            ) : null}
            {isDnD ? (
              <Memo dependencies={[filteredItemArray]}>
                <div className="flex flex-col flex-nowrap h-full w-full overflow-hidden">
                  <div className="italic px-4 text-xs font-normal">
                    Click and drag attributes to reorder.
                  </div>
                  <div className="w-full h-full">
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
                        // complicated by the fact that we filter, so we need to find the original and dest index ourselves :(
                        if (result.reason === 'DROP' && result.destination) {
                          const shiftedOriginalIndex =
                            unfilteredItemArray.indexOf(result.draggableId)
                          const shiftedDestIndex = unfilteredItemArray.indexOf(
                            filteredItemArray[result.destination.index]
                          )
                          const clonedList = unfilteredItemArray.slice(0)
                          clonedList.splice(shiftedOriginalIndex, 1)
                          clonedList.splice(
                            shiftedDestIndex,
                            0, // insert WITHOUT removing anything
                            result.draggableId
                          )
                          const newList = clonedList.reduce((blob, attr) => {
                            blob[attr] = itemsRef.current[attr]
                            return blob
                          }, {} as CheckedType)
                          updateItems(newList)
                          filterUpdate({
                            filter,
                            setItemArray: setFilteredItemArray,
                            items: newList,
                          }) // in this case, we eagerly set in order to avoid flickering
                        }
                      }}
                    >
                      <div className="children-h-full children-w-full h-full w-full overflow-hidden">
                        <Droppable
                          droppableId="test"
                          mode="virtual"
                          renderClone={(provided, _snapshot, rubric) => {
                            return (
                              <div
                                {...(provided.draggableProps as any)}
                                {...(provided.dragHandleProps as any)}
                                ref={provided.innerRef as any}
                              >
                                <ItemRow
                                  value={filteredItemArray[rubric.source.index]}
                                  startOver={startOver}
                                  lazyResult={lazyResult}
                                  filter={filter}
                                />
                              </div>
                            )
                          }}
                        >
                          {(provided) => {
                            return (
                              <AutoVariableSizeList<string, HTMLDivElement>
                                items={filteredItemArray}
                                defaultSize={39.42}
                                controlledMeasuring={true}
                                overscanCount={10}
                                outerRef={provided.innerRef}
                                Item={({ itemRef, item, measure, index }) => {
                                  return (
                                    <div ref={itemRef} className="relative">
                                      <Draggable
                                        draggableId={item}
                                        index={index}
                                        key={item}
                                        isDragDisabled={!isDnD}
                                        disableInteractiveElementBlocking
                                      >
                                        {(provided) => {
                                          return (
                                            <div
                                              ref={provided.innerRef as any}
                                              {...(provided.draggableProps as any)}
                                              {...(provided.dragHandleProps as any)}
                                            >
                                              <ItemRow
                                                value={item}
                                                startOver={startOver}
                                                lazyResult={lazyResult}
                                                // filter={filter}
                                                measure={measure}
                                              />
                                            </div>
                                          )
                                        }}
                                      </Draggable>
                                    </div>
                                  )
                                }}
                                Empty={() => {
                                  return <div></div>
                                }}
                              />
                            )
                          }}
                        </Droppable>
                      </div>
                    </DragDropContext>
                  </div>
                </div>
              </Memo>
            ) : (
              <>
                <AutoVariableSizeList<string, HTMLDivElement>
                  items={filteredItemArray}
                  defaultSize={39.42}
                  controlledMeasuring={true}
                  overscanCount={10}
                  Item={({ itemRef, item, measure }) => {
                    return (
                      <div ref={itemRef} className="relative">
                        <ItemRow
                          value={item}
                          startOver={startOver}
                          lazyResult={lazyResult}
                          measure={measure}
                        />
                      </div>
                    )
                  }}
                  Empty={() => {
                    return <div></div>
                  }}
                />
              </>
            )}
          </List>
        )}
      </Paper>
    </CustomListContext.Provider>
  )
}
export const useCustomReadOnlyCheck = () => {
  const Configuration = useConfiguration()
  const [customEditableAttributes, setCustomEditableAttributes] =
    React.useState([] as string[])
  const isMounted = React.useRef<boolean>(true)
  const [loading, setLoading] = React.useState(true)
  const initializeCustomEditableAttributes = async () => {
    const attrs = await extension.customEditableAttributes()
    if (isMounted.current) {
      if (attrs !== undefined) {
        setCustomEditableAttributes(attrs)
      }
      setLoading(false)
    }
  }
  React.useEffect(() => {
    initializeCustomEditableAttributes()
    return () => {
      isMounted.current = false
    }
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
      const determination =
        lazyResult.isRemote() ||
        !TypedUserInstance.canWrite(lazyResult) ||
        Configuration.isReadOnly(attribute)
      return determination
    },
  }
}
const convertAttrListToMap = (attrs: string[]) => {
  return attrs.reduce(
    (blob, attr) => {
      blob[attr] = false
      return blob
    },
    {} as {
      [key: string]: boolean
    }
  )
}
type CheckedType = {
  [key: string]: boolean
}
type SetCheckedType = React.Dispatch<React.SetStateAction<CheckedType>>
const TransferList = ({
  startingLeft,
  startingRight,
  startingHideEmpty,
  lazyResult,
  onSave,
}: {
  startingLeft: string[]
  startingRight: string[]
  startingHideEmpty?: boolean
  lazyResult?: LazyQueryResult
  onSave: (arg: string[], hideEmpty: boolean | undefined) => void
}) => {
  const dialogContext = useDialog()
  const [mode, setMode] = React.useState(
    'loading' as 'normal' | 'saving' | 'loading'
  )
  const [left, setLeft] = React.useState(convertAttrListToMap(startingLeft))
  const [right, setRight] = React.useState(convertAttrListToMap(startingRight))
  const [hideEmpty, setHideEmpty] = React.useState(startingHideEmpty)
  const { loading } = useCustomReadOnlyCheck()
  React.useEffect(() => {
    if (!loading) {
      setMode('normal')
    }
  }, [loading])
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
          startingHideEmpty={hideEmpty}
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
          justifyContent="center"
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
        {hideEmpty !== undefined && (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={hideEmpty}
                  onChange={(e) => setHideEmpty(e.target.checked)}
                />
              }
              label="Hide empty attributes in inspector"
              style={{ paddingLeft: '10px' }}
            />
            <div style={{ flex: '1 0 0' }} />
          </>
        )}
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
            onSave(Object.keys(left), hideEmpty)
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
