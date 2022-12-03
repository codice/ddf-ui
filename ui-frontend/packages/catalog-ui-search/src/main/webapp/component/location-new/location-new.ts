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

import Backbone from 'backbone';

import {
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'validat... Remove this comment to see the full error message
  validateWkt,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'validat... Remove this comment to see the full error message
  validateDd,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'validat... Remove this comment to see the full error message
  validateDms,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'validat... Remove this comment to see the full error message
  validateUsng,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'ddToWkt... Remove this comment to see the full error message
  ddToWkt,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'dmsToWk... Remove this comment to see the full error message
  dmsToWkt,
  // @ts-expect-error ts-migrate(2614) FIXME: Module '"./utils"' has no exported member 'usngToW... Remove this comment to see the full error message
  usngToWkt,
} from './utils';

// @ts-expect-error ts-migrate(2614) FIXME: Module '"./models"' has no exported member 'ddMode... Remove this comment to see the full error message
import { ddModel, dmsModel, usngModel } from './models';

export default Backbone.AssociatedModel.extend({
  defaults: {
    showErrors: true,
    valid: true,
    error: null,
    mode: 'wkt',
    wkt: '',
    dd: ddModel,
    dms: dmsModel,
    usng: usngModel,
  },

  initialize() {
    this.listenTo(
      this,
      'change:wkt change:dms change:dd change:usng change:mode',
      this.validate.bind(this)
    )
  },

  isValid() {
    return this.get('valid')
  },

  /*
   * Return the active input converted to WKT. If the input failed validation, return "INVALID".
   * If the input is blank, return null.
   */
  getValue() {
    if (!this.isValid()) {
      return 'INVALID'
    }

    const mode = this.get('mode')
    switch (mode) {
      case 'wkt':
        return this.get(mode)
      case 'dd':
        return ddToWkt(this.get(mode))
      case 'dms':
        return dmsToWkt(this.get(mode))
      case 'usng':
        return usngToWkt(this.get(mode))
      default:
        return null
    }
  },

  /* Run the appropriate validator for the active mode. Blank input is considered valid */
  validate() {
    const mode = this.get('mode')
    let validationReport
    switch (mode) {
      case 'wkt':
        validationReport = validateWkt(this.get(mode))
        break
      case 'dd':
        validationReport = validateDd(this.get(mode))
        break
      case 'dms':
        validationReport = validateDms(this.get(mode))
        break
      case 'usng':
        validationReport = validateUsng(this.get(mode))
        break
    }
    this.set('valid', validationReport ? validationReport.valid : true)
    this.set('error', validationReport ? validationReport.error : false)
  },
})
