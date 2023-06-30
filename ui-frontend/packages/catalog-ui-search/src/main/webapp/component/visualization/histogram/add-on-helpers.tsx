import extension from '../../../extension-points'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'

export const getHoverAddOn = (
  results: LazyQueryResult[],
  defaultHoverlabel: { bgcolor: string; font: { color: string } }
) => {
  const defaultHover = {
    text: '',
    bgColor: defaultHoverlabel.bgcolor,
    fontColor: defaultHoverlabel.font.color,
  }

  if (!extension.histogramHoverAddOn) return defaultHover

  return (
    extension.histogramHoverAddOn({
      results,
    }) || defaultHover
  )
}

export const getCustomHoverTemplates = (
  name: string,
  addOnArray: { text: string; bgColor: string; fontColor: string }[]
) => {
  return addOnArray.map(
    (addOn: any) => `%{y} ${name}${addOn.text}<extra></extra>`
  )
}

export const getCustomHoverLabels = (
  addOnArray: { text: string; bgColor: string; fontColor: string }[]
) => {
  return {
    bgcolor: addOnArray.map((addOn) => addOn.bgColor),
    font: { color: addOnArray.map((addOn) => addOn.fontColor) },
  }
}
