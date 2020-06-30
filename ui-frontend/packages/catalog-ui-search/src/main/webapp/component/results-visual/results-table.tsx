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
import ResultItem from './result-item'
import { hot } from 'react-hot-loader'
import { AutoVariableSizeList } from 'react-window-components'
const TableHeaderView = require('catalog-ui-search/src/main/webapp/component/visualization/table/thead.view')
import MRC from 'catalog-ui-search/src/main/webapp/react-component/marionette-region-container'

type Props = {
  results: any
  selectionInterface: any
}

const ResultTable = ({ results, selectionInterface }: Props) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MRC
        view={TableHeaderView}
        viewOptions={{
          selectionInterface,
          filteredAttributes: [],
        }}
      />
      <AutoVariableSizeList<any, HTMLDivElement>
        controlledMeasuring={true}
        items={results.models}
        Item={({ itemRef, item, measure, index }) => {
          return (
            <div ref={itemRef}>
              {index !== 0 ? <div style={{ height: '10px' }} /> : null}
              <ResultItem
                model={item}
                selectionInterface={selectionInterface}
                measure={measure}
                index={index}
              />
            </div>
          )
        }}
        Empty={() => {
          return (
            <div className="result-item-collection-empty">No Results Found</div>
          )
        }}
      />
    </div>
  )
}

export default hot(module)(ResultTable)
