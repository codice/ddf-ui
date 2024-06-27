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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlQmFja2JvbmUuaG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2sudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQVk5QixNQUFNLFVBQVUsV0FBVztJQUN6QixJQUFNLGFBQWEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDNUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLE9BQU87WUFDTCxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDN0IsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3pCLENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNOLE9BQU87UUFDTCxRQUFRLEVBQUUsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3BELGFBQWEsRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDOUQsWUFBWSxFQUFFLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUM3RCxDQUFBO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxXQUFXO0lBQ3pCLG9CQUF3RDtTQUF4RCxVQUF3RCxFQUF4RCxxQkFBd0QsRUFBeEQsSUFBd0Q7UUFBeEQsK0JBQXdEOztJQUVsRCxJQUFBLEtBQThCLFdBQVcsRUFBRSxFQUF6QyxRQUFRLGNBQUEsRUFBRSxhQUFhLG1CQUFrQixDQUFBO0lBQ2pELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqQixRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQTtTQUN0QztRQUNELE9BQU87WUFDTCxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDakIsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7YUFDM0M7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuZXhwb3J0IHR5cGUgV2l0aEJhY2tib25lUHJvcHMgPSB7XG4gIGxpc3RlblRvOiAob2JqZWN0OiBhbnksIGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pID0+IGFueVxuICBzdG9wTGlzdGVuaW5nOiAoXG4gICAgb2JqZWN0PzogYW55LFxuICAgIGV2ZW50cz86IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjaz86IEZ1bmN0aW9uIHwgdW5kZWZpbmVkXG4gICkgPT4gYW55XG4gIGxpc3RlblRvT25jZTogKG9iamVjdDogYW55LCBldmVudHM6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiBhbnlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUJhY2tib25lKCk6IFdpdGhCYWNrYm9uZVByb3BzIHtcbiAgY29uc3QgYmFja2JvbmVNb2RlbCA9IG5ldyBCYWNrYm9uZS5Nb2RlbCh7fSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgYmFja2JvbmVNb2RlbC5zdG9wTGlzdGVuaW5nKClcbiAgICAgIGJhY2tib25lTW9kZWwuZGVzdHJveSgpXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuIHtcbiAgICBsaXN0ZW5UbzogYmFja2JvbmVNb2RlbC5saXN0ZW5Uby5iaW5kKGJhY2tib25lTW9kZWwpLFxuICAgIHN0b3BMaXN0ZW5pbmc6IGJhY2tib25lTW9kZWwuc3RvcExpc3RlbmluZy5iaW5kKGJhY2tib25lTW9kZWwpLFxuICAgIGxpc3RlblRvT25jZTogYmFja2JvbmVNb2RlbC5saXN0ZW5Ub09uY2UuYmluZChiYWNrYm9uZU1vZGVsKSxcbiAgfVxufVxuXG4vKipcbiAqICBUaGlzIGlzIHRoZSBtb3N0IGNvbW1vbiB1c2UgY2FzZS4gIFlvdSBzdGFydCBsaXN0ZW5pbmcgYXQgdGhlIGZpcnN0IGxpZmVjeWNsZSAocmVuZGVyKSwgYW5kIHN0b3AgbGlzdGVuaW5nIGF0IHRoZSBsYXN0IGxpZmVjeWNsZSAoZGVzdHJ1Y3Rpb24pLlxuICogIElmIHRoZSBwYXJlbWV0ZXJzIGV2ZXIgY2hhbmdlLCB3ZSB1bmxpc3RlbiB0byB0aGUgb2xkIGNhc2UgYW5kIHJlbGlzdGVuIHdpdGggdGhlIG5ldyBwYXJhbWV0ZXJzIChvYmplY3QsIGV2ZW50cywgY2FsbGJhY2spLlxuICpcbiAqICBGb3IgbW9yZSBjb21wbGV4IHVzZXMsIGl0J3MgYmV0dGVyIHRvIHVzZSB1c2VCYWNrYm9uZSB3aGljaCBnaXZlcyB5b3UgbW9yZSBjb250cm9sLlxuICogQHBhcmFtIHBhcmFtZXRlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUxpc3RlblRvKFxuICAuLi5wYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzPFdpdGhCYWNrYm9uZVByb3BzWydsaXN0ZW5UbyddPlxuKSB7XG4gIGNvbnN0IHsgbGlzdGVuVG8sIHN0b3BMaXN0ZW5pbmcgfSA9IHVzZUJhY2tib25lKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocGFyYW1ldGVyc1swXSkge1xuICAgICAgbGlzdGVuVG8uYXBwbHkodW5kZWZpbmVkLCBwYXJhbWV0ZXJzKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHBhcmFtZXRlcnNbMF0pIHtcbiAgICAgICAgc3RvcExpc3RlbmluZy5hcHBseSh1bmRlZmluZWQsIHBhcmFtZXRlcnMpXG4gICAgICB9XG4gICAgfVxuICB9LCBbcGFyYW1ldGVyc10pXG59XG4iXX0=