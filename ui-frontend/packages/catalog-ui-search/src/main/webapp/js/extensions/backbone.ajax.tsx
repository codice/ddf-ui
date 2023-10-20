import Backbone from 'backbone'
import {
  checkForErrors,
  throwFetchErrorEvent,
} from '../../react-component/utils/fetch/fetch'
type BackboneAjaxType = NonNullable<Parameters<typeof Backbone.ajax>[0]>

const oldBackboneAjax = Backbone.ajax

Backbone.ajax = function (request: Required<BackboneAjaxType>) {
  const originalError = request.error
  const newError: typeof request.error = (...params) => {
    throwFetchErrorEvent([params[2]])
    if (typeof originalError === 'function') {
      originalError.apply(this, params)
    } else if (typeof originalError === 'object') {
      originalError.forEach((errorCallback) => {
        if (typeof errorCallback === 'function') {
          errorCallback.apply(this, params)
        }
      })
    }
  }
  const originalSuccess = request.success
  const newSuccess: typeof request.success = (...params) => {
    checkForErrors(params[0]) // query response is 200 even with errors -> check if any source has an error
    if (typeof originalSuccess === 'function') {
      originalSuccess.apply(this, params)
    } else if (typeof originalSuccess === 'object') {
      originalSuccess.forEach((successCallback) => {
        if (typeof successCallback === 'function') {
          successCallback.apply(this, params)
        }
      })
    }
  }
  request.error = newError
  request.success = newSuccess
  return oldBackboneAjax(request)
}
