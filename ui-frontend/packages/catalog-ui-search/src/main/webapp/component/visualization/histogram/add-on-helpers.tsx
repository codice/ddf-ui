import extension from '../../../extension-points'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'

export type CustomHover = {
  text: string
  bgColor: string
  fontColor: string
}

export const getCustomHover = (
  results: LazyQueryResult[],
  defaultHoverlabel: { bgcolor: string; font: { color: string } }
) => {
  const defaultHover = {
    text: '',
    bgColor: defaultHoverlabel.bgcolor,
    fontColor: defaultHoverlabel.font.color,
  }

  if (!extension.customHistogramHover) return defaultHover

  return (
    extension.customHistogramHover({
      results,
    }) || defaultHover
  )
}

export const getCustomHoverTemplates = (
  name: string,
  customHoverArray: CustomHover[]
) => {
  return customHoverArray.map(
    (customHover: CustomHover) =>
      `%{y} ${name}${customHover.text}<extra></extra>`
  )
}

export const getCustomHoverLabels = (customHoverArray: CustomHover[]) => {
  return {
    bgcolor: customHoverArray.map((customHover) => customHover.bgColor)[0],
    font: {
      color: customHoverArray.map((customHover) => customHover.fontColor)[0],
    },
  }
}
