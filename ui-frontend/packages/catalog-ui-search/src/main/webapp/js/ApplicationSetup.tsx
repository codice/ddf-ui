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
import 'focus-visible'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css'
import 'font-awesome/css/font-awesome.css'
import '../lib/cesium-drawhelper/DrawHelper.css'
import 'golden-layout/src/css/goldenlayout-base.css'
import 'golden-layout/src/css/goldenlayout-dark-theme.css'
import '../styles/fonts.css'
import '../styles/input-range.css'
import '../styles/additional-styles.css'
import '../styles/plotly.css'
import Backbone from 'backbone'
import './extensions/application.patches'
import '../component/singletons/session-auto-renew'
import $ from 'jquery'
import { StartupDataStore } from './model/Startup/startup'
if (process.env.NODE_ENV !== 'production') {
  $('html').addClass('is-development')
  if ((module as any)?.hot) {
    import('react-hot-loader')
    $('html').addClass('is-hot-reloading')
  }
}
// @ts-ignore disable all react-beautiful-dnd development warnings (we have some spurious ones, but if you're working a component with this you can re-enable)
window['__react-beautiful-dnd-disable-dev-warnings'] = true
;(window as any).CESIUM_BASE_URL = './cesium/assets'
//in here we drop in any top level patches, etc.
const associationsSet = Backbone.AssociatedModel.prototype.set
// @ts-expect-error ts-migrate(2322) FIXME: Type '(key: any, value: any, options: any) => any'... Remove this comment to see the full error message
Backbone.AssociatedModel.prototype.set = function (
  key: any,
  value: any,
  options: any
) {
  if (typeof key === 'object') {
    options = value
  }
  if (options && options.withoutSet === true) {
    return this
  }
  return associationsSet.apply(this, arguments)
}
$(window.document).ready(() => {
  window.document.title =
    StartupDataStore.Configuration.config?.customBranding +
    ' ' +
    StartupDataStore.Configuration.config?.product
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  window.document.querySelector('.welcome-branding').textContent =
    StartupDataStore.Configuration.config?.customBranding
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  window.document.querySelector('.welcome-branding-name').textContent =
    StartupDataStore.Configuration.config?.product
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  window.document.querySelector('#loading').classList.add('show-welcome')
})
