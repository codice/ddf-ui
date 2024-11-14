import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import ExpandInteraction from './expand-interaction'

import { expect } from 'chai'
import { render } from '@testing-library/react'

describe('smoke test', () => {
  it('it handles undefined', () => {
    const wrapper = render(
      <Router>
        <ExpandInteraction onClose={() => {}} model={undefined} />
      </Router>
    )
    expect(wrapper.container.innerHTML).to.eq('')
  })

  it('it handles empty array', () => {
    const wrapper = render(
      <Router>
        <ExpandInteraction onClose={() => {}} model={[]} />
      </Router>
    )
    expect(wrapper.container.innerHTML).to.eq('')
  })
})
