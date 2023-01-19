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
import Backbone from 'backbone'
import properties from '../properties'
export default Backbone.Model.extend({
  defaults() {
    const hasDefaultSources =
      (properties as any).defaultSources &&
      (properties as any).defaultSources.length > 0
    const sources = hasDefaultSources
      ? (properties as any).defaultSources
      : ['all']
    return {
      type: 'text',
      sources,
      sorts: [
        {
          attribute: 'modified',
          direction: 'descending',
        },
      ],
      template: undefined,
      spellcheck: false,
      phonetics: false,
    }
  },
  isTemplate(template: any) {
    if (this.get('defaultResultFormId') === template.id) {
      return true
    }
    if (this.get('template') !== undefined) {
      return this.get('template').id === template.id
    } else {
      return false
    }
  },
  isDefaultTemplate(template: any) {
    return this.isTemplate(template) && this.get('template').default
  },
})
