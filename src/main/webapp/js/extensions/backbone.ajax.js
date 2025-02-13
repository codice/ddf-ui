import Backbone from 'backbone';
import { checkForErrors, throwFetchErrorEvent, } from '../../react-component/utils/fetch/fetch';
var oldBackboneAjax = Backbone.ajax;
Backbone.ajax = function (request) {
    var _this = this;
    var originalError = request.error;
    var newError = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        throwFetchErrorEvent([params[2]]);
        if (typeof originalError === 'function') {
            originalError.apply(_this, params);
        }
        else if (typeof originalError === 'object') {
            originalError.forEach(function (errorCallback) {
                if (typeof errorCallback === 'function') {
                    errorCallback.apply(_this, params);
                }
            });
        }
    };
    var originalSuccess = request.success;
    var newSuccess = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        checkForErrors(params[0]); // query response is 200 even with errors -> check if any source has an error
        if (typeof originalSuccess === 'function') {
            originalSuccess.apply(_this, params);
        }
        else if (typeof originalSuccess === 'object') {
            originalSuccess.forEach(function (successCallback) {
                if (typeof successCallback === 'function') {
                    successCallback.apply(_this, params);
                }
            });
        }
    };
    request.error = newError;
    request.success = newSuccess;
    return oldBackboneAjax(request);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2JvbmUuYWpheC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9leHRlbnNpb25zL2JhY2tib25lLmFqYXgudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEVBQ0wsY0FBYyxFQUNkLG9CQUFvQixHQUNyQixNQUFNLHlDQUF5QyxDQUFBO0FBR2hELElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUE7QUFFckMsUUFBUSxDQUFDLElBQUksR0FBRyxVQUFVLE9BQW1DO0lBQTdDLGlCQThCZjtJQTdCQyxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO0lBQ25DLElBQU0sUUFBUSxHQUF5QjtRQUFDLGdCQUFTO2FBQVQsVUFBUyxFQUFULHFCQUFTLEVBQVQsSUFBUztZQUFULDJCQUFTOztRQUMvQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakMsSUFBSSxPQUFPLGFBQWEsS0FBSyxVQUFVLEVBQUU7WUFDdkMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDbEM7YUFBTSxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTtZQUM1QyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUMsYUFBYTtnQkFDbEMsSUFBSSxPQUFPLGFBQWEsS0FBSyxVQUFVLEVBQUU7b0JBQ3ZDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO2lCQUNsQztZQUNILENBQUMsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDLENBQUE7SUFDRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0lBQ3ZDLElBQU0sVUFBVSxHQUEyQjtRQUFDLGdCQUFTO2FBQVQsVUFBUyxFQUFULHFCQUFTLEVBQVQsSUFBUztZQUFULDJCQUFTOztRQUNuRCxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyw2RUFBNkU7UUFDdkcsSUFBSSxPQUFPLGVBQWUsS0FBSyxVQUFVLEVBQUU7WUFDekMsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7U0FDcEM7YUFBTSxJQUFJLE9BQU8sZUFBZSxLQUFLLFFBQVEsRUFBRTtZQUM5QyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsZUFBZTtnQkFDdEMsSUFBSSxPQUFPLGVBQWUsS0FBSyxVQUFVLEVBQUU7b0JBQ3pDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSSxFQUFFLE1BQU0sQ0FBQyxDQUFBO2lCQUNwQztZQUNILENBQUMsQ0FBQyxDQUFBO1NBQ0g7SUFDSCxDQUFDLENBQUE7SUFDRCxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQTtJQUN4QixPQUFPLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQTtJQUM1QixPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNqQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQge1xuICBjaGVja0ZvckVycm9ycyxcbiAgdGhyb3dGZXRjaEVycm9yRXZlbnQsXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaC9mZXRjaCdcbnR5cGUgQmFja2JvbmVBamF4VHlwZSA9IE5vbk51bGxhYmxlPFBhcmFtZXRlcnM8dHlwZW9mIEJhY2tib25lLmFqYXg+WzBdPlxuXG5jb25zdCBvbGRCYWNrYm9uZUFqYXggPSBCYWNrYm9uZS5hamF4XG5cbkJhY2tib25lLmFqYXggPSBmdW5jdGlvbiAocmVxdWVzdDogUmVxdWlyZWQ8QmFja2JvbmVBamF4VHlwZT4pIHtcbiAgY29uc3Qgb3JpZ2luYWxFcnJvciA9IHJlcXVlc3QuZXJyb3JcbiAgY29uc3QgbmV3RXJyb3I6IHR5cGVvZiByZXF1ZXN0LmVycm9yID0gKC4uLnBhcmFtcykgPT4ge1xuICAgIHRocm93RmV0Y2hFcnJvckV2ZW50KFtwYXJhbXNbMl1dKVxuICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxFcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3JpZ2luYWxFcnJvci5hcHBseSh0aGlzLCBwYXJhbXMpXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3JpZ2luYWxFcnJvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9yaWdpbmFsRXJyb3IuZm9yRWFjaCgoZXJyb3JDYWxsYmFjaykgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGVycm9yQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBlcnJvckNhbGxiYWNrLmFwcGx5KHRoaXMsIHBhcmFtcylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgY29uc3Qgb3JpZ2luYWxTdWNjZXNzID0gcmVxdWVzdC5zdWNjZXNzXG4gIGNvbnN0IG5ld1N1Y2Nlc3M6IHR5cGVvZiByZXF1ZXN0LnN1Y2Nlc3MgPSAoLi4ucGFyYW1zKSA9PiB7XG4gICAgY2hlY2tGb3JFcnJvcnMocGFyYW1zWzBdKSAvLyBxdWVyeSByZXNwb25zZSBpcyAyMDAgZXZlbiB3aXRoIGVycm9ycyAtPiBjaGVjayBpZiBhbnkgc291cmNlIGhhcyBhbiBlcnJvclxuICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxTdWNjZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvcmlnaW5hbFN1Y2Nlc3MuYXBwbHkodGhpcywgcGFyYW1zKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9yaWdpbmFsU3VjY2VzcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9yaWdpbmFsU3VjY2Vzcy5mb3JFYWNoKChzdWNjZXNzQ2FsbGJhY2spID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdWNjZXNzQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2suYXBwbHkodGhpcywgcGFyYW1zKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICByZXF1ZXN0LmVycm9yID0gbmV3RXJyb3JcbiAgcmVxdWVzdC5zdWNjZXNzID0gbmV3U3VjY2Vzc1xuICByZXR1cm4gb2xkQmFja2JvbmVBamF4KHJlcXVlc3QpXG59XG4iXX0=