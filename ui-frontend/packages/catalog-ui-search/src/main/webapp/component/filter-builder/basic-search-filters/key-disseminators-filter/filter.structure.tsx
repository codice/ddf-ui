import {
  CQLStandardFilterBuilderClass,
  FilterBuilderClass,
  FilterClass,
  FilterContext,
} from '../../filter.structure'
import { KeyDisseminatorsPropertyName } from './property-name'

interface KeyDisseminatorsFilterClass
  extends Omit<FilterClass, 'property' | 'value'> {
  property: typeof KeyDisseminatorsPropertyName
  value: string[]
}

export class KeyDisseminatorsFilter
  extends FilterClass
  implements KeyDisseminatorsFilterClass
{
  property: typeof KeyDisseminatorsPropertyName
  value: string[]

  constructor({
    value = [],
    context,
  }: {
    value?: string[]
    context?: FilterContext
  } = {}) {
    super({
      property: KeyDisseminatorsPropertyName,
      value,
      context,
    })
    this.value = value
  }
}

export const isKeyDisseminatorsFilterClass = (
  filter:
    | FilterBuilderClass
    | FilterClass
    | CQLStandardFilterBuilderClass
    | Partial<FilterBuilderClass>
    | Partial<FilterClass>
    | Partial<CQLStandardFilterBuilderClass>
): filter is KeyDisseminatorsFilterClass => {
  try {
    return (filter as any)?.property === KeyDisseminatorsPropertyName
  } catch (err) {
    return false
  }
}
