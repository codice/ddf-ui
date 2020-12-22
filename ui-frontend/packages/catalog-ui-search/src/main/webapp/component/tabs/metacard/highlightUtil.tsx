import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import { AttributeHighlight } from '../../../js/model/LazyQueryResult/LazyQueryResults'

const comparator = (a: AttributeHighlight, b: AttributeHighlight) => {
  const aIndex = parseInt(a.startIndex)
  const bIndex = parseInt(b.startIndex)
  if (aIndex < bIndex) {
    return -1
  } else if (aIndex === bIndex) {
    return 0
  } else if (aIndex > bIndex) {
    return 1
  }
  return 0
}

export const displayHighlightedAttrInFull = (
  highlights: Array<AttributeHighlight>,
  text: string,
  index: number
) => {
  //sort these in the order in which they appear
  highlights.sort(comparator)
  // only use the highlights from this value if multivalued
  const filteredHighlights = highlights.filter(
    highlight => parseInt(highlight.valueIndex) === index
  )
  let textArray = []
  let currentIndex = 0
  filteredHighlights.forEach((highlight, index) => {
    const highlightStart = parseInt(highlight.startIndex)
    const highlightEnd = parseInt(highlight.endIndex)
    const beforeText = (
      <span
        dangerouslySetInnerHTML={{
          __html: text.substring(currentIndex, highlightStart),
        }}
      />
    )
    const highlightText = (
      <span className="highlight" data-id={index}>
        {text.substring(highlightStart, highlightEnd)}
      </span>
    )
    currentIndex = highlightEnd
    textArray.push(beforeText)
    textArray.push(highlightText)
  })
  const afterText = (
    <span
      dangerouslySetInnerHTML={{
        __html: text.substring(currentIndex),
      }}
    />
  )
  textArray.push(afterText)
  return <Typography>{textArray}</Typography>
}
