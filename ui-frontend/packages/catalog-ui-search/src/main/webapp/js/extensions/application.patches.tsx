/**
 * Collection of patches we apply to various libraries or setup functions
 */
require('../Marionette.Region.js')
require('../requestAnimationFramePolyfill.js')
require('../ApplicationHelpers.js')
require('../Autocomplete.js')

require('./backbone.listenTo')
require('./network.proxy')
require('./marionette.onFirstRender.js')
require('./marionette.renderer.render.js')
require('./marionette.ItemView.attachElContent.js')
require('./marionette.View.isMarionetteComponent.js')
require('./marionette.View.remove.js')
