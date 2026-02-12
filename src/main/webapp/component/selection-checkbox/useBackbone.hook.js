import Backbone from 'backbone';
import * as React from 'react';
export function useBackbone() {
    var backboneModel = new Backbone.Model({});
    React.useEffect(function () {
        return function () {
            backboneModel.stopListening();
            backboneModel.destroy();
        };
    }, []);
    return {
        listenTo: backboneModel.listenTo.bind(backboneModel),
        stopListening: backboneModel.stopListening.bind(backboneModel),
        listenToOnce: backboneModel.listenToOnce.bind(backboneModel),
    };
}
/**
 *  This is the most common use case.  You start listening at the first lifecycle (render), and stop listening at the last lifecycle (destruction).
 *  If the paremeters ever change, we unlisten to the old case and relisten with the new parameters (object, events, callback).
 *
 *  For more complex uses, it's better to use useBackbone which gives you more control.
 * @param parameters
 */
export function useListenTo() {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i] = arguments[_i];
    }
    var _a = useBackbone(), listenTo = _a.listenTo, stopListening = _a.stopListening;
    React.useEffect(function () {
        if (parameters[0]) {
            listenTo.apply(undefined, parameters);
        }
        return function () {
            if (parameters[0]) {
                stopListening.apply(undefined, parameters);
            }
        };
    }, [parameters]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlQmFja2JvbmUuaG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2sudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQVk5QixNQUFNLFVBQVUsV0FBVztJQUN6QixJQUFNLGFBQWEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDNUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLE9BQU87WUFDTCxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDN0IsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3pCLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNOLE9BQU87UUFDTCxRQUFRLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3BELGFBQWEsRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDOUQsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUM3RCxDQUFBO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxXQUFXO0lBQ3pCLG9CQUF3RDtTQUF4RCxVQUF3RCxFQUF4RCxxQkFBd0QsRUFBeEQsSUFBd0Q7UUFBeEQsK0JBQXdEOztJQUVsRCxJQUFBLEtBQThCLFdBQVcsRUFBRSxFQUF6QyxRQUFRLGNBQUEsRUFBRSxhQUFhLG1CQUFrQixDQUFBO0lBQ2pELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2xCLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3ZDLENBQUM7UUFDRCxPQUFPO1lBQ0wsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDNUMsQ0FBQztRQUNILENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgdHlwZSBXaXRoQmFja2JvbmVQcm9wcyA9IHtcbiAgbGlzdGVuVG86IChvYmplY3Q6IGFueSwgZXZlbnRzOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbikgPT4gYW55XG4gIHN0b3BMaXN0ZW5pbmc6IChcbiAgICBvYmplY3Q/OiBhbnksXG4gICAgZXZlbnRzPzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGNhbGxiYWNrPzogRnVuY3Rpb24gfCB1bmRlZmluZWRcbiAgKSA9PiBhbnlcbiAgbGlzdGVuVG9PbmNlOiAob2JqZWN0OiBhbnksIGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pID0+IGFueVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlQmFja2JvbmUoKTogV2l0aEJhY2tib25lUHJvcHMge1xuICBjb25zdCBiYWNrYm9uZU1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKHt9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBiYWNrYm9uZU1vZGVsLnN0b3BMaXN0ZW5pbmcoKVxuICAgICAgYmFja2JvbmVNb2RlbC5kZXN0cm95KClcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4ge1xuICAgIGxpc3RlblRvOiBiYWNrYm9uZU1vZGVsLmxpc3RlblRvLmJpbmQoYmFja2JvbmVNb2RlbCksXG4gICAgc3RvcExpc3RlbmluZzogYmFja2JvbmVNb2RlbC5zdG9wTGlzdGVuaW5nLmJpbmQoYmFja2JvbmVNb2RlbCksXG4gICAgbGlzdGVuVG9PbmNlOiBiYWNrYm9uZU1vZGVsLmxpc3RlblRvT25jZS5iaW5kKGJhY2tib25lTW9kZWwpLFxuICB9XG59XG5cbi8qKlxuICogIFRoaXMgaXMgdGhlIG1vc3QgY29tbW9uIHVzZSBjYXNlLiAgWW91IHN0YXJ0IGxpc3RlbmluZyBhdCB0aGUgZmlyc3QgbGlmZWN5Y2xlIChyZW5kZXIpLCBhbmQgc3RvcCBsaXN0ZW5pbmcgYXQgdGhlIGxhc3QgbGlmZWN5Y2xlIChkZXN0cnVjdGlvbikuXG4gKiAgSWYgdGhlIHBhcmVtZXRlcnMgZXZlciBjaGFuZ2UsIHdlIHVubGlzdGVuIHRvIHRoZSBvbGQgY2FzZSBhbmQgcmVsaXN0ZW4gd2l0aCB0aGUgbmV3IHBhcmFtZXRlcnMgKG9iamVjdCwgZXZlbnRzLCBjYWxsYmFjaykuXG4gKlxuICogIEZvciBtb3JlIGNvbXBsZXggdXNlcywgaXQncyBiZXR0ZXIgdG8gdXNlIHVzZUJhY2tib25lIHdoaWNoIGdpdmVzIHlvdSBtb3JlIGNvbnRyb2wuXG4gKiBAcGFyYW0gcGFyYW1ldGVyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlTGlzdGVuVG8oXG4gIC4uLnBhcmFtZXRlcnM6IFBhcmFtZXRlcnM8V2l0aEJhY2tib25lUHJvcHNbJ2xpc3RlblRvJ10+XG4pIHtcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwYXJhbWV0ZXJzWzBdKSB7XG4gICAgICBsaXN0ZW5Uby5hcHBseSh1bmRlZmluZWQsIHBhcmFtZXRlcnMpXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAocGFyYW1ldGVyc1swXSkge1xuICAgICAgICBzdG9wTGlzdGVuaW5nLmFwcGx5KHVuZGVmaW5lZCwgcGFyYW1ldGVycylcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtwYXJhbWV0ZXJzXSlcbn1cbiJdfQ==