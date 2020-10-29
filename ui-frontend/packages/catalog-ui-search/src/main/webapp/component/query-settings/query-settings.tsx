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

import PermanentSearchSort from '../../react-component/query-sort-selection/permanent-search-sort'

const properties = require('../../js/properties.js')
import * as React from 'react'
import SourceSelector from './source-selector'
import SourcesInfo from './sources-info'
import Phonetics from './phonetics'
import Spellcheck from './spellcheck'
import { hot } from 'react-hot-loader'
import { Memo } from '../memo/memo'

type Props = {
  model: Backbone.Model
}

/**
 * This is expensive to rerender, so we memo.  However, if the inner components aren't listening to the query,
 * this will not work.
 */
const QuerySettings = ({ model }: Props) => {
  return (
    <Memo dependencies={[model]}>
      <div>
        {properties.isSpellcheckEnabled ? (
          <div className="pb-2">
            <Spellcheck model={model} />
          </div>
        ) : null}
        {properties.isPhoneticsEnabled ? (
          <div className="pb-2">
            <Phonetics model={model} />
          </div>
        ) : null}
        <div className="pb-2">
          <PermanentSearchSort model={model} />
        </div>

        <div className="pb-2">
          <SourceSelector search={model} />
        </div>
        <div>
          <SourcesInfo />
        </div>
      </div>
    </Memo>
  )
}

export default hot(module)(QuerySettings)
