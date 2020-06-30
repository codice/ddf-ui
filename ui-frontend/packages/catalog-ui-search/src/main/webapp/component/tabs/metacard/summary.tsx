import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useLazyResultsSelectedResultsFromSelectionInterface } from 'catalog-ui-search/src/main/webapp/component/selection-interface/hooks'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
const user = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance')
const properties = require('catalog-ui-search/src/main/webapp/js/properties.js')
const metacardDefinitions = require('catalog-ui-search/src/main/webapp/component/singletons/metacard-definitions')
const ShowAttributeView = require('catalog-ui-search/src/main/webapp/component/show-attribute/show-attribute.view')
import { Dropdown } from '@connexta/atlas/atoms/dropdown'
import MRC from 'catalog-ui-search/exports/marionette-region-container'
import Paper from '@material-ui/core/Paper'
import { BetterClickAwayListener } from '../../../future/components/better-click-away-listener/better-click-away-listener'
import { useBackbone } from 'catalog-ui-search/src/main/webapp/component/selection-checkbox/useBackbone.hook'
import TypedMetacardDefs from './metacardDefinitions'
import { LazyQueryResult } from 'catalog-ui-search/src/main/webapp/js/model/LazyQueryResult/LazyQueryResult'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd'
import Divider from '@material-ui/core/Divider'
const Common = require('catalog-ui-search/src/main/webapp/js/Common.js')
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import TextField from '@material-ui/core/TextField'
import { useDialog } from '@connexta/atlas/atoms/dialog'
import { KeyboardDateTimePicker } from '@connexta/atlas/atoms/pickers'
import { getDateTimeFormat } from 'catalog-ui-search/src/main/webapp/component/user/utils'
import useSnack from '../../hooks/useSnack'
import LinearProgress from '@material-ui/core/LinearProgress'
const $ = require('jquery')
const ResultUtils = require('catalog-ui-search/src/main/webapp/js/ResultUtils.js')
import PublishIcon from '@material-ui/icons/Publish'
const HandleBarsHelpers = require('catalog-ui-search/src/main/webapp/js/HandlebarsHelpers.js')
import AutoSizer from 'react-virtualized-auto-sizer'
import { useTheme } from '@material-ui/core'
//metacardDefinitions.metacardTypes[attribute].type
//metacardDefinitions.metacardTypes[attribute].multivalued
//properties.isReadOnly(attribute)
//properties.attributeAliases[attribute]
//metacardDefinitions.validation[attribute]
//metacardDefinitions.enums[attribute]
//properties.requiredAttributes.includes(property)
//metacardDefinitions.isHiddenTypeExceptThumbnail(property)
/**
 *  _setCalculatedType() {
    let calculatedType

    switch (this.get('type')) {
      case 'DATE':
        calculatedType = 'date'
        break
      case 'TIME':
        calculatedType = 'time'
        break
      case 'BINARY':
        calculatedType = 'thumbnail'
        break
      case 'LOCATION':
        calculatedType = 'location'
        break
      case 'TEXTAREA':
        calculatedType = 'textarea'
        break
      case 'BOOLEAN':
        calculatedType = 'boolean'
        break
      case 'LONG':
      case 'DOUBLE':
      case 'FLOAT':
      case 'INTEGER':
      case 'SHORT':
        calculatedType = 'number'
        break
      case 'RANGE':
        calculatedType = 'range'
        break
      case 'GEOMETRY':
        calculatedType = 'geometry'
        break
      case 'AUTOCOMPLETE':
        calculatedType = 'autocomplete'
        break
      case 'COLOR':
        calculatedType = 'color'
        break
      case 'NEAR':
        calculatedType = 'near'
        break
      case 'PASSWORD':
        calculatedType = 'password'
        break
      case 'STRING':
      case 'XML':
      default:
        calculatedType = 'text'
        break
    }
 */

function getSummaryShown(): string[] {
  const userchoices = user
    .get('user')
    .get('preferences')
    .get('inspector-summaryShown')
  if (userchoices.length > 0) {
    return userchoices
  }
  if (properties.summaryShow.length > 0) {
    return properties.summaryShow
  }
  return ['title', 'created', 'thumbnail']
}

