import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import ExpandInteraction from './expand-interaction'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })
import { expect } from 'chai'

describe('smoke test', () => {
  it('it handles undefined', () => {
    const wrapper = mount(
      <Router>
        <ExpandInteraction onClose={() => {}} model={undefined} />
      </Router>
    )
    expect(wrapper.html()).to.eq('')
  })

  it('it handles empty array', () => {
    const wrapper = mount(
      <Router>
        <ExpandInteraction onClose={() => {}} model={[]} />
      </Router>
    )
    expect(wrapper.html()).to.eq('')
  })
})
