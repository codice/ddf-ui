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
// @ts-ignore ts-migrate(6133) FIXME: 'CreateLocationSearch' is declared but its value i... Remove this comment to see the full error message
import CreateLocationSearch from '../../react-component/metacard-interactions/location-interaction'
import ExpandMetacard from '../../react-component/metacard-interactions/expand-interaction'
import DownloadProduct from '../../react-component/metacard-interactions/download-interaction'
import ExportActions from '../../react-component/metacard-interactions/export-interaction'
import { Divider } from '../../react-component/metacard-interactions/metacard-interactions'

const DefaultItems = [ExpandMetacard, Divider, DownloadProduct, ExportActions]

export default DefaultItems as any[]