type Props = {
  selectionInterface: any
}
type Mode = 'normal' | 'adjust'

const ThumbnailInput = ({
  value,
  onChange = () => {},
  disabled = false,
}: {
  value: string
  disabled: boolean
  onChange?: (val: string) => void
}) => {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  return (
    <Grid
      container
      direction="row"
      alignItems="stretch"
      alignContent="stretch"
      wrap="nowrap"
    >
      <Grid item style={{ overflow: 'hidden' }}>
        <input
          type="file"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={e => {
            if (imgRef.current === null) {
              return
            }
            const reader = new FileReader()
            reader.onload = function(event) {
              try {
                //@ts-ignore
                onChange(event.target.result)
              } catch (err) {
                console.log('something wrong with file type')
              }
            }
            reader.onerror = () => {
              console.log('error')
            }
            //@ts-ignore
            reader.readAsDataURL(e.target.files[0])
          }}
        />
        <a
          target="_blank"
          href={TypedMetacardDefs.getImageSrc({ val: value })}
          style={{ padding: '0px' }}
        >
          <img
            src={TypedMetacardDefs.getImageSrc({ val: value })}
            ref={imgRef}
            style={{ maxWidth: '100%', maxHeight: '50vh' }}
          />
        </a>
      </Grid>
      <Grid item>
        <Button
          style={{ height: '100%' }}
          variant="outlined"
          disabled={disabled}
          onClick={() => {
            if (fileRef.current !== null) {
              fileRef.current.click()
            }
          }}
        >
          <PublishIcon />
        </Button>
      </Grid>
    </Grid>
  )
}

