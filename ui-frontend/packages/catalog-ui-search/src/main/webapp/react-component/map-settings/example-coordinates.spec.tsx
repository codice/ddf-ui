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
import React from 'react'
import { expect } from 'chai'
import { testComponent as ExampleCoordinates } from './example-coordinates'
import { render } from '@testing-library/react'

describe('<ExampleCoordinates />', () => {
  const props = {
    selected: 'mgrs',
    examples: { mgrs: '4Q FL 23009 12331' },
  }

  it('displays empty example for unknown coordinate type', () => {
    const wrapper = render(<ExampleCoordinates selected="foo" />)
    // look for empty span, just one
    const span = wrapper.container.querySelector('span')
    expect(span).to.exist
    if (span) {
      expect(span.textContent).to.equal('')
    }
  })

  it('displays the correct example', () => {
    const wrapper = render(<ExampleCoordinates {...props} />)
    expect(wrapper.getByText('4Q FL 23009 12331')).to.exist
  })
})
