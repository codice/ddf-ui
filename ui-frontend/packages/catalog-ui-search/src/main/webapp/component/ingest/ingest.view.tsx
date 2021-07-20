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
const Marionette = require('marionette')
const IngestDetails = require('../ingest-details/ingest-details.view.js')

export default Marionette.LayoutView.extend({
  className: 'w-full h-full',
  template() {
    return (
      <div className="ingest-details w-full h-full whitespace-no-wrap"></div>
    )
  },
  regions: {
    ingestDetails: '.ingest-details',
  },
  onBeforeShow() {
    this.ingestDetails.show(
      new IngestDetails({
        url: this.options.url || './internal/catalog/',
        extraHeaders: this.options.extraHeaders,
        handleUploadSuccess: this.options.handleUploadSuccess,
        preIngestValidator: null,
      })
    )
  },
})