const Editor = ({
  label,
  attr,
  value,
  lazyResult,
  onCancel = () => {},
  onSave = () => {},
}: {
  label: string
  attr: string
  value: any[]
  lazyResult: LazyQueryResult
  onCancel?: () => void
  onSave?: () => void
}) => {
  const [mode, setMode] = React.useState('normal' as 'normal' | 'saving')
  const [values, setValues] = React.useState(value)
  const isMultiValued = TypedMetacardDefs.isMulti({ attr })
  const attrType = TypedMetacardDefs.getType({ attr })
  const addSnack = useSnack()
  return (
    <>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', wordBreak: 'break-word' }}
      >
        Editing {label} of:
      </Typography>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', wordBreak: 'break-word' }}
      >
        "{lazyResult.plain.metacard.properties.title}"
      </Typography>
      <Divider style={{ margin: '10px' }} />

      {values.map((val: any, index: number) => {
        return (
          <>
            {index !== 0 ? <Divider style={{ margin: '5px 0px' }} /> : null}
            <Grid
              container
              direction="row"
              alignItems="center"
              wrap="nowrap"
              style={{ padding: '10px' }}
            >
              <Grid item style={{ width: '100%' }}>
                {(() => {
                  switch (attrType) {
                    case 'DATE':
                      return (
                        <KeyboardDateTimePicker
                          disabled={mode === 'saving'}
                          value={val}
                          onChange={(e: any) => {
                            values[index] = e.toISOString()
                            setValues([...values])
                          }}
                          DialogProps={{
                            disablePortal: true,
                            style: {
                              minWidth: '500px',
                            },
                          }}
                          format={getDateTimeFormat()}
                          fullWidth
                        />
                      )

                    case 'BINARY':
                      return (
                        <ThumbnailInput
                          disabled={mode === 'saving'}
                          value={val}
                          onChange={update => {
                            values[index] = update
                            setValues([...values])
                          }}
                        />
                      )
                    case 'BOOLEAN':
                      return (
                        <Checkbox
                          disabled={mode === 'saving'}
                          checked={val}
                          onChange={e => {
                            values[index] = e.target.checked
                            setValues([...values])
                          }}
                          color="primary"
                        />
                      )
                    case 'LONG':
                    case 'DOUBLE':
                    case 'FLOAT':
                    case 'INTEGER':
                    case 'SHORT':
                      return (
                        <TextField
                          disabled={mode === 'saving'}
                          value={val}
                          onChange={e => {
                            values[index] = e.target.value
                            setValues([...values])
                          }}
                          type="number"
                          fullWidth
                        />
                      )
                    case 'GEOMETRY':
                      return (
                        <TextField
                          disabled={mode === 'saving'}
                          value={val}
                          onChange={e => {
                            values[index] = e.target.value
                            setValues([...values])
                          }}
                          fullWidth
                          helperText="WKT Syntax is supported for geometries, here are some examples:
                          POINT (50 40)
                          LINESTRING (30 10, 10 30, 40 40)
                          POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))
                          MULTIPOINT (10 40, 40 30, 20 20, 30 10)
                          MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))
                          MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))
                          GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))"
                        />
                      )
                    default:
                      return (
                        <TextField
                          disabled={mode === 'saving'}
                          value={val}
                          onChange={e => {
                            values[index] = e.target.value
                            setValues([...values])
                          }}
                          fullWidth
                        />
                      )
                  }
                })()}
              </Grid>
              {isMultiValued ? (
                <Grid item>
                  <Button
                    disabled={mode === 'saving'}
                    onClick={() => {
                      values.splice(index, 1)
                      setValues([...values])
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </Grid>
              ) : null}
            </Grid>
          </>
        )
      })}
      <Button
        disabled={mode === 'saving' || (!isMultiValued && values.length > 0)}
        onClick={() => {
          let defaultValue = ''
          switch (attrType) {
            case 'DATE':
              defaultValue = new Date().toISOString()
              break
          }
          setValues([...values, defaultValue])
        }}
      >
        Add New Value
      </Button>
      <Divider style={{ margin: '10px' }} />
      <div style={{ position: 'relative' }}>
        <Button
          disabled={mode === 'saving'}
          color="secondary"
          onClick={() => {
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={mode === 'saving'}
          color="primary"
          onClick={() => {
            setMode('saving')
            let transformedValues = values
            try {
              transformedValues =
                attrType === 'BINARY'
                  ? values.map(subval => subval.split(',')[1])
                  : values
            } catch (err) {
              console.log(err)
            }
            const payload = [
              {
                ids: [lazyResult.plain.metacard.properties.id],
                attributes: [
                  {
                    attribute: attr,
                    values: transformedValues,
                  },
                ],
              },
            ]
            setTimeout(() => {
              $.ajax({
                url: './internal/metacards',
                type: 'PATCH',
                data: JSON.stringify(payload),
                contentType: 'application/json',
              })
                .then((response: any) => {
                  ResultUtils.updateResults(lazyResult.getBackbone(), response)
                })
                .always(() => {
                  setTimeout(() => {
                    addSnack('Successfully updated.')
                    onSave()
                  }, 1000)
                })
            }, 1000)
          }}
        >
          Save
        </Button>
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
      </div>
    </>
  )
}

