import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { LazyQueryResults } from '../../../js/model/LazyQueryResult/LazyQueryResults'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import _cloneDeep from 'lodash.clonedeep'
import wreqr from '../../../js/wreqr'
import $ from 'jquery'
import _ from 'underscore'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import Plotly from 'plotly.js/dist/plotly'
import metacardDefinitions from '../../singletons/metacard-definitions'
import properties from '../../../js/properties'
import moment from 'moment'
import extension from '../../../extension-points'
import { useTheme } from '@mui/material/styles'
import {
  CustomHover,
  getCustomHoverLabels,
  getCustomHoverTemplates,
  getCustomHover,
} from './add-on-helpers'
const zeroWidthSpace = '\u200B'
const plotlyDateFormat = 'YYYY-MM-DD HH:mm:ss.SS'
function getPlotlyDate(date: string) {
  return moment(date).format(plotlyDateFormat)
}
function calculateAvailableAttributes(results: LazyQueryResult[]) {
  let availableAttributes = [] as string[]
  results.forEach((result) => {
    availableAttributes = _.union(
      availableAttributes,
      Object.keys(result.plain.metacard.properties)
    )
  })
  return availableAttributes
    .filter(
      (attribute) => metacardDefinitions.metacardTypes[attribute] !== undefined
    )
    .filter((attribute) => !metacardDefinitions.isHiddenType(attribute))
    .filter((attribute) => !properties.isHidden(attribute))
    .map((attribute) => ({
      label: metacardDefinitions.metacardTypes[attribute].alias || attribute,
      value: attribute,
    }))
}
function calculateAttributeArray({
  results,
  attribute,
}: {
  results: LazyQueryResult[]
  attribute: string
}) {
  const values = [] as string[]
  results.forEach((result) => {
    if (metacardDefinitions.metacardTypes[attribute].multivalued) {
      const resultValues = result.plain.metacard.properties[attribute]
      if (resultValues && resultValues.forEach) {
        resultValues.forEach((value: any) => {
          addValueForAttributeToArray({ valueArray: values, attribute, value })
        })
      } else {
        addValueForAttributeToArray({
          valueArray: values,
          attribute,
          value: resultValues,
        })
      }
    } else {
      addValueForAttributeToArray({
        valueArray: values,
        attribute,
        value: result.plain.metacard.properties[attribute],
      })
    }
  })
  return values
}
function findMatchesForAttributeValues(
  results: LazyQueryResult[],
  attribute: string,
  values: any[]
) {
  return results.filter((result) => {
    if (metacardDefinitions.metacardTypes[attribute].multivalued) {
      const resultValues = result.plain.metacard.properties[attribute]
      if (resultValues && resultValues.forEach) {
        for (let i = 0; i < resultValues.length; i++) {
          if (checkIfValueIsValid(values, attribute, resultValues[i])) {
            return true
          }
        }
        return false
      } else {
        return checkIfValueIsValid(values, attribute, resultValues)
      }
    } else {
      return checkIfValueIsValid(
        values,
        attribute,
        result.plain.metacard.properties[attribute]
      )
    }
  })
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function checkIfValueIsValid(values: any[], attribute: string, value: any) {
  if (value !== undefined) {
    switch (metacardDefinitions.metacardTypes[attribute].type) {
      case 'DATE':
        const plotlyDate = getPlotlyDate(value)
        return plotlyDate >= values[0] && plotlyDate <= values[1]
      case 'BOOLEAN':
      case 'STRING':
      case 'GEOMETRY':
        return values.indexOf(value.toString() + zeroWidthSpace) >= 0
      default:
        return value >= values[0] && value <= values[1]
    }
  }
}
function addValueForAttributeToArray({
  valueArray,
  attribute,
  value,
}: {
  valueArray: any[]
  attribute: string
  value: any
}) {
  if (value !== undefined) {
    switch (metacardDefinitions.metacardTypes[attribute].type) {
      case 'DATE':
        valueArray.push(getPlotlyDate(value))
        break
      case 'BOOLEAN':
      case 'STRING':
      case 'GEOMETRY':
        valueArray.push(value.toString() + zeroWidthSpace)
        break
      default:
        valueArray.push(parseFloat(value))
        break
    }
  }
}
function getIndexClicked(data: any) {
  return Math.max.apply(
    undefined,
    data.points.map((point: any) => point.pointNumber)
  ) as number
}
function getValueFromClick(data: any, categories: any) {
  switch (data.points[0].xaxis.type) {
    case 'category':
      return [data.points[0].x]
    case 'date':
      const currentDate = moment(data.points[0].x).format(plotlyDateFormat)
      return _.find(categories, (category: any) => {
        return currentDate >= category[0] && currentDate <= category[1]
      })
    default:
      return _.find(categories, (category: any) => {
        return (
          data.points[0].x >= category[0] && data.points[0].x <= category[1]
        )
      })
  }
}
function getLayout(fontColor: string, plot?: any) {
  const baseLayout = {
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: '"Open Sans Light","Helvetica Neue",Helvetica,Arial,sans-serif',
      size: 16,
      color: 'inherit',
      fill: 'inherit',
    },
    margin: {
      t: 10,
      l: 50,
      r: 115,
      b: 140,
      pad: 0,
      autoexpand: true,
    },
    barmode: 'overlay',
    xaxis: {
      fixedrange: true,
      color: fontColor,
    },
    yaxis: {
      fixedrange: true,
      color: fontColor,
    },
    showlegend: true,
    legend: {
      font: { color: fontColor },
    },
  } as any
  if (plot) {
    baseLayout.xaxis.autorange = false
    baseLayout.xaxis.range = plot._fullLayout.xaxis.range
    baseLayout.yaxis.range = plot._fullLayout.yaxis.range
    baseLayout.yaxis.autorange = false
  }
  return baseLayout
}
type Props = {
  selectionInterface: any
}
const getAutocompleteState = ({
  lazyResults,
  attributeToBin,
}: {
  lazyResults: LazyQueryResults
  attributeToBin: any
}) => {
  return {
    choices: calculateAvailableAttributes(Object.values(lazyResults.results)),
    value: attributeToBin,
  }
}
export const Histogram = ({ selectionInterface }: Props) => {
  const { listenTo } = useBackbone()
  const theme = useTheme()
  const isDarkTheme = theme.palette.mode === 'dark'
  const [noMatchingData, setNoMatchingData] = React.useState(false)
  const plotlyRef = React.useRef<HTMLDivElement>()
  const plotlyReadyForUpdatesRef = React.useRef(false)
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResults = useSelectedResults({ lazyResults })
  const [attributeToBin, setAttributeToBin] = React.useState('' as string)
  const [autocompleteState, setAutocompleteState] = React.useState(
    getAutocompleteState({ lazyResults, attributeToBin })
  )
  const results = Object.values(lazyResults.results)
  React.useEffect(() => {
    setNoMatchingData(false)
  }, [lazyResults.results, attributeToBin])
  React.useEffect(() => {
    setAutocompleteState(getAutocompleteState({ lazyResults, attributeToBin }))
  }, [lazyResults.results])
  React.useEffect(() => {
    showHistogram()
  }, [lazyResults.results, attributeToBin, theme])
  React.useEffect(() => {
    if (plotlyReadyForUpdatesRef.current) {
      // avoid updating the histogram if it's not ready yet
      updateHistogram()
    }
  }, [selectedResults])

  const defaultFontColor = isDarkTheme ? 'white' : 'black'
  const defaultHoverLabel = {
    bgcolor: isDarkTheme ? 'black' : 'white',
    font: {
      color: defaultFontColor,
    },
  }

  const getCustomHoverArray = (
    categories: any[],
    results: LazyQueryResult[]
  ) => {
    const customArray: CustomHover[] = []
    categories.forEach((category) => {
      const matchedResults = findMatchesForAttributeValues(
        results,
        attributeToBin,
        category.constructor === Array ? category : [category]
      )

      if (
        (matchedResults && matchedResults.length > 0) ||
        customArray.length > 0
      ) {
        customArray.push(getCustomHover(matchedResults, defaultHoverLabel))
      }
    })
    return customArray.length > 0 ? customArray : undefined
  }

  const determineInitialData = () => {
    return [
      {
        x: calculateAttributeArray({
          results,
          attribute: attributeToBin,
        }),
        opacity: 1,
        type: 'histogram',
        name: 'Hits',
        marker: {
          color: 'rgba(120, 120, 120, .05)',
          line: {
            color: 'rgba(120,120,120,.2)',
            width: '2',
          },
        },
        hovertemplate: '%{y} Hits<extra></extra>',
        hoverlabel: defaultHoverLabel,
      },
    ]
  }
  const determineData = (plot: any) => {
    const activeResults = results
    const xbins = _cloneDeep(plot._fullData[0].xbins)

    const categories: any[] = retrieveCategoriesFromPlotly()

    let customHoverArray: any = undefined
    let selectedCustomHoverArray: any = undefined

    if (extension.customHistogramHover) {
      customHoverArray = getCustomHoverArray(categories, results)

      selectedCustomHoverArray = getCustomHoverArray(
        categories,
        Object.values(selectedResults)
      )
    }

    return [
      {
        x: calculateAttributeArray({
          results: activeResults,
          attribute: attributeToBin,
        }),
        opacity: 1,
        type: 'histogram',
        name: 'Hits',
        marker: {
          color: 'rgba(120, 120, 120, .05)',
          line: {
            color: 'rgba(120,120,120,.2)',
            width: '2',
          },
        },
        hoverlabel: customHoverArray
          ? getCustomHoverLabels(customHoverArray)
          : defaultHoverLabel,
        hovertemplate: customHoverArray
          ? getCustomHoverTemplates('Hits', customHoverArray)
          : '%{y} Hits<extra></extra>',
        autobinx: false,
        xbins,
      },
      {
        x: calculateAttributeArray({
          results: Object.values(selectedResults),
          attribute: attributeToBin,
        }),
        opacity: 1,
        type: 'histogram',
        name: 'Selected',
        marker: {
          color: 'rgba(120, 120, 120, .2)',
          line: {
            color: 'rgba(120,120,120,.5)',
            width: '2',
          },
        },
        hoverlabel: selectedCustomHoverArray
          ? getCustomHoverLabels(selectedCustomHoverArray)
          : defaultHoverLabel,
        hovertemplate: selectedCustomHoverArray
          ? getCustomHoverTemplates('Selected', selectedCustomHoverArray)
          : '%{y} Selected<extra></extra>',
        autobinx: false,
        xbins,
      },
    ]
  }
  const handleResize = () => {
    if (plotlyRef.current) {
      const histogramElement = plotlyRef.current
      $(histogramElement).find('rect.drag').off('mousedown')
      if ((histogramElement as any)._context) {
        Plotly.Plots.resize(histogramElement)
      }
      $(histogramElement)
        .find('rect.drag')
        .on('mousedown', (event: any) => {
          shiftKey.current = event.shiftKey
          metaKey.current = event.metaKey
          ctrlKey.current = event.ctrlKey
        })
    }
  }
  React.useEffect(() => {
    const id = (Math.random() * 100).toFixed(0).toString()
    listenTo((wreqr as any).vent, 'resize', handleResize)
    $(window).on(`resize.${id}`, handleResize)
    return () => {
      $(window).off(`resize.${id}`)
    }
  }, [])
  const showHistogram = () => {
    plotlyReadyForUpdatesRef.current = false
    if (plotlyRef.current) {
      if (results.length > 0 && attributeToBin) {
        const histogramElement = plotlyRef.current
        const initialData = determineInitialData()
        if (initialData[0].x.length === 0) {
          setNoMatchingData(true)
        } else {
          Plotly.newPlot(
            histogramElement,
            initialData,
            getLayout(defaultFontColor),
            {
              displayModeBar: false,
            }
          ).then((plot: any) => {
            Plotly.newPlot(
              histogramElement,
              determineData(plot),
              getLayout(defaultFontColor, plot),
              {
                displayModeBar: false,
              }
            )
            handleResize()
            listenToHistogram()
            plotlyReadyForUpdatesRef.current = true
          })
        }
      } else {
        plotlyRef.current.innerHTML = ''
      }
    }
  }
  const updateHistogram = () => {
    if (plotlyRef.current) {
      const histogramElement = plotlyRef.current
      if (
        histogramElement !== null &&
        histogramElement.children.length !== 0 &&
        attributeToBin &&
        results.length > 0
      ) {
        try {
          Plotly.deleteTraces(histogramElement, 1)
        } catch (err) {
          console.error('Unable to delete trace', err)
        }
        Plotly.addTraces(histogramElement, determineData(histogramElement)[1])
        handleResize()
      } else {
        histogramElement.innerHTML = ''
      }
    }
  }
  const selectBetween = (firstIndex: number, lastIndex: number) => {
    for (let i = firstIndex; i <= lastIndex; i++) {
      if (pointsSelected.current.indexOf(i) === -1) {
        pointsSelected.current.push(i)
      }
    }
    const attributeToCheck = attributeToBin
    const categories = retrieveCategoriesFromPlotly()
    const validCategories = categories.slice(firstIndex, lastIndex)
    const activeSearchResults = results
    const validResults = validCategories.reduce(
      (results: any, category: any) => {
        results = results.concat(
          findMatchesForAttributeValues(
            activeSearchResults,
            attributeToCheck,
            category.constructor === Array ? category : [category]
          )
        )
        return results
      },
      [] as LazyQueryResult[]
    ) as LazyQueryResult[]
    validResults.forEach((result) => {
      result.setSelected(true)
    })
  }
  // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
  const retrieveCategoriesFromPlotlyForDates = () => {
    if (plotlyRef.current) {
      const histogramElement = plotlyRef.current
      const categories = []
      const xbins = (histogramElement as any)._fullData[0].xbins
      const min = xbins.start
      const max = parseInt(moment(xbins.end).format('x'))
      let start = parseInt(moment(min).format('x'))
      const inMonths = xbins.size.constructor === String
      const binSize = inMonths ? parseInt(xbins.size.substring(1)) : xbins.size
      while (start < max) {
        const startDate = moment(start).format(plotlyDateFormat)
        const endDate = inMonths
          ? moment(start).add(binSize, 'months').format(plotlyDateFormat)
          : moment(start).add(binSize, 'ms').format(plotlyDateFormat)
        categories.push([startDate, endDate])
        start = parseInt(
          inMonths
            ? moment(start).add(binSize, 'months').format('x')
            : moment(start).add(binSize, 'ms').format('x')
        )
      }
      return categories
    }
  }
  // This is an internal variable for Plotly, so it might break if we update Plotly in the future.
  // Regardless, there was no other way to reliably get the categories.
  const retrieveCategoriesFromPlotly = () => {
    if (plotlyRef.current) {
      const histogramElement = plotlyRef.current
      const xaxis = (histogramElement as any)._fullLayout.xaxis
      switch (xaxis.type) {
        case 'category':
          return xaxis._categories
        case 'date':
          return retrieveCategoriesFromPlotlyForDates()
        default:
          const xbins = (histogramElement as any)._fullData[0].xbins
          const min = xbins.start
          const max = xbins.end
          const binSize = xbins.size
          const categories = []
          var start = min
          while (start < max) {
            categories.push([start, start + binSize])
            start += binSize
          }
          return categories
      }
    }
  }
  const handleControlClick = (data: any, alreadySelected: boolean) => {
    const attributeToCheck = attributeToBin
    const categories = retrieveCategoriesFromPlotly()
    const matchedResults = findMatchesForAttributeValues(
      results,
      attributeToCheck,
      getValueFromClick(data, categories)
    )
    if (alreadySelected) {
      matchedResults.forEach((result) => {
        result.setSelected(false)
      })
      pointsSelected.current.splice(
        pointsSelected.current.indexOf(getIndexClicked(data)),
        1
      )
    } else {
      matchedResults.forEach((result) => {
        result.setSelected(true)
      })
      pointsSelected.current.push(getIndexClicked(data))
    }
  }
  const handleShiftClick = (data: any) => {
    const indexClicked = getIndexClicked(data)
    const firstIndex =
      pointsSelected.current.length === 0
        ? -1
        : pointsSelected.current.reduce(
            (currentMin, point) => Math.min(currentMin, point),
            pointsSelected.current[0]
          )
    const lastIndex =
      pointsSelected.current.length === 0
        ? -1
        : pointsSelected.current.reduce(
            (currentMin, point) => Math.max(currentMin, point),
            pointsSelected.current[0]
          )
    if (firstIndex === -1 && lastIndex === -1) {
      lazyResults.deselect()
      handleControlClick(data, false)
    } else if (indexClicked <= firstIndex) {
      selectBetween(indexClicked, firstIndex)
    } else if (indexClicked >= lastIndex) {
      selectBetween(lastIndex, indexClicked + 1)
    } else {
      selectBetween(firstIndex, indexClicked + 1)
    }
  }
  const plotlyClickHandler = (data: any) => {
    const indexClicked = getIndexClicked(data)
    const alreadySelected = pointsSelected.current.indexOf(indexClicked) >= 0
    if (shiftKey.current) {
      handleShiftClick(data)
    } else if (ctrlKey.current || metaKey.current) {
      handleControlClick(data, alreadySelected)
    } else {
      lazyResults.deselect()
      resetPointSelection()
      handleControlClick(data, alreadySelected)
    }
    resetKeyTracking()
  }
  const listenToHistogram = () => {
    if (plotlyRef.current) {
      const histogramElement = plotlyRef.current
      ;(histogramElement as any)._ev.addListener(
        'plotly_click',
        plotlyClickHandler
      )
    }
  }
  const shiftKey = React.useRef(false)
  const metaKey = React.useRef(false)
  const ctrlKey = React.useRef(false)
  const pointsSelected = React.useRef([] as number[])
  const resetKeyTracking = () => {
    shiftKey.current = false
    metaKey.current = false
    ctrlKey.current = false
  }
  const resetPointSelection = () => {
    pointsSelected.current = []
  }
  if (Object.keys(lazyResults.results).length === 0) {
    return <div style={{ padding: '20px' }}>No results found</div>
  }
  return (
    <>
      <div className="p-2">
        <Autocomplete
          size="small"
          options={autocompleteState.choices}
          onChange={(_e: any, newValue) => {
            setAttributeToBin(newValue.value)
          }}
          isOptionEqualToValue={(option) => option.value === attributeToBin}
          getOptionLabel={(option) => {
            return option.label
          }}
          disableClearable
          value={autocompleteState.choices.find(
            (choice) => choice.value === attributeToBin
          )}
          renderInput={(params) => (
            <TextField {...params} label="Group by" variant="outlined" />
          )}
        />
      </div>
      <div
        className="plotly-histogram"
        ref={plotlyRef as any}
        style={{
          height: 'calc(100% - 135px)',
          width: '100%',
          display: noMatchingData ? 'none' : 'block',
        }}
      />
      {noMatchingData ? (
        <div style={{ padding: '20px' }}>
          No data in this result set has that attribute
        </div>
      ) : null}
    </>
  )
}
export default hot(module)(Histogram)
