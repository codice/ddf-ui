//
import React from 'react';
import useSnack from '../hooks/useSnack';
import $ from 'jquery';
import { StartupDataStore } from '../../js/model/Startup/startup';
var getShortErrorMessage = function (error) {
    var extraMessage = error instanceof Error ? error.name : String(error);
    if (extraMessage.length === 0) {
        return extraMessage;
    }
    // limit to 20 characters so we do not worry about overflow
    if (extraMessage.length > 20) {
        extraMessage = extraMessage.substr(0, 20) + '...';
    }
    return ' - ' + extraMessage;
};
var getErrorResponse = function (_event, jqxhr, settings, throwError) {
    if (jqxhr.getResponseHeader('content-type') === 'application/json' &&
        jqxhr.responseText.startsWith('<') &&
        jqxhr.responseText.indexOf('ACSURL') > -1 &&
        jqxhr.responseText.indexOf('SAMLRequest') > -1) {
        return { title: 'Logged out', message: 'Please refresh page to log in' };
    }
    else if (settings.url.indexOf('./internal/catalog/sources') > -1 &&
        settings.type === 'GET') {
        return {
            title: StartupDataStore.Configuration.getI18n()['sources.polling.error.title'],
            message: StartupDataStore.Configuration.getI18n()['sources.polling.error.message'],
        };
    }
    else if (jqxhr.responseJSON !== undefined) {
        return { title: 'Error', message: jqxhr.responseJSON.message };
    }
    else {
        switch (jqxhr.status) {
            case 403:
                return { title: 'Forbidden', message: 'Not Authorized' };
            case 405:
                return {
                    title: 'Error',
                    message: 'Method not allowed. Please try refreshing your browser',
                };
            default:
                return {
                    title: 'Error',
                    message: 'Unknown Error' + getShortErrorMessage(throwError),
                };
        }
    }
};
export var AjaxErrorHandling = function () {
    var addSnack = useSnack();
    React.useEffect(function () {
        $(window.document).ajaxError(function (event, jqxhr, settings, throwError) {
            if (settings.customErrorHandling) {
                // Do nothing if caller is handling their own error
                return;
            }
            console.error(event, jqxhr, settings, throwError);
            var response = getErrorResponse(event, jqxhr, settings, throwError);
            if (StartupDataStore.Configuration.getDisableUnknownErrorBox() &&
                response.message.substring(0, 13) === 'Unknown Error') {
                return;
            }
            addSnack(response.title + response.message, {
                alertProps: {
                    severity: 'error',
                },
            });
        });
    });
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=ajax-error-handling.js.map