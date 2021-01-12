/**
 * types for metacard defs
 */

import { hot } from 'react-hot-loader'
const metacardDefinitions = require('../../singletons/metacard-definitions')
const properties = require('../../../js/properties.js')
const Common = require('../../../js/Common.js')
type Attributetypes =
  | 'BINARY'
  | 'DATE'
  | 'LOCATION'
  | 'GEOMETRY'
  | 'LONG'
  | 'DOUBLE'
  | 'FLOAT'
  | 'INTEGER'
  | 'SHORT'
  | 'STRING'
  | 'BOOLEAN'
  | 'XML'
// window.metacardDefinitions = metacardDefinitions

export const TypedMetacardDefs = {
  /**
   * We exclude thumbnail because although it is a type of attribute (BINARY) we don't usually support viewing in the UI, we handle it
   */
  isHiddenTypeExceptThumbnail({ attr }: { attr: string }): boolean {
    return metacardDefinitions.isHiddenTypeExceptThumbnail(attr)
  },
  isHidden({ attr }: { attr: string }): boolean {
    return metacardDefinitions.isHiddenType(attr)
  },
  getAllKnownAttributes: (): string[] => {
    return []
  },
  // types that aren't real, but facilitate searching.  Filter these out in things like inspector or table since they aren't real attributes.
  getSearchOnlyAttributes: (): string[] => {
    return ['anyText', 'anyGeo']
  },
  getSortedMetacardTypes: (): {
    alias?: string
    hidden: boolean // not sure where this comes from, but it's not really accurate I think, use the isHidden methods instead
    id: string
    isInjected: boolean
    multivalued: boolean
    readOnly: boolean
    type:
      | 'BOOLEAN'
      | 'DATE'
      | 'LOCATION'
      | 'STRING'
      | 'BINARY'
      | 'INTEGER'
      | 'FLOAT'
      | 'GEOMETRY'
      | 'LONG'
      | 'SHORT'
      | 'XML'
      | 'DOUBLE'
  }[] => {
    return metacardDefinitions.sortedMetacardTypes
  },
  getType({ attr }: { attr: string }): Attributetypes {
    return metacardDefinitions.metacardTypes[attr].type
  },
  // O(1) lookup of attr alias
  getAlias({ attr }: { attr: string }): string {
    return properties.attributeAliases[attr] || attr
  },
  isMulti({ attr }: { attr: string }): boolean {
    return metacardDefinitions.metacardTypes[attr].multivalued || false
  },
  isReadonly({ attr }: { attr: string }): boolean {
    return properties.isReadOnly(attr) || false
  },
  getImageSrc({ val }: { val: string }): string {
    if (typeof val === 'string' && val.substring(0, 4) !== 'http') {
      return val.split('?_=')[0]
    }
    return Common.getImageSrc(val)
  },
  getDefinition({
    type,
  }: {
    type: string
  }): {
    [key: string]: {
      alias: undefined | string
      hidden: boolean
      id: string
      isInjected: boolean
      multivalued: boolean
      readOnly: boolean
      type: Attributetypes
    }
  } {
    return metacardDefinitions.metacardDefinitions[type] || {}
  },
  getEnum({ attr }: { attr: string }) {
    return metacardDefinitions.enums[attr] as string[] | undefined
  },
  typesFetched() {
    return metacardDefinitions.typesFetched as boolean
  },
  addMetacardDefinition(
    name: string,
    definition: {
      [key: string]: {
        id: string
        type: Attributetypes
      }
    }
  ): boolean {
    return metacardDefinitions.addMetacardDefinition(name, definition)
  },
  addMetacardDefinitions(definitions: {
    [key: string]: {
      [key: string]: {
        id: string
        type: Attributetypes
      }
    }
  }) {
    metacardDefinitions.addMetacardDefinitions(definitions)
  },
}

export default hot(module)(TypedMetacardDefs)
