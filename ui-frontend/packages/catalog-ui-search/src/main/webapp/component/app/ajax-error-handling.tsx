//
import React from 'react'
import useSnack from '../hooks/useSnack'
const properties = require('../../js/properties.js')
const $ = require('jquery')

let getShortErrorMessage = function (error: any) {
  let extraMessage = error instanceof Error ? error.name : String(error)

  if (extraMessage.length === 0) {
    return extraMessage
  }

  // limit to 20 characters so we do not worry about overflow
  if (extraMessage.length > 20) {
    extraMessage = extraMessage.substr(0, 20) + '...'
  }

  return ' - ' + extraMessage
}

let getErrorResponse = function (
  _event: any,
  jqxhr: any,
  settings: any,
  throwError: any
) {
  if (
    jqxhr.getResponseHeader('content-type') === 'application/json' &&
    jqxhr.responseText.startsWith('<') &&
    jqxhr.responseText.indexOf('ACSURL') > -1 &&
    jqxhr.responseText.indexOf('SAMLRequest') > -1
  ) {
    return { title: 'Logged out', message: 'Please refresh page to log in' }
  } else if (
    settings.url.indexOf('./internal/catalog/sources') > -1 &&
    settings.type === 'GET'
  ) {
    return {
      title: properties.i18n['sources.polling.error.title'],
      message: properties.i18n['sources.polling.error.message'],
    }
  } else if (jqxhr.responseJSON !== undefined) {
    return { title: 'Error', message: jqxhr.responseJSON.message }
  } else {
    switch (jqxhr.status) {
      case 403:
        return { title: 'Forbidden', message: 'Not Authorized' }
      case 405:
        return {
          title: 'Error',
          message: 'Method not allowed. Please try refreshing your browser',
        }
      default:
        return {
          title: 'Error',
          message: 'Unknown Error' + getShortErrorMessage(throwError),
        }
    }
  }
}

export const AjaxErrorHandling = () => {
  const addSnack = useSnack()
  React.useEffect(() => {
    $(window.document).ajaxError(
      (event: any, jqxhr: any, settings: any, throwError: any) => {
        if (settings.customErrorHandling) {
          // Do nothing if caller is handling their own error
          return
        }

        console.error(event, jqxhr, settings, throwError)
        const response = getErrorResponse(event, jqxhr, settings, throwError)

        if (
          properties.disableUnknownErrorBox &&
          response.message.substring(0, 13) === 'Unknown Error'
        ) {
          return
        }

        addSnack(response.title + response.message, {
          alertProps: {
            severity: 'error',
          },
        })
      }
    )
  })
  return <></>
}
