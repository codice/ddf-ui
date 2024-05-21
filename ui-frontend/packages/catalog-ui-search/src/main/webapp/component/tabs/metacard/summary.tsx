import * as React from 'react'
import { hot } from 'react-hot-loader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import user from '../../singletons/user-instance'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import DeleteIcon from '@mui/icons-material/Delete'
import TextField from '@mui/material/TextField'
import { useDialog } from '../../dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import useSnack from '../../hooks/useSnack'
import LinearProgress from '@mui/material/LinearProgress'
import $ from 'jquery'
import PublishIcon from '@mui/icons-material/Publish'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { useCustomReadOnlyCheck } from './transfer-list'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import { Elevations } from '../../theme/theme'
import { DarkDivider } from '../../dark-divider/dark-divider'
import { displayHighlightedAttrInFull } from './highlightUtil'
import DateTimePicker from '../../fields/date-time-picker'
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks'
import useCoordinateFormat from './useCoordinateFormat'
import { MetacardAttribute } from '../../../js/model/Types'
import ExtensionPoints from '../../../extension-points'
import LocationInputReact from '../../location-new/location-new.view'
import { TypedUserInstance } from '../../singletons/TypedUser'
import { StartupDataStore } from '../../../js/model/Startup/startup'
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks'
import Common from '../../../js/Common'
import SummaryManageAttributes from '../../../react-component/summary-manage-attributes/summary-manage-attributes'
import moment from 'moment-timezone'

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
                console.error('there is something wrong with file type')
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
          src={Common.getImageSrc(value)}
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
  const [dirtyIndex, setDirtyIndex] = React.useState(-1)
  const { getAlias, isMulti, getType, getEnum } = useMetacardDefinitions()
  const label = getAlias(attr)
  const isMultiValued = isMulti(attr)
  const attrType = getType(attr)
  const enumForAttr = getEnum(attr)
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
                  if (enumForAttr.length > 0) {
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
                          isStateDirty={dirtyIndex === index}
                          resetIsStateDirty={() => setDirtyIndex(-1)}
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
                          maxRows={1000}
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
                      setDirtyIndex(index)
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
        {isMultiValued && (
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
            let transformedValues
            if (isMultiValued && values && values.length > 1) {
              transformedValues = values.filter(
                (val: any) => val != null && val !== ''
              )
            } else {
              transformedValues = values
            }

            try {
              switch (attrType) {
                case 'BINARY':
                  transformedValues = transformedValues.map(
                    (subval: any) => subval.split(',')[1]
                  )
                  break
                case 'DATE':
                  transformedValues = transformedValues.map((subval: any) =>
                    moment(subval).toISOString()
                  )
                  break
                case 'GEOMETRY':
                  transformedValues = values.filter(
                    (val: any) => val != null && val !== ''
                  )
                  break
              }
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
  hideEmpty,
  summaryShown = [],
  decimalPrecision = undefined,
  filter = '',
  forceRender,
}: {
  attr: string
  lazyResult: LazyQueryResult
  hideEmpty: boolean
  summaryShown?: string[]
  decimalPrecision: number | undefined
  filter?: string
  forceRender: boolean
}) => {
  let value = lazyResult.plain.metacard.properties[attr]
  if (hideEmpty) {
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
  const { getAlias, getType } = useMetacardDefinitions()
  let label = getAlias(attr)
  const { isNotWritable } = useCustomReadOnlyCheck()
  const dialogContext = useDialog()
  const convertToFormat = useCoordinateFormat()
  const convertToPrecision = (value: any) => {
    return value && decimalPrecision
      ? Number(value).toFixed(decimalPrecision)
      : value
  }
  const isUrl = (value: any) => {
    if (value && typeof value === 'string') {
      const protocol = value.toLowerCase().split('/')[0]
      return protocol && (protocol === 'http:' || protocol === 'https:')
    }
    return false
  }
  const isFiltered =
    filter !== '' ? !label.toLowerCase().includes(filter.toLowerCase()) : false
  const onCancel = () => {
    dialogContext.setProps({
      open: false,
      children: null,
    })
  }
  const onSave = () => {
    dialogContext.setProps({
      open: false,
      children: null,
    })
  }
  const CustomAttributeEditor = ExtensionPoints.attributeEditor(
    lazyResult,
    attr
  )
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
                  children: CustomAttributeEditor ? (
                    <CustomAttributeEditor
                      result={lazyResult}
                      attribute={attr}
                      onCancel={onCancel}
                      onSave={onSave}
                    />
                  ) : (
                    <Editor
                      attr={attr}
                      lazyResult={lazyResult}
                      onCancel={onCancel}
                      onSave={onSave}
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
                        switch (getType(attr)) {
                          case 'DATE':
                            return (
                              <Typography
                                title={TypedUserInstance.getMomentDate(val)}
                              >
                                {user.getUserReadableDateTime(val)}
                              </Typography>
                            )
                          case 'BINARY':
                            return (
                              <img
                                src={Common.getImageSrc(val)}
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
                          case 'LONG':
                          case 'DOUBLE':
                          case 'FLOAT':
                            return (
                              <Typography>{convertToPrecision(val)}</Typography>
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
    StartupDataStore.MetacardDefinitions.getMetacardDefinition(
      selection.plain.metacardType
    )
  )
    .filter((val) => {
      if (activeAttributes.includes(val.id)) {
        return false
      }
      return true
    })
    .filter((val) => {
      return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(val.id)
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
  const [decimalPrecision, setDecimalPrecision] = React.useState(
    TypedUserInstance.getDecimalPrecision()
  )
  const [summaryShown, setSummaryShown] = React.useState(
    TypedUserInstance.getResultsAttributesSummaryShown()
  )
  useRerenderOnBackboneSync({ lazyResult: selection })
  const { listenTo } = useBackbone()
  const { isHiddenAttribute, getMetacardDefinition } = useMetacardDefinitions()
  React.useEffect(() => {
    listenTo(
      user.get('user').get('preferences'),
      'change:inspector-summaryShown change:dateTimeFormat change:timeZone change:inspector-hideEmpty',
      () => {
        setSummaryShown([
          ...TypedUserInstance.getResultsAttributesSummaryShown(),
        ])
        setForceRender(true)
      }
    )
    listenTo(
      user.get('user').get('preferences'),
      'change:decimalPrecision',
      () => {
        setDecimalPrecision(TypedUserInstance.getDecimalPrecision())
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
            return !isHiddenAttribute(attr)
          })
          .filter((attr) => {
            return !summaryShown.includes(attr)
          })
      : []
  }, [expanded, summaryShown, isHiddenAttribute])
  const blankEverythingElse = React.useMemo(() => {
    return selection
      ? Object.values(getMetacardDefinition(selection.plain.metacardType))
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
            return !isHiddenAttribute(val.id)
          })
      : []
  }, [expanded, summaryShown, isHiddenAttribute])
  React.useEffect(() => {
    globalExpanded = expanded
  }, [expanded])
  if (!selection) {
    return <div>No result selected</div>
  }
  const hideEmpty: boolean = user
    .get('user')
    .get('preferences')
    .get('inspector-hideEmpty')
  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      className="overflow-hidden w-full h-full"
    >
      <Grid item className="shrink-0">
        <Grid
          container
          direction="row"
          alignItems="center"
          wrap="nowrap"
          justifyContent="space-between"
          className="p-2"
        >
          <Grid item>
            <SummaryManageAttributes />
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
      <Grid item className="shrink-1 overflow-auto p-2">
        <Paper elevation={Elevations.paper}>
          {summaryShown.map((attr, index) => {
            return (
              <div className="relative" key={attr}>
                <AttributeComponent
                  lazyResult={selection}
                  attr={attr}
                  hideEmpty={hideEmpty}
                  summaryShown={summaryShown}
                  decimalPrecision={decimalPrecision}
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
                      hideEmpty={hideEmpty}
                      summaryShown={summaryShown}
                      decimalPrecision={decimalPrecision}
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
                      hideEmpty={hideEmpty}
                      summaryShown={summaryShown}
                      decimalPrecision={decimalPrecision}
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
          <Grid item className="shrink-0 p-2">
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
