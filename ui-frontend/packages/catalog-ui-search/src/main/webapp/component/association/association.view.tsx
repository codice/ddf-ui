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

import Button from '@material-ui/core/Button'
import Popper from '@material-ui/core/Popper'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import * as React from 'react'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import DeleteIcon from '@material-ui/icons/Delete'
const Marionette = require('marionette')
const CustomElements = require('../../js/CustomElements.js')
const _ = require('underscore')

function determineChoices(view: any) {
  const currentMetacard = view.options.currentMetacard
  let choices = Object.values(
    view.options.selectionInterface
      .get('currentQuery')
      .get('result')
      .get('lazyResults').results
  )
    .filter(function (result: any) {
      return result['metacard.id'] !== currentMetacard.get('metacard').id
    })
    .filter(
      (result: any) =>
        !(result.isRevision() || result.isRemote() || result.isDeleted())
    )
    .reduce(
      (options: any, result: any) => {
        options.push({
          label: result.plain.metacard.properties.title,
          value: result['metacard.id'],
        })
        return options
      },
      [
        {
          label: 'Current Metacard',
          value: currentMetacard.get('metacard').id,
        },
      ].concat(
        view.options.knownMetacards
          .filter(
            (metacard: any) =>
              metacard.id !== currentMetacard.get('metacard').id
          )
          .map((metacard: any) => ({
            label: metacard.get('title'),
            value: metacard.id,
          }))
      )
    )
  choices = _.uniq(choices, false, (choice: any) => choice.value)
  return choices
}

const getChoiceById = ({ id, choices }: { id: string; choices: any[] }) => {
  return choices.filter((choice: any) => choice.value === id)[0]
}

const ParentLink = ({ view }: { view: any }) => {
  const [, setRender] = React.useState(Math.random())
  useListenTo(view.model, 'change:parent', () => {
    setRender(Math.random)
  })
  const currentMetacard = view.options.currentMetacard
  const currentId = view.model.get('parent')
  const label =
    currentMetacard.get('metacard').id === currentId
      ? 'Current Metacard'
      : getChoiceById({ id: currentId, choices: view.choices }).label
  return <a href={`#metacards/${currentId}`}>{label}</a>
}

const ChildLink = ({ view }: { view: any }) => {
  const [, setRender] = React.useState(Math.random())
  useListenTo(view.model, 'change:child', () => {
    setRender(Math.random)
  })
  const currentMetacard = view.options.currentMetacard
  const currentId = view.model.get('child')
  const label =
    currentMetacard.get('metacard').id === currentId
      ? 'Current Metacard'
      : getChoiceById({ id: currentId, choices: view.choices }).label
  return <a href={`#metacards/${currentId}`}>{label}</a>
}

const AssociationTo = ({
  view,
  modelValueName,
}: {
  view: any
  modelValueName: string
}) => {
  const [choices] = React.useState<{ label: string; value: string }[]>(
    view.choices
  )
  const [value, setValue] = React.useState<string>(
    view.model.get(modelValueName) || view.choices[0].value
  )

  useListenTo(view.model, `change:${modelValueName}`, () => {
    setValue(view.model.get(modelValueName) || view.choices[0].value)
  })

  const currentChoice = choices.find((choice) => choice.value === value)
  return (
    <Autocomplete
      size="small"
      options={choices}
      onChange={(_e: any, newValue) => {
        view.model.set(modelValueName, newValue.value)
      }}
      getOptionSelected={(option) => option.value === value}
      getOptionLabel={(option) => {
        return option.label
      }}
      disableClearable
      value={currentChoice}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      PopperComponent={(props) => {
        return <Popper {...props} style={{ width: '250' }} />
      }}
    />
  )
}

const RelationshipType = ({ view }: { view: any }) => {
  const [isEditing, setIsEditing] = React.useState(view.model.get('isEditing'))
  const [choices] = React.useState<{ label: string; value: string }[]>([
    {
      label: 'related to',
      value: 'related',
    },
    {
      label: 'derived from',
      value: 'derived',
    },
  ])
  const [value, setValue] = React.useState<string>(
    view.model.get('relationship') || 'related'
  )

  useListenTo(view.model, `change:relationship`, () => {
    setValue(view.model.get('relationship') || 'related')
  })
  useListenTo(view.model, 'change:isEditing', () => {
    setIsEditing(view.model.get('isEditing'))
  })

  const currentChoice = choices.find((choice) => choice.value === value)
  return (
    <Autocomplete
      disabled={!isEditing}
      size="small"
      options={choices}
      onChange={(_e: any, newValue) => {
        view.model.set('relationship', newValue.value)
      }}
      getOptionSelected={(option) => option.value === value}
      getOptionLabel={(option) => {
        return option.label
      }}
      disableClearable
      value={currentChoice}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      PopperComponent={(props) => {
        return <Popper {...props} style={{ width: '250' }} />
      }}
    />
  )
}

export default Marionette.LayoutView.extend({
  tagName: CustomElements.register('association'),
  template() {
    return (
      <React.Fragment>
        <div className="association-content">
          <div className="association-parent">
            <AssociationTo view={this} modelValueName="parent" />
          </div>
          <div className="association-parent-link">
            <ParentLink view={this} />
          </div>
          <div className="association-relationship">
            <RelationshipType view={this} />
          </div>
          <div className="association-child">
            <AssociationTo view={this} modelValueName="child" />
          </div>
          <div className="association-child-link">
            <ChildLink view={this} />
          </div>
        </div>
        <Button
          className="association-remove"
          onClick={() => {
            // remove association
            this.model.collection.remove(this.model)
          }}
        >
          <DeleteIcon />
        </Button>
      </React.Fragment>
    )
  },
  initialize() {
    this.model.set('isEditing', false)
    const currentMetacardId = this.options.currentMetacard.get('metacard').id
    if (!this.model.get('parent')) {
      this.model.set('parent', currentMetacardId)
    }
    if (!this.model.get('child')) {
      this.model.set('child', currentMetacardId)
    }
    this.choices = determineChoices(this)
  },
  choices: undefined,
  onBeforeShow() {
    this.setupListeners()
    this.checkHeritage()
  },
  turnOnEditing() {
    this.model.set('isEditing', true)
    this.$el.toggleClass('is-editing', true)
    this.regionManager.forEach((region: any) => {
      if (region.currentView && region.currentView.turnOnEditing) {
        region.currentView.turnOnEditing()
      }
    })
  },
  turnOffEditing() {
    this.model.set('isEditing', false)
    this.$el.toggleClass('is-editing', false)
    this.regionManager.forEach((region: any) => {
      if (region.currentView && region.currentView.turnOffEditing) {
        region.currentView.turnOffEditing()
      }
    })
  },
  setupListeners() {
    this.listenTo(
      this.model,
      'change:parent change:child',
      this.ensureAtLeastOneCurrent
    )
  },
  ensureAtLeastOneCurrent(model: any) {
    const currentMetacard = this.options.currentMetacard
    const value = model.hasChanged('parent')
      ? model.get('parent')
      : model.get('child')
    if (value !== currentMetacard.get('metacard').id) {
      model.set(
        model.hasChanged('parent') ? 'child' : 'parent',
        currentMetacard.get('metacard').id
      )
    }
    this.checkHeritage()
  },
  checkHeritage() {
    const currentMetacard = this.options.currentMetacard
    this.$el.toggleClass(
      'is-parent',
      this.model.get('parent') === currentMetacard.get('metacard').id
    )
    this.$el.toggleClass(
      'is-child',
      this.model.get('child') === currentMetacard.get('metacard').id
    )
  },
})