const DeleteEditor = ({
  label,
  attr,
  lazyResult,
  onCancel = () => {},
  onSave = () => {},
}: {
  label: string
  attr: string
  lazyResult: LazyQueryResult
  onCancel?: () => void
  onSave?: () => void
}) => {
  const [mode, setMode] = React.useState('normal' as 'normal' | 'saving')
  const addSnack = useSnack()
  return (
    <>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', wordBreak: 'break-word' }}
      >
        Deleting {label} of:
      </Typography>
      <Typography
        variant="h5"
        style={{ textAlign: 'center', wordBreak: 'break-word' }}
      >
        "{lazyResult.plain.metacard.properties.title}"
      </Typography>
      <Divider style={{ margin: '10px' }} />
      <div style={{ position: 'relative' }}>
        <Button
          disabled={mode === 'saving'}
          color="secondary"
          onClick={() => {
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={mode === 'saving'}
          color="primary"
          onClick={() => {
            setMode('saving')
            const payload = [
              {
                ids: [lazyResult.plain.metacard.properties.id],
                attributes: [
                  {
                    attribute: attr,
                    values: [],
                  },
                ],
              },
            ]
            setTimeout(() => {
              $.ajax({
                url: './internal/metacards',
                type: 'PATCH',
                data: JSON.stringify(payload),
                contentType: 'application/json',
              })
                .then((response: any) => {
                  ResultUtils.updateResults(lazyResult.getBackbone(), response)
                })
                .always(() => {
                  setTimeout(() => {
                    addSnack('Successfully updated.')
                    onSave()
                  }, 1000)
                })
            }, 1000)
          }}
        >
          Save
        </Button>
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
      </div>
    </>
  )
}

const AttributeComponent = ({
  lazyResult,
  attr,
  mode = 'normal',
  summaryShown = [],
  canWrite = false,
  filter = '',
  width,
}: {
  attr: string
  lazyResult: LazyQueryResult
  mode?: Mode
  summaryShown?: string[]
  canWrite?: boolean
  filter?: string
  width: number
}) => {
  let value = lazyResult.plain.metacard.properties[attr]
  if (value === undefined || value === null) {
    value = []
  }
  if (value.constructor !== Array) {
    value = [value]
  }
  let label = TypedMetacardDefs.getAlias({ attr })
  const dialogContext = useDialog()
  const isReadonly = TypedMetacardDefs.isReadonly({ attr })
  const isFiltered =
    filter !== '' ? !label.toLowerCase().includes(filter.toLowerCase()) : false
  const isTiny = width < 500
  const notApplicable =
    Boolean(
      TypedMetacardDefs.getDefinition({
        type: lazyResult.plain.metacardType,
      })[attr]
    ) === false
  const readOnly = !canWrite || isReadonly || notApplicable
  const MemoItem = React.useMemo(
    () => {
      return (
        <Grid
          container
          direction="row"
          alignItems="center"
          wrap={isTiny ? 'wrap' : 'nowrap'}
          style={{ padding: '3px 4px' }}
        >
          <Grid
            item
            xs={isTiny ? 12 : mode === 'adjust' ? 6 : 4}
            style={{
              textAlign: isTiny ? 'left' : 'right',
              wordBreak: 'break-word',
              padding: '0px 5px',
            }}
          >
            {mode === 'normal' ? (
              <>
                <Typography>{label}</Typography>{' '}
              </>
            ) : (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={summaryShown.includes(attr)}
                    onChange={e => {
                      if (e.target.checked) {
                        const clonedSummaryShown = summaryShown.slice()
                        clonedSummaryShown.push(attr)
                        user
                          .get('user')
                          .get('preferences')
                          .set('inspector-summaryShown', clonedSummaryShown)
                        user.savePreferences()
                      } else {
                        const clonedSummaryShown = summaryShown.slice()
                        user
                          .get('user')
                          .get('preferences')
                          .set(
                            'inspector-summaryShown',
                            clonedSummaryShown.filter(
                              shownAttr => shownAttr !== attr
                            )
                          )
                        user.savePreferences()
                      }
                    }}
                    value="checkedB"
                    color="primary"
                  />
                }
                label={label}
              />
            )}
          </Grid>

          <Grid
            item
            xs={isTiny ? 12 : mode === 'adjust' ? 6 : 8}
            style={{
              wordBreak: 'break-word',
              padding: '0px 5px',
              marginLeft: isTiny ? '10px' : '0px',
              overflow: 'hidden',
            }}
          >
            {value.map((val: any, index: number) => {
              return (
                <>
                  {index !== 0 ? (
                    <Divider style={{ margin: '5px 0px' }} />
                  ) : null}
                  <div>
                    {(() => {
                      switch (TypedMetacardDefs.getType({ attr })) {
                        case 'DATE':
                          return (
                            <Typography title={Common.getMomentDate(val)}>
                              {user.getUserReadableDateTime(val)}
                            </Typography>
                          )

                        case 'BINARY':
                          return (
                            <a
                              target="_blank"
                              href={TypedMetacardDefs.getImageSrc({ val })}
                              style={{ padding: '0px' }}
                            >
                              <img
                                src={TypedMetacardDefs.getImageSrc({ val })}
                                style={{ maxWidth: '100%', maxHeight: '50vh' }}
                              />
                            </a>
                          )
                        case 'BOOLEAN':
                          return (
                            <Typography>{val ? 'true' : 'false'}</Typography>
                          )
                        default:
                          return <Typography>{val}</Typography>
                      }
                    })()}
                  </div>
                </>
              )
            })}
          </Grid>
          <Grid item style={{ marginLeft: 'auto' }}>
            <Button
              title={readOnly ? 'Readonly' : ''}
              disabled={readOnly}
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
                        padding: '20px',
                        width: '80vw',
                        minWidth: '500px',
                        minHeight: '60vh',
                        overflow: 'auto',
                      }}
                    >
                      <Editor
                        value={value}
                        attr={attr}
                        label={label}
                        lazyResult={lazyResult}
                        onCancel={() => {
                          dialogContext.setProps({
                            open: false,
                            children: null,
                          })
                        }}
                        onSave={() => {
                          dialogContext.setProps({
                            open: false,
                            children: null,
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
          </Grid>
          <Grid item>
            <Button
              title={readOnly ? 'Readonly' : ''}
              style={{
                pointerEvents: 'all',
                height: '100%',
              }}
              disabled={readOnly}
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
                        padding: '20px',
                        width: '80vw',
                        minWidth: '500px',
                        minHeight: '60vh',
                        overflow: 'auto',
                      }}
                    >
                      <DeleteEditor
                        attr={attr}
                        label={label}
                        lazyResult={lazyResult}
                        onCancel={() => {
                          dialogContext.setProps({
                            open: false,
                            children: null,
                          })
                        }}
                        onSave={() => {
                          dialogContext.setProps({
                            open: false,
                            children: null,
                          })
                        }}
                      />
                    </div>
                  ),
                })
              }}
            >
              <DeleteIcon />
            </Button>
          </Grid>
        </Grid>
      )
    },
    [mode, summaryShown, width]
  )
  return (
    <div style={{ display: isFiltered ? 'none' : 'block' }}>{MemoItem}</div>
  )
}

