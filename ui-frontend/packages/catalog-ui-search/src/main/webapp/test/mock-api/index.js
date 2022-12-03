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
import User from '../../js/model/User';

import './metacardtype.json';
import './config.json';
import './metacardtype.json';
import './datatype.json';
import './sources.json';

const mockDataMap = {
  './internal/metacardtype',
  './internal/config',
  './internal/platform/config/ui',
  './internal/enumerations/attribute/datatype',
  './internal/user': User.Model.prototype.defaults(),
  './internal/localcatalogid': 'ddf.distribution',
  './internal/forms/result': [],
  './internal/catalog/sources',
}

import './enumerations.json';

const mockDataGlobs = {
  './internal/enumerations',
}

export default (url) => {
  let data = mockDataMap[url]
  if (data === undefined) {
    Object.keys(mockDataGlobs).forEach((glob) => {
      if (url.startsWith(glob)) {
        data = mockDataGlobs[glob]
      }
    })
  }
  if (data === undefined) {
    throw new Error(`Unknown url '${url}' for mock api.`)
  }
  return data
}
