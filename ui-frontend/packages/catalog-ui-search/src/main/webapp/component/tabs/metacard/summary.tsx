import * as React from 'react'
import { hot } from 'react-hot-loader'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
const user = require('../../singletons/user-instance')
const properties = require('../../../js/properties.js')
import TypedMetacardDefs from './metacardDefinitions'
import Checkbox from '@material-ui/core/Checkbox'
import Divider from '@material-ui/core/Divider'
const Common = require('../../../js/Common.js')
import DeleteIcon from '@material-ui/icons/Delete'
import TextField from '@material-ui/core/TextField'
import { useDialog } from '@connexta/atlas/atoms/dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import { KeyboardDateTimePicker } from '@connexta/atlas/atoms/pickers'
import { getDateTimeFormat } from '../../user/utils'
import useSnack from '../../hooks/useSnack'
import LinearProgress from '@material-ui/core/LinearProgress'
const $ = require('jquery')
const ResultUtils = require('../../../js/ResultUtils.js')
import PublishIcon from '@material-ui/icons/Publish'
import AutoSizer from 'react-virtualized-auto-sizer'
import Paper from '@material-ui/core/Paper'
import useTheme from '@material-ui/core/styles/useTheme'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import TransferList from './transfer-list'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import AddIcon from '@material-ui/icons/Add'
import Box from '@material-ui/core/Box'
import { Elevations, dark, light } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
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

