import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import ExpandInteraction from './expand-interaction'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
Enzyme.configure({ adapter: new Adapter() })
import { expect } from 'chai'
import Backbone from 'backbone'

describe('smoke test', () => {
  it('it handles undefined', () => {
    const wrapper = mount(
      <Router>
        <ExpandInteraction
          onClose={() => {}}
          model={undefined}
          listenTo={() => {}}
          stopListening={() => {}}
          listenToOnce={() => {}}
        />
      </Router>
    )
    expect(wrapper.html()).to.eq('')
  })

  it('it handles empty array', () => {
    const wrapper = mount(
      <Router>
        <ExpandInteraction
          onClose={() => {}}
          model={new Backbone.Collection()}
          listenTo={() => {}}
          stopListening={() => {}}
          listenToOnce={() => {}}
        />
      </Router>
    )
    expect(wrapper.html()).to.eq('')
  })
})