let persistantFilter = ''

const Summary = ({ selectionInterface }: Props) => {
  const theme = useTheme()
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })
  const [mode, setMode] = React.useState('normal' as Mode)
  const [showMode, setShowMode] = React.useState('populated' as
    | 'populated'
    | 'all')
  const [filter, setFilter] = React.useState(persistantFilter)
  const [summaryShown, setSummaryShown] = React.useState(getSummaryShown())
  const selection = Object.values(selectedResults)[0] as
    | LazyQueryResult
    | undefined
  const [canWrite, setCanWrite] = React.useState(
    selection &&
      !selection.isRemote() &&
      (user.canWrite(selection.getBackbone()) as boolean)
  )

  const { listenTo } = useBackbone()
  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:inspector-summaryShown change:dateTimeFormat change:timeZone',
      () => {
        setSummaryShown([...getSummaryShown()])
      }
    )
  }, [])
  const everythingElse = React.useMemo(
    () => {
      return selection && mode === 'adjust'
        ? Object.keys(selection.plain.metacard.properties)
            .filter(attr => {
              return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({ attr })
            })
            .filter(attr => {
              return !summaryShown.includes(attr)
            })
        : []
    },
    [mode, summaryShown]
  )
  const blankEverythingElse = React.useMemo(
    () => {
      return selection && mode === 'adjust' && showMode === 'all'
        ? Object.values(
            TypedMetacardDefs.getDefinition({
              type: selection.plain.metacardType,
            })
          )
            .filter(val => {
              if (summaryShown.includes(val.id)) {
                return false
              }
              if (everythingElse.includes(val.id)) {
                return false
              }
              return true
            })
            .filter(val => {
              return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({
                attr: val.id,
              })
            })
        : []
    },
    [mode, showMode, summaryShown]
  )
  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!selection) {
          return <div>No result selected</div>
        }
        const isTiny = width < 500
        return (
          <div
            style={{
              height,
              width,
              overflow: 'auto',
              padding: '10px',
            }}
          >
            <Grid
              container
              direction="row"
              alignItems="center"
              wrap="nowrap"
              justify="space-between"
              style={{
                padding: '5px 10px',
                marginBottom: isTiny ? '5px' : '0px',
              }}
            >
              <Grid item>
                <Button
                  onClick={() => {
                    if (mode === 'normal') {
                      setMode('adjust')
                    } else {
                      setMode('normal')
                    }
                  }}
                  color={mode === 'normal' ? 'default' : 'primary'}
                  size="small"
                  style={{ height: 'auto' }}
                >
                  {mode === 'normal' ? 'Adjust Layout' : 'Finish Adjustment'}
                </Button>
              </Grid>
              <Grid item>
                {mode === 'adjust' ? (
                  <Button
                    onClick={() => {
                      if (showMode === 'populated') {
                        setShowMode('all')
                      } else {
                        setShowMode('populated')
                      }
                    }}
                    color="primary"
                    style={{ height: 'auto' }}
                  >
                    {showMode === 'populated'
                      ? 'Show All Fields'
                      : 'Show Populated Fields'}
                  </Button>
                ) : null}
              </Grid>
              <Grid item>
                <TextField
                  size="small"
                  variant="outlined"
                  label="Filter"
                  value={filter}
                  inputProps={{
                    style:
                      filter !== ''
                        ? {
                            borderBottom: `1px solid ${
                              theme.palette.secondary.main
                            }`,
                          }
                        : {},
                  }}
                  onChange={e => {
                    persistantFilter = e.target.value
                    setFilter(e.target.value)
                  }}
                />
              </Grid>
            </Grid>

            <DragDropContext
              onDragEnd={result => {
                if (result.reason === 'DROP' && result.destination) {
                  const originalIndex = result.source.index
                  const destIndex = result.destination.index
                  const clonedSummaryShown = summaryShown.slice()
                  clonedSummaryShown.splice(originalIndex, 1)
                  clonedSummaryShown.splice(destIndex, 0, result.draggableId)
                  user
                    .get('user')
                    .get('preferences')
                    .set('inspector-summaryShown', clonedSummaryShown)
                  user.savePreferences()
                }
              }}
            >
              <Droppable droppableId="test" isDropDisabled={mode !== 'adjust'}>
                {(droppableProvided, snapshot) => {
                  return (
                    <div
                      {...droppableProvided.droppableProps}
                      ref={droppableProvided.innerRef}
                    >
                      {summaryShown.map((attr, index) => {
                        return (
                          <Draggable
                            draggableId={attr}
                            index={index}
                            key={attr}
                            isDragDisabled={mode !== 'adjust'}
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <AttributeComponent
                                    lazyResult={selection}
                                    attr={attr}
                                    mode={mode}
                                    summaryShown={summaryShown}
                                    canWrite={canWrite}
                                    filter={filter}
                                    width={width}
                                  />
                                </div>
                              )
                            }}
                          </Draggable>
                        )
                      })}
                      {droppableProvided.placeholder}
                    </div>
                  )
                }}
              </Droppable>
            </DragDropContext>

            {mode === 'adjust' ? (
              <>
                {everythingElse.map(attr => {
                  return (
                    <AttributeComponent
                      lazyResult={selection}
                      key={attr}
                      attr={attr}
                      mode={mode}
                      summaryShown={summaryShown}
                      canWrite={canWrite}
                      filter={filter}
                      width={width}
                    />
                  )
                })}
                {blankEverythingElse.map(attr => {
                  return (
                    <AttributeComponent
                      key={attr.id}
                      lazyResult={selection}
                      attr={attr.id}
                      mode={mode}
                      summaryShown={summaryShown}
                      canWrite={canWrite}
                      filter={filter}
                      width={width}
                    />
                  )
                })}
              </>
            ) : (
              <></>
            )}
          </div>
        )
      }}
    </AutoSizer>
  )
}

export default hot(module)(Summary)