export const Editor = ({
  attr,
  lazyResult,
  onCancel = () => {},
  onSave = () => {},
  goBack,
}: {
  attr: string
  lazyResult: LazyQueryResult
  onCancel?: () => void
  onSave?: () => void
  goBack?: () => void
}) => {
  const [mode, setMode] = React.useState('normal' as 'normal' | 'saving')
  const [values, setValues] = React.useState(
    Array.isArray(lazyResult.plain.metacard.properties[attr])
      ? lazyResult.plain.metacard.properties[attr]
      : [lazyResult.plain.metacard.properties[attr]]
  )
  const label = TypedMetacardDefs.getAlias({ attr })
  const isMultiValued = TypedMetacardDefs.isMulti({ attr })
  const attrType = TypedMetacardDefs.getType({ attr })
  const addSnack = useSnack()

  return (
    <>
      {goBack && (
        <Button
          variant="text"
          color="primary"
          startIcon={<KeyboardBackspaceIcon />}
          onClick={goBack}
        >
          Cancel and return to manage
        </Button>
      )}
      <DialogTitle style={{ textAlign: 'center' }}>
        Editing {label} of "{lazyResult.plain.metacard.properties.title}"
      </DialogTitle>
      <Divider />
      <DialogContent style={{ minHeight: '30em', minWidth: '60vh' }}>
        {values.map((val: any, index: number) => {
          return (
            <Grid container direction="row">
              {index !== 0 ? <Divider style={{ margin: '5px 0px' }} /> : null}
              <Grid item md={11}>
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
                          onChange={(e: any) => {
                            values[index] = e.target.value
                            setValues([...values])
                          }}
                          style={{ whiteSpace: 'pre-line', flexGrow: 50 }}
                          fullWidth
                          multiline={true}
                          rowsMax={1000}
                        />
                      )
                  }
                })()}
              </Grid>
              {isMultiValued ? (
                <Grid item md={1}>
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
          )
        })}
        {isMultiValued &&
          values.length > 0 && (
            <Button
              disabled={mode === 'saving'}
              variant="text"
              color="primary"
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
              <Box color="text.primary">
                <AddIcon />
              </Box>
              Add New Value
            </Button>
          )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          disabled={mode === 'saving'}
          variant="text"
          onClick={() => {
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={mode === 'saving'}
          variant="contained"
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
                url: `./internal/metacards?storeId=${
                  lazyResult.plain.metacard.properties['source-id']
                }`,
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

const AttributeComponent = ({
  lazyResult,
  attr,
  summaryShown = [],
  filter = '',
  width,
  forceRender,
}: {
  attr: string
  lazyResult: LazyQueryResult
  summaryShown?: string[]
  filter?: string
  width: number
  forceRender: boolean
}) => {
  let value = lazyResult.plain.metacard.properties[attr]
  if (value === undefined || value === null) {
    value = []
  }
  if (value.constructor !== Array) {
    value = [value]
  }
  let label = TypedMetacardDefs.getAlias({ attr })
  const isFiltered =
    filter !== '' ? !label.toLowerCase().includes(filter.toLowerCase()) : false
  const MemoItem = React.useMemo(
    () => {
      return (
        <Grid container direction="row" wrap={'nowrap'}>
          <Grid
            item
            xs={4}
            style={{
              wordBreak: 'break-word',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              padding: '10px',
            }}
            className="relative"
          >
            <Typography>{label}</Typography>
            <Divider
              orientation="vertical"
              className="absolute right-0 top-0 w-min h-full"
            />
          </Grid>
          <Grid
            item
            md={8}
            style={{
              wordBreak: 'break-word',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              padding: '10px',
            }}
          >
            <Grid container direction="row">
              <Grid item>
                {value.map((val: any, index: number) => {
                  return (
                    <>
                      {index !== 0 ? (
                        <Divider style={{ margin: '5px 0px' }} />
                      ) : null}
                      <div>
                        {(() => {
                          if (attr === 'ext.audio-snippet') {
                            const mimetype =
                              lazyResult.plain.metacard.properties[
                                'ext.audio-snippet-mimetype'
                              ]
                            const src = `data:${mimetype};base64,${val}`

                            return <audio controls src={src} />
                          }

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
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '50vh',
                                    }}
                                  />
                                </a>
                              )
                            case 'BOOLEAN':
                              return (
                                <Typography>
                                  {val ? 'true' : 'false'}
                                </Typography>
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
            </Grid>
          </Grid>
        </Grid>
      )
    },
    [summaryShown, width, forceRender]
  )
  return (
    <div style={{ display: isFiltered ? 'none' : 'block' }}>{MemoItem}</div>
  )
}

let persistantFilter = ''

/* Hidden attributes are simply the opposite of active */
/* They do not currently exist on the metacard OR are not shown in the summary */
const getHiddenAttributes = (
  selection: LazyQueryResult,
  activeAttributes: string[]
) => {
  return Object.values(
    TypedMetacardDefs.getDefinition({
      type: selection.plain.metacardType,
    })
  )
    .filter(val => {
      if (activeAttributes.includes(val.id)) {
        return false
      }
      return true
    })
    .filter(val => {
      return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({
        attr: val.id,
      })
    })
}

let globalExpanded = false // globally track if users want this since they may be clicking between results

const Summary = ({ selectionInterface }: Props) => {
  const theme = useTheme()
  const selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
    selectionInterface,
  })

  const [forceRender, setForceRender] = React.useState(false)
  const [expanded, setExpanded] = React.useState(globalExpanded)
  /* Special case for when all the attributes are displayed */
  const [fullyExpanded, setFullyExpanded] = React.useState(false)
  const [filter, setFilter] = React.useState(persistantFilter)
  const [summaryShown, setSummaryShown] = React.useState(getSummaryShown())
  const selection = Object.values(selectedResults)[0] as
    | LazyQueryResult
    | undefined

  const dialogContext = useDialog()

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
  React.useEffect(
    () => {
      if (selection) {
        if (getHiddenAttributes(selection, summaryShown).length === 0) {
          setFullyExpanded(true)
        } else {
          setFullyExpanded(false)
        }
      }
    },
    [summaryShown]
  )
  const everythingElse = React.useMemo(
    () => {
      return selection && expanded
        ? Object.keys(selection.plain.metacard.properties)
            .filter(attr => {
              return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({ attr })
            })
            .filter(attr => {
              return !summaryShown.includes(attr)
            })
        : []
    },
    [expanded, summaryShown]
  )
  const blankEverythingElse = React.useMemo(
    () => {
      return selection
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
    [expanded, summaryShown]
  )
  React.useEffect(
    () => {
      globalExpanded = expanded
    },
    [expanded]
  )
  return (
    <AutoSizer>
      {({ height, width }) => {
        if (!selection) {
          return <div>No result selected</div>
        }
        const isTiny = width < 500
        return (
          <Grid
            container
            direction="column"
            wrap="nowrap"
            className="overflow-hidden"
            style={{
              height,
              width,
            }}
          >
            <Grid item className="flex-shrink-0">
              <Grid
                container
                direction="row"
                alignItems="center"
                wrap="nowrap"
                justify="space-between"
                className="p-2"
                style={{
                  marginBottom: isTiny ? '5px' : '0px',
                }}
              >
                <Grid item>
                  <Button
                    onClick={() => {
                      dialogContext.setProps({
                        PaperProps: {
                          style: {
                            minWidth: 'none',
                          },
                          elevation: Elevations.panels,
                        },
                        open: true,
                        children: (
                          <div
                            style={{
                              minHeight: '60vh',
                            }}
                          >
                            <TransferList
                              startingLeft={summaryShown}
                              startingRight={getHiddenAttributes(
                                selection,
                                summaryShown
                              )
                                .map(attr => {
                                  return attr.id
                                })
                                .sort()}
                              updateActive={(active: string[]) => {
                                user
                                  .get('user')
                                  .get('preferences')
                                  .set('inspector-summaryShown', active)
                                user.savePreferences()
                              }}
                              lazyResult={selection}
                              onSave={() => {
                                // Force re-render after save to update values on page
                                // This is more reliable than "refreshing" the result which
                                // is frequently not synched up properly
                                setForceRender(!forceRender)
                              }}
                            />
                          </div>
                        ),
                      })
                    }}
                    color="primary"
                    size="small"
                    style={{ height: 'auto' }}
                  >
                    Manage Attributes
                  </Button>
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
            </Grid>
            <DarkDivider className="w-full h-min" />
            <Grid item className="flex-shrink-1 overflow-auto p-2">
              <Paper elevation={Elevations.paper}>
                {summaryShown.map((attr, index) => {
                  return (
                    <div className="relative" key={attr}>
                      <AttributeComponent
                        lazyResult={selection}
                        attr={attr}
                        summaryShown={summaryShown}
                        filter={filter}
                        width={width}
                        forceRender={forceRender}
                      />
                      {index !== 0 ? (
                        <Divider
                          orientation="horizontal"
                          className="absolute top-0 w-full h-min"
                        />
                      ) : null}
                    </div>
                  )
                })}

                {expanded ? (
                  <>
                    {everythingElse.map(attr => {
                      return (
                        <div key={attr} className="relative">
                          <AttributeComponent
                            lazyResult={selection}
                            attr={attr}
                            summaryShown={summaryShown}
                            filter={filter}
                            width={width}
                            forceRender={forceRender}
                          />
                          <Divider
                            orientation="horizontal"
                            className="absolute top-0 w-full h-min"
                          />
                        </div>
                      )
                    })}
                    {blankEverythingElse.map(attr => {
                      return (
                        <div key={attr.id} className="relative">
                          <AttributeComponent
                            lazyResult={selection}
                            attr={attr.id}
                            summaryShown={summaryShown}
                            filter={filter}
                            width={width}
                            forceRender={forceRender}
                          />
                          <Divider
                            orientation="horizontal"
                            className="absolute top-0 w-full h-min"
                          />
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <></>
                )}
              </Paper>
            </Grid>
            {/* If hidden attributes === 0, don't show this button */}
            {!fullyExpanded && (
              <>
                <DarkDivider className="w-full h-min" />
                <Grid item className="flex-shrink-0 p-2">
                  <Button
                    onClick={() => {
                      setExpanded(!expanded)
                    }}
                    size="small"
                    color="primary"
                  >
                    {expanded ? 'Collapse' : 'See all'}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        )
      }}
    </AutoSizer>
  )
}

export default hot(module)(Summary)
