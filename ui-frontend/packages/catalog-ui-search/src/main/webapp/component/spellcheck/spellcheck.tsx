/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react'

import styled from 'styled-components'
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks'

const SHOW_MORE_LENGTH = 2

type Props = {
  selectionInterface: any
  model: any
}

const ShowingResultsForContainer = styled.div`
  padding: 0.15rem;
  text-align: center;
  font-size: 0.75rem;
  border: none !important;
`

const ShowMore = styled.a`
  padding: 0.15rem;
  font-size: 0.75rem;
`

const DidYouMeanContainer = styled.div`
  text-align: center;
  border: none !important;
`

const ResendQuery = styled.a`
  padding: 0.15rem;
  text-align: center;
  font-size: 0.75rem;
  text-decoration: none;
  width: 100%;
`

const Spellcheck = (props: Props) => {
  const [expandShowingResultForText, setExpandShowingResultForText] =
    React.useState(false)
  const [expandDidYouMeanFieldText, setExpandDidYouMeanFieldText] =
    React.useState(false)

  const createShowResultText = (showingResultsForFields: any[]) => {
    let showingResultsFor = 'Showing Results for '
    if (
      showingResultsForFields !== undefined &&
      showingResultsForFields !== null &&
      showingResultsForFields.length > 0
    ) {
      if (!expandShowingResultForText && showingResultsForFields.length > 2) {
        showingResultsFor += createCondensedResultsForText(
          showingResultsForFields
        )
        return showingResultsFor
      }

      showingResultsFor += createExpandedResultsForText(showingResultsForFields)
      return showingResultsFor
    }
    return null
  }

  const createDidYouMeanText = (didYouMeanFields: any[]) => {
    let didYouMean = 'Did you mean '
    if (
      didYouMeanFields !== undefined &&
      didYouMeanFields !== null &&
      didYouMeanFields.length > 0
    ) {
      if (!expandDidYouMeanFieldText && didYouMeanFields.length > 2) {
        didYouMean += createCondensedResultsForText(didYouMeanFields)
        return didYouMean
      }
      didYouMean += createExpandedResultsForText(didYouMeanFields)
      return didYouMean
    }
    return null
  }

  const createCondensedResultsForText = (showingResultsForFields: any[]) => {
    const copyQuery = [...showingResultsForFields]
    copyQuery.splice(0, copyQuery.length - SHOW_MORE_LENGTH)
    return copyQuery.join(', ')
  }

  const createExpandedResultsForText = (showingResultsForFields: any[]) => {
    return showingResultsForFields.join(', ')
  }

  const rerunQuery = (model: any) => {
    model.set('spellcheck', false)
    model.startSearchFromFirstPage()
    model.set('spellcheck', true)
  }

  const { selectionInterface, model } = props
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const results = Object.values(lazyResults.results)
  if (results.length === 0) {
    return null
  } else if (model.get('spellcheck')) {
    const { showingResultsForFields, didYouMeanFields } = lazyResults
    const showingResultsFor = createShowResultText(showingResultsForFields)
    const didYouMean = createDidYouMeanText(didYouMeanFields)

    return (
      <>
        {showingResultsFor !== null && (
          <ShowingResultsForContainer>
            {showingResultsFor}
            {showingResultsForFields !== null &&
              showingResultsForFields !== undefined &&
              showingResultsForFields.length > 2 && (
                <ShowMore
                  onClick={() => {
                    setExpandShowingResultForText(!expandShowingResultForText)
                  }}
                >
                  {expandShowingResultForText ? 'less' : 'more'}
                </ShowMore>
              )}
          </ShowingResultsForContainer>
        )}
        {didYouMean !== null && (
          <DidYouMeanContainer>
            <ResendQuery
              onClick={() => {
                rerunQuery(model)
              }}
            >
              {didYouMean}
            </ResendQuery>
            {didYouMeanFields !== null &&
              didYouMeanFields !== undefined &&
              didYouMeanFields.length > 2 && (
                <ShowMore
                  onClick={() => {
                    setExpandDidYouMeanFieldText(!expandDidYouMeanFieldText)
                  }}
                >
                  {expandDidYouMeanFieldText ? 'less' : 'more'}
                </ShowMore>
              )}
          </DidYouMeanContainer>
        )}
      </>
    )
  }
  return null
}

export default Spellcheck
