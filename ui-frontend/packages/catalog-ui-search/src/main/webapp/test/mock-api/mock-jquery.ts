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
import $ from 'jquery'

import api from './index'
const oldGet = $.get
const oldPost = $.post
const oldAjax = $.ajax

const mock = () => {
  const httpRequest = ({ url }: any) => {
    return Promise.resolve(api(url))
  }
  // @ts-expect-error ts-migrate(2322) FIXME: Type '(url: any) => Promise<any>' is not assignabl... Remove this comment to see the full error message
  $.get = (url: any) => httpRequest({ url })
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ url }: any) => Promise<any>' is not assig... Remove this comment to see the full error message
  $.post = httpRequest
  // @ts-expect-error ts-migrate(2322) FIXME: Type '({ url }: any) => Promise<any>' is not assig... Remove this comment to see the full error message
  $.ajax = httpRequest
}

const unmock = () => {
  $.get = oldGet
  $.post = oldPost
  $.ajax = oldAjax
}

export { mock, unmock }
