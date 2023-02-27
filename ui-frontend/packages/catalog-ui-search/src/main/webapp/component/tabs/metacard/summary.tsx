import * as React from 'react'
import { hot } from 'react-hot-loader'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import user from '../../singletons/user-instance'
import properties from '../../../js/properties'
import TypedMetacardDefs from './metacardDefinitions'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Checkbox from '@material-ui/core/Checkbox'
import Divider from '@material-ui/core/Divider'
import DeleteIcon from '@material-ui/icons/Delete'
import TextField from '@material-ui/core/TextField'
import { useDialog } from '../../dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import useSnack from '../../hooks/useSnack'
import LinearProgress from '@material-ui/core/LinearProgress'
import $ from 'jquery'
import PublishIcon from '@material-ui/icons/Publish'
import Paper from '@material-ui/core/Paper'
import useTheme from '@material-ui/core/styles/useTheme'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import TransferList, { useCustomReadOnlyCheck } from './transfer-list'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import Box from '@material-ui/core/Box'
import { Elevations } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
import { displayHighlightedAttrInFull } from './highlightUtil'
import DateTimePicker from '../../fields/date-time-picker'
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks'
import useCoordinateFormat from './useCoordinateFormat'
import { MetacardAttribute } from '../../../js/model/Types'
import ExtensionPoints from '../../../extension-points'
import LocationInputReact from '../../location-new/location-new.view'
import Common from '../../../js/Common'
function getSummaryShown(): string[] {
  const userchoices = user
    .get('user')
    .get('preferences')
    .get('inspector-summaryShown')
  if (userchoices.length > 0) {
    return userchoices
  }
  if ((properties as any).summaryShow.length > 0) {
    return (properties as any).summaryShow
  }
  return ['title', 'created', 'thumbnail']
}
type Props = {
  result: LazyQueryResult
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
          onChange={(e) => {
            if (imgRef.current === null) {
              return
            }
            const reader = new FileReader()
            reader.onload = function (event) {
              try {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                onChange(event.target.result)
              } catch (err) {
                console.error('something wrong with file type')
              }
            }
            reader.onerror = () => {
              console.error('error')
            }
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            reader.readAsDataURL(e.target.files[0])
          }}
        />
        <img
          src={TypedMetacardDefs.getImageSrc({ val: value })}
          ref={imgRef}
          style={{ maxWidth: '100%', maxHeight: '50vh' }}
        />
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
enum Mode {
  Normal = 'normal',
  Saving = 'saving',
  BadInput = 'bad-input',
}
const handleMetacardUpdate = ({
  lazyResult,
  attributes,
  onSuccess,
  onFailure,
}: {
  lazyResult: LazyQueryResult
  attributes: MetacardAttribute[]
  onSuccess: () => void
  onFailure: () => void
}) => {
  const payload = [
    {
      ids: [lazyResult.plain.metacard.properties.id],
      attributes,
    },
  ]
  setTimeout(() => {
    $.ajax({
      url: `./internal/metacards?storeId=${lazyResult.plain.metacard.properties['source-id']}`,
      type: 'PATCH',
      data: JSON.stringify(payload),
      contentType: 'application/json',
    }).then(
      (response: any) => {
        lazyResult.refreshFromEditResponse(response)
        onSuccess()
      },
      () => onFailure()
    )
  }, 1000)
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
  const [mode, setMode] = React.useState(Mode.Normal)
  const [values, setValues] = React.useState(
    Array.isArray(lazyResult.plain.metacard.properties[attr])
      ? lazyResult.plain.metacard.properties[attr].slice(0)
      : [lazyResult.plain.metacard.properties[attr]]
  )
  const label = TypedMetacardDefs.getAlias({ attr })
  const isMultiValued = TypedMetacardDefs.isMulti({ attr })
  const attrType = TypedMetacardDefs.getType({ attr })
  const enumForAttr = TypedMetacardDefs.getEnum({ attr: attr })
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
      <div className="text-2xl text-center px-2 pb-2 pt-4 font-normal truncate">
        Editing {label} of "{lazyResult.plain.metacard.properties.title}"
      </div>
      <Divider />
      <DialogContent style={{ minHeight: '30em', minWidth: '60vh' }}>
        {values.map((val: any, index: number) => {
          return (
            <Grid container direction="row" className="my-2">
              {index !== 0 ? <Divider style={{ margin: '5px 0px' }} /> : null}
              <Grid item md={11}>
                {(() => {
                  if (enumForAttr) {
                    return (
                      <Autocomplete
                        disabled={mode === 'saving'}
                        value={val}
                        onChange={(_e: any, newValue: string) => {
                          values[index] = newValue
                          setValues([...values])
                        }}
                        fullWidth
                        disableClearable
                        size="small"
                        options={enumForAttr}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" />
                        )}
                      />
                    )
                  }
                  switch (attrType) {
                    case 'DATE':
                      return (
                        <DateTimePicker
                          value={val}
                          onChange={(value) => {
                            values[index] = value
                            setValues([...values])
                          }}
                          TextFieldProps={{
                            disabled: mode !== Mode.Normal,
                            label: label,
                            variant: 'outlined',
                          }}
                          BPDateProps={{
                            disabled: mode !== Mode.Normal,
                          }}
                        />
                      )
                    case 'BINARY':
                      return (
                        <ThumbnailInput
                          disabled={mode !== Mode.Normal}
                          value={val}
                          onChange={(update) => {
                            values[index] = update
                            setValues([...values])
                          }}
                        />
                      )
                    case 'BOOLEAN':
                      return (
                        <Checkbox
                          disabled={mode !== Mode.Normal}
                          checked={val}
                          onChange={(e) => {
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
                          disabled={mode !== Mode.Normal}
                          value={val}
                          onChange={(e) => {
                            values[index] = e.target.value
                            setValues([...values])
                          }}
                          type="number"
                          fullWidth
                        />
                      )
                    case 'GEOMETRY':
                      return (
                        <LocationInputReact
                          onChange={(location: any) => {
                            if (location === null || location === 'INVALID') {
                              setMode(Mode.BadInput)
                            } else {
                              setMode(Mode.Normal)
                            }
                            values[index] = location
                            setValues([...values])
                          }}
                          value={val}
                        />
                      )
                    default:
                      return (
                        <TextField
                          disabled={mode !== Mode.Normal}
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
                    disabled={mode === Mode.Saving}
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
        {isMultiValued && values.length > 0 && (
          <Button
            disabled={mode === Mode.Saving}
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
          disabled={mode === Mode.Saving}
          variant="text"
          onClick={() => {
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={mode !== Mode.Normal}
          variant="contained"
          color="primary"
          onClick={() => {
            setMode(Mode.Saving)
            let transformedValues = values
            try {
              transformedValues =
                attrType === 'BINARY'
                  ? values.map((subval: any) => subval.split(',')[1])
                  : values
            } catch (err) {
              console.error(err)
            }
            const attributes = [{ attribute: attr, values: transformedValues }]
            const onSuccess = () =>
              setTimeout(() => {
                addSnack('Successfully updated.')
                onSave()
              }, 1000)
            const onFailure = () =>
              setTimeout(() => {
                addSnack('Failed to update.', { status: 'error' })
                onSave()
              }, 1000)
            if (ExtensionPoints.handleMetacardUpdate) {
              ExtensionPoints.handleMetacardUpdate({
                lazyResult,
                attributesToUpdate: attributes,
              }).then(onSuccess, onFailure)
            } else {
              handleMetacardUpdate({
                lazyResult,
                attributes,
                onSuccess,
                onFailure,
              })
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
      {mode === Mode.Saving ? (
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
  showEmpty,
  summaryShown = [],
  filter = '',
  forceRender,
}: {
  attr: string
  lazyResult: LazyQueryResult
  showEmpty: boolean
  summaryShown?: string[]
  filter?: string
  forceRender: boolean
}) => {
  let value = lazyResult.plain.metacard.properties[attr]
  if (!showEmpty) {
    if (value === undefined || value === null) {
      return null
    } else if (typeof value === 'string' && !value.trim()) {
      return null
    } else if (Array.isArray(value) && value.length === 0) {
      return null
    }
  }
  if (value === undefined || value === null) {
    value = []
  }
  if (value.constructor !== Array) {
    value = [value]
  }
  let label = TypedMetacardDefs.getAlias({ attr })
  const { isNotWritable } = useCustomReadOnlyCheck()
  const dialogContext = useDialog()
  const convertToFormat = useCoordinateFormat()
  const isUrl = (value: any) => {
    if (value && typeof value === 'string') {
      const protocol = value.toLowerCase().split('/')[0]
      return protocol && (protocol === 'http:' || protocol === 'https:')
    }
    return false
  }
  const isFiltered =
    filter !== '' ? !label.toLowerCase().includes(filter.toLowerCase()) : false
  const MemoItem = React.useMemo(() => {
    return (
      <Grid
        container
        direction="row"
        wrap={'nowrap'}
        className="group relative"
      >
        {isNotWritable({ attribute: attr, lazyResult }) ? null : (
          <div className="p-1 hidden group-hover:block absolute right-0 top-0">
            <Button
              onClick={() => {
                dialogContext.setProps({
                  open: true,
                  disableEnforceFocus: true,
                  children: (
                    <Editor
                      attr={attr}
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
                  ),
                })
              }}
            >
              <EditIcon />
            </Button>
          </div>
        )}

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
            <Grid data-id={`${attr}-value`} item>
              {value.map((val: any, index: number) => {
                return (
                  <React.Fragment key={index}>
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
                              <img
                                src={TypedMetacardDefs.getImageSrc({ val })}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '50vh',
                                }}
                              />
                            )
                          case 'BOOLEAN':
                            return (
                              <Typography>{val ? 'true' : 'false'}</Typography>
                            )
                          case 'GEOMETRY':
                            return (
                              <Typography>{convertToFormat(val)}</Typography>
                            )
                          default:
                            if (lazyResult.highlights[attr]) {
                              if (attr === 'title') {
                                //Special case, title highlights don't get truncated
                                return (
                                  <Typography>
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          lazyResult.highlights[attr][0]
                                            .highlight,
                                      }}
                                    />
                                  </Typography>
                                )
                              }
                              {
                                return isUrl(val) ? (
                                  <Typography>
                                    <span className="highlight">
                                      <a href={val} target="_blank">
                                        {val}
                                      </a>
                                    </span>
                                  </Typography>
                                ) : (
                                  displayHighlightedAttrInFull(
                                    lazyResult.highlights[attr],
                                    val,
                                    index
                                  )
                                )
                              }
                            } else if (isUrl(val)) {
                              return (
                                <Typography>
                                  <a href={val} target="_blank">
                                    {val}
                                  </a>
                                </Typography>
                              )
                            } else {
                              return <Typography>{val}</Typography>
                            }
                        }
                      })()}
                    </div>
                  </React.Fragment>
                )
              })}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }, [summaryShown, forceRender, isNotWritable])
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
    .filter((val) => {
      if (activeAttributes.includes(val.id)) {
        return false
      }
      return true
    })
    .filter((val) => {
      return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({
        attr: val.id,
      })
    })
}
let globalExpanded = false // globally track if users want this since they may be clicking between results
const Summary = ({ result: selection }: Props) => {
  const theme = useTheme()
  const [forceRender, setForceRender] = React.useState(false)
  const [expanded, setExpanded] = React.useState(globalExpanded)
  /* Special case for when all the attributes are displayed */
  const [fullyExpanded, setFullyExpanded] = React.useState(false)
  const [filter, setFilter] = React.useState(persistantFilter)
  const [summaryShown, setSummaryShown] = React.useState(getSummaryShown())
  useRerenderOnBackboneSync({ lazyResult: selection })
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
  React.useEffect(() => {
    if (selection) {
      if (getHiddenAttributes(selection, summaryShown).length === 0) {
        setFullyExpanded(true)
      } else {
        setFullyExpanded(false)
      }
    }
  }, [summaryShown])
  const everythingElse = React.useMemo(() => {
    return selection && expanded
      ? Object.keys(selection.plain.metacard.properties)
          .filter((attr) => {
            return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({ attr })
          })
          .filter((attr) => {
            return !summaryShown.includes(attr)
          })
      : []
  }, [expanded, summaryShown])
  const blankEverythingElse = React.useMemo(() => {
    return selection
      ? Object.values(
          TypedMetacardDefs.getDefinition({
            type: selection.plain.metacardType,
          })
        )
          .filter((val) => {
            if (summaryShown.includes(val.id)) {
              return false
            }
            if (everythingElse.includes(val.id)) {
              return false
            }
            return true
          })
          .filter((val) => {
            return !TypedMetacardDefs.isHiddenTypeExceptThumbnail({
              attr: val.id,
            })
          })
      : []
  }, [expanded, summaryShown])
  React.useEffect(() => {
    globalExpanded = expanded
  }, [expanded])
  if (!selection) {
    return <div>No result selected</div>
  }
  const showEmpty: boolean = user
    .get('user')
    .get('preferences')
    .get('inspector-showEmpty')
  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      className="overflow-hidden w-full h-full"
    >
      <Grid item className="flex-shrink-0">
        <Grid
          container
          direction="row"
          alignItems="center"
          wrap="nowrap"
          justifyContent="space-between"
          className="p-2"
        >
          <Grid item>
            <Button
              data-id="manage-attributes-button"
              onClick={() => {
                dialogContext.setProps({
                  PaperProps: {
                    style: {
                      minWidth: 'none',
                    },
                    elevation: Elevations.panels,
                  },
                  open: true,
                  disableEnforceFocus: true,
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
                          .map((attr) => {
                            return attr.id
                          })
                          .sort()}
                        startingShowEmpty={showEmpty}
                        lazyResult={selection}
                        onSave={(active, newShowEmpty) => {
                          user.get('user').get('preferences').set({
                            'inspector-summaryShown': active,
                            'inspector-showEmpty': newShowEmpty,
                          })
                          user.savePreferences()
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
              data-id="summary-filter-input"
              size="small"
              variant="outlined"
              label="Filter"
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
                  showEmpty={showEmpty}
                  summaryShown={summaryShown}
                  filter={filter}
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
              {everythingElse.map((attr) => {
                return (
                  <div key={attr} className="relative">
                    <AttributeComponent
                      lazyResult={selection}
                      attr={attr}
                      showEmpty={showEmpty}
                      summaryShown={summaryShown}
                      filter={filter}
                      forceRender={forceRender}
                    />
                    <Divider
                      orientation="horizontal"
                      className="absolute top-0 w-full h-min"
                    />
                  </div>
                )
              })}
              {blankEverythingElse.map((attr) => {
                return (
                  <div key={attr.id} className="relative">
                    <AttributeComponent
                      lazyResult={selection}
                      attr={attr.id}
                      showEmpty={showEmpty}
                      summaryShown={summaryShown}
                      filter={filter}
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
              data-id="see-all-collapse-button"
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
}
export default hot(module)(Summary)
