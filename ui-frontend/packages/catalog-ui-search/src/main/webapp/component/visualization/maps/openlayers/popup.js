/**
 * OpenLayers 3 Popup Overlay.
 * See [the examples](./examples) for usage. Styling can be done via CSS.
 * @constructor
 * @extends {ol.Overlay}
 * @param {Object} opt_options Overlay options, extends olx.OverlayOptions adding:
 *                              **`panMapIfOutOfView`** `Boolean` - Should the
 *                              map be panned so that the popup is entirely
 *                              within view.
 */
const ol = require('openlayers')

ol.Overlay.Popup = function(opt_options) {
  this.container = document.createElement('div')
  this.container.className = 'ol-popup'

  this.titleContent = document.createElement('div')
  this.titleContent.className = 'ol-popup-title-content'
  this.container.appendChild(this.titleContent)

  // preview context only appended to container if it has content
  this.previewContent = document.createElement('div')
  this.previewContent.className = 'ol-popup-preview-content'

  ol.Overlay.call(this, {
    element: this.container,
    stopEvent: true,
  })
}

ol.inherits(ol.Overlay.Popup, ol.Overlay)

/**
 * Show the popup.
 * @param {ol.Coordinate} coord Where to anchor the popup.
 * @param {String} html String of HTML to display within the popup.
 */
ol.Overlay.Popup.prototype.show = function(coord, title, preview) {
  this.setPosition(coord)
  this.titleContent.innerHTML = title
  this.previewContent.innerHTML = preview
  this.container.style.display = 'block'

  if (preview.length > 0) {
    var previewContent = this.previewContent
    window.setTimeout(function() {
      previewContent.scrollTop = 0
    }, 100)

    this.container.appendChild(this.previewContent)
  } else if (this.container.contains(this.previewContent)) {
    this.container.removeChild(this.previewContent)
  }

  if (this.panMapIfOutOfView) {
    this.panIntoView_(coord)
  }
  return this
}

/**
 * Hide the popup.
 */
ol.Overlay.Popup.prototype.hide = function() {
  this.container.style.display = 'none'
  return this
}
