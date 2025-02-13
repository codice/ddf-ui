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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheC1lcnJvci1oYW5kbGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvYXBwL2FqYXgtZXJyb3ItaGFuZGxpbmcudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUU7QUFDRixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUE7QUFDeEMsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLElBQUksb0JBQW9CLEdBQUcsVUFBVSxLQUFVO0lBQzdDLElBQUksWUFBWSxHQUFHLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN0RSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzdCLE9BQU8sWUFBWSxDQUFBO0tBQ3BCO0lBQ0QsMkRBQTJEO0lBQzNELElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7UUFDNUIsWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUNsRDtJQUNELE9BQU8sS0FBSyxHQUFHLFlBQVksQ0FBQTtBQUM3QixDQUFDLENBQUE7QUFDRCxJQUFJLGdCQUFnQixHQUFHLFVBQ3JCLE1BQVcsRUFDWCxLQUFVLEVBQ1YsUUFBYSxFQUNiLFVBQWU7SUFFZixJQUNFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsS0FBSyxrQkFBa0I7UUFDOUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDOUM7UUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsK0JBQStCLEVBQUUsQ0FBQTtLQUN6RTtTQUFNLElBQ0wsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkQsUUFBUSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQ3ZCO1FBQ0EsT0FBTztZQUNMLEtBQUssRUFDSCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsNkJBQTZCLENBQUM7WUFDekUsT0FBTyxFQUNMLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FDdEMsK0JBQStCLENBQ2hDO1NBQ0osQ0FBQTtLQUNGO1NBQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtRQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvRDtTQUFNO1FBQ0wsUUFBUSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3BCLEtBQUssR0FBRztnQkFDTixPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQTtZQUMxRCxLQUFLLEdBQUc7Z0JBQ04sT0FBTztvQkFDTCxLQUFLLEVBQUUsT0FBTztvQkFDZCxPQUFPLEVBQUUsd0RBQXdEO2lCQUNsRSxDQUFBO1lBQ0g7Z0JBQ0UsT0FBTztvQkFDTCxLQUFLLEVBQUUsT0FBTztvQkFDZCxPQUFPLEVBQUUsZUFBZSxHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQztpQkFDNUQsQ0FBQTtTQUNKO0tBQ0Y7QUFDSCxDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRztJQUMvQixJQUFNLFFBQVEsR0FBRyxRQUFRLEVBQUUsQ0FBQTtJQUMzQixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQzFCLFVBQUMsS0FBVSxFQUFFLEtBQVUsRUFBRSxRQUFhLEVBQUUsVUFBZTtZQUNyRCxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEMsbURBQW1EO2dCQUNuRCxPQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ2pELElBQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ3JFLElBQ0UsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHlCQUF5QixFQUFFO2dCQUMxRCxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssZUFBZSxFQUNyRDtnQkFDQSxPQUFNO2FBQ1A7WUFDRCxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUMxQyxVQUFVLEVBQUU7b0JBQ1YsUUFBUSxFQUFFLE9BQU87aUJBQ2xCO2FBQ0YsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUNGLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8seUNBQUssQ0FBQTtBQUNkLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xubGV0IGdldFNob3J0RXJyb3JNZXNzYWdlID0gZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcbiAgbGV0IGV4dHJhTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5uYW1lIDogU3RyaW5nKGVycm9yKVxuICBpZiAoZXh0cmFNZXNzYWdlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBleHRyYU1lc3NhZ2VcbiAgfVxuICAvLyBsaW1pdCB0byAyMCBjaGFyYWN0ZXJzIHNvIHdlIGRvIG5vdCB3b3JyeSBhYm91dCBvdmVyZmxvd1xuICBpZiAoZXh0cmFNZXNzYWdlLmxlbmd0aCA+IDIwKSB7XG4gICAgZXh0cmFNZXNzYWdlID0gZXh0cmFNZXNzYWdlLnN1YnN0cigwLCAyMCkgKyAnLi4uJ1xuICB9XG4gIHJldHVybiAnIC0gJyArIGV4dHJhTWVzc2FnZVxufVxubGV0IGdldEVycm9yUmVzcG9uc2UgPSBmdW5jdGlvbiAoXG4gIF9ldmVudDogYW55LFxuICBqcXhocjogYW55LFxuICBzZXR0aW5nczogYW55LFxuICB0aHJvd0Vycm9yOiBhbnlcbikge1xuICBpZiAoXG4gICAganF4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpID09PSAnYXBwbGljYXRpb24vanNvbicgJiZcbiAgICBqcXhoci5yZXNwb25zZVRleHQuc3RhcnRzV2l0aCgnPCcpICYmXG4gICAganF4aHIucmVzcG9uc2VUZXh0LmluZGV4T2YoJ0FDU1VSTCcpID4gLTEgJiZcbiAgICBqcXhoci5yZXNwb25zZVRleHQuaW5kZXhPZignU0FNTFJlcXVlc3QnKSA+IC0xXG4gICkge1xuICAgIHJldHVybiB7IHRpdGxlOiAnTG9nZ2VkIG91dCcsIG1lc3NhZ2U6ICdQbGVhc2UgcmVmcmVzaCBwYWdlIHRvIGxvZyBpbicgfVxuICB9IGVsc2UgaWYgKFxuICAgIHNldHRpbmdzLnVybC5pbmRleE9mKCcuL2ludGVybmFsL2NhdGFsb2cvc291cmNlcycpID4gLTEgJiZcbiAgICBzZXR0aW5ncy50eXBlID09PSAnR0VUJ1xuICApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGU6XG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRJMThuKClbJ3NvdXJjZXMucG9sbGluZy5lcnJvci50aXRsZSddLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEkxOG4oKVtcbiAgICAgICAgICAnc291cmNlcy5wb2xsaW5nLmVycm9yLm1lc3NhZ2UnXG4gICAgICAgIF0sXG4gICAgfVxuICB9IGVsc2UgaWYgKGpxeGhyLnJlc3BvbnNlSlNPTiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHsgdGl0bGU6ICdFcnJvcicsIG1lc3NhZ2U6IGpxeGhyLnJlc3BvbnNlSlNPTi5tZXNzYWdlIH1cbiAgfSBlbHNlIHtcbiAgICBzd2l0Y2ggKGpxeGhyLnN0YXR1cykge1xuICAgICAgY2FzZSA0MDM6XG4gICAgICAgIHJldHVybiB7IHRpdGxlOiAnRm9yYmlkZGVuJywgbWVzc2FnZTogJ05vdCBBdXRob3JpemVkJyB9XG4gICAgICBjYXNlIDQwNTpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0aXRsZTogJ0Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiAnTWV0aG9kIG5vdCBhbGxvd2VkLiBQbGVhc2UgdHJ5IHJlZnJlc2hpbmcgeW91ciBicm93c2VyJyxcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0aXRsZTogJ0Vycm9yJyxcbiAgICAgICAgICBtZXNzYWdlOiAnVW5rbm93biBFcnJvcicgKyBnZXRTaG9ydEVycm9yTWVzc2FnZSh0aHJvd0Vycm9yKSxcbiAgICAgICAgfVxuICAgIH1cbiAgfVxufVxuZXhwb3J0IGNvbnN0IEFqYXhFcnJvckhhbmRsaW5nID0gKCkgPT4ge1xuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAkKHdpbmRvdy5kb2N1bWVudCkuYWpheEVycm9yKFxuICAgICAgKGV2ZW50OiBhbnksIGpxeGhyOiBhbnksIHNldHRpbmdzOiBhbnksIHRocm93RXJyb3I6IGFueSkgPT4ge1xuICAgICAgICBpZiAoc2V0dGluZ3MuY3VzdG9tRXJyb3JIYW5kbGluZykge1xuICAgICAgICAgIC8vIERvIG5vdGhpbmcgaWYgY2FsbGVyIGlzIGhhbmRsaW5nIHRoZWlyIG93biBlcnJvclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXZlbnQsIGpxeGhyLCBzZXR0aW5ncywgdGhyb3dFcnJvcilcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBnZXRFcnJvclJlc3BvbnNlKGV2ZW50LCBqcXhociwgc2V0dGluZ3MsIHRocm93RXJyb3IpXG4gICAgICAgIGlmIChcbiAgICAgICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RGlzYWJsZVVua25vd25FcnJvckJveCgpICYmXG4gICAgICAgICAgcmVzcG9uc2UubWVzc2FnZS5zdWJzdHJpbmcoMCwgMTMpID09PSAnVW5rbm93biBFcnJvcidcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgYWRkU25hY2socmVzcG9uc2UudGl0bGUgKyByZXNwb25zZS5tZXNzYWdlLCB7XG4gICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApXG4gIH0pXG4gIHJldHVybiA8PjwvPlxufVxuIl19