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

//allows us to get around svg security restrictions in IE11 (see using svg in opengl)
//make our own image and manually set dimensions because of IE: https://github.com/openlayers/openlayers/issues/3939
import _ from 'underscore'

const defaultColor = '#3c6dd5'

export default {
  getCircle(options: any) {
    _.defaults(options, {
      diameter: 22,
      fillColor: defaultColor,
      strokeWidth: 2,
      strokeColor: 'white',
      badgeOptions: undefined,
    })
    const badgeOffset = options.badgeOptions ? 8 : 0
    const radius = options.diameter / 2
    const canvas = document.createElement('canvas')
    canvas.width = options.diameter + badgeOffset
    canvas.height = options.diameter + badgeOffset
    const ctx = canvas.getContext('2d')

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.beginPath()
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.strokeStyle = options.strokeColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.lineWidth = options.strokeWidth
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.fillColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.arc(
      radius,
      radius + badgeOffset,
      radius - options.strokeWidth / 2,
      0,
      2 * Math.PI,
      false
    )
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fill()
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.stroke()

    if (options.badgeOptions) {
      return this.addBadge(canvas, {
        width: options.diameter + badgeOffset,
        color: options.badgeOptions.color,
        text: options.badgeOptions.text,
      })
    }

    return canvas
  },
  getCircleWithText(options: any) {
    _.defaults(options, {
      diameter: 44,
      fillColor: defaultColor,
      strokeWidth: 2,
      strokeColor: 'white',
      text: '',
      textColor: 'white',
      badgeOptions: undefined,
    })

    const badgeOffset = options.badgeOptions ? 8 : 0

    const canvas = this.getCircle(options)
    const ctx = canvas.getContext('2d')

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.font = '16pt Helvetica'
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.textColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.textAlign = 'center'
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.textBaseline = 'middle'
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillText(
      options.text,
      options.diameter / 2,
      options.diameter / 2 + badgeOffset
    )

    return canvas
  },
  getCircleWithIcon(options: any) {
    _.defaults(options, {
      diameter: 24,
      fillColor: defaultColor,
      strokeWidth: 2,
      strokeColor: 'white',
      text: '',
      textColor: 'white',
    })
    const canvas = this.getCircle(options)
    const ctx = canvas.getContext('2d')
    const style = options.icon.style

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.font = style.size + ' ' + style.font
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.textColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.textAlign = 'center'
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.textBaseline = 'middle'

    if (style.code) {
      let icon = String.fromCharCode(parseInt(style.code, 16))
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.fillText(icon, options.diameter / 2, options.diameter / 2)
    }
    return canvas
  },
  getPin(options: any) {
    _.defaults(options, {
      width: 39,
      height: 40,
      fillColor: defaultColor,
      strokeWidth: 2,
      strokeColor: 'white',
      textColor: 'white',
      badgeOptions: undefined,
    })

    const badgeOffset = options.badgeOptions ? 8 : 0

    const getValWithOffset = (val: number) => {
      return val + badgeOffset
    }

    const canvas = document.createElement('canvas')
    canvas.width = options.width + badgeOffset
    canvas.height = options.height + badgeOffset
    const ctx = canvas.getContext('2d')

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.strokeStyle = options.strokeColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.lineWidth = options.strokeWidth
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.fillColor

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.beginPath()
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.moveTo(19.36, getValWithOffset(2))
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.bezierCurveTo(
      11.52,
      getValWithOffset(2),
      4.96,
      getValWithOffset(6.64),
      4.96,
      getValWithOffset(14.64)
    )
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.bezierCurveTo(
      4.96,
      getValWithOffset(17.92),
      6.08,
      getValWithOffset(20.96),
      7.84,
      getValWithOffset(23.44)
    )
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.lineTo(19.52, getValWithOffset(38.96))
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.lineTo(31.2, getValWithOffset(23.44))
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.bezierCurveTo(
      33.04,
      getValWithOffset(20.96),
      34.08,
      getValWithOffset(17.92),
      34.08,
      getValWithOffset(14.64)
    )
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.bezierCurveTo(
      34.08,
      getValWithOffset(6.64),
      27.6,
      getValWithOffset(2),
      19.52,
      getValWithOffset(2)
    )
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.fillColor
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fill()
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.stroke()

    const style = options.icon.style
    if (style.code) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.font = style.size + ' ' + style.font
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.fillStyle = options.textColor
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.textAlign = 'center'
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.textBaseline = 'middle'

      let icon = String.fromCharCode(parseInt(style.code, 16))

      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.fillText(
        icon,
        options.width / 2,
        options.height / 2 - 5 + badgeOffset
      )
    }

    if (options.badgeOptions) {
      return this.addBadge(canvas, {
        width: options.width + badgeOffset,
        color: options.badgeOptions.color,
        text: options.badgeOptions.text,
      })
    }

    return canvas
  },
  addBadge(canvas: HTMLCanvasElement, options: any) {
    _.defaults(options, {
      width: 48,
      color: '#fff59d',
    })

    const ctx = canvas.getContext('2d')

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.beginPath()

    const radius = 10
    const badgeX = options.width - (radius + 2)
    const badgeY = radius + 2
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.arc(badgeX, badgeY, radius, 0, 2 * Math.PI, false)

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fillStyle = options.color
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.strokeStyle = '#000000'
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.lineWidth = 1
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.fill()
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    ctx.stroke()

    if (options.text) {
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.font = '10pt Helvetica'
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.fillStyle = '#000000'
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.textAlign = 'center'
      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.textBaseline = 'middle'

      // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
      ctx.fillText(options.text, badgeX, badgeY)
    }

    return canvas
  },
}
