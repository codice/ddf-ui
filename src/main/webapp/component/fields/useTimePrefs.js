import { __read } from "tslib";
import { useState, useEffect } from 'react';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import user from '../singletons/user-instance';
var useTimePrefs = function (action) {
    var _a = useBackbone(), listenTo = _a.listenTo, stopListening = _a.stopListening;
    var _b = __read(useState(Math.random()), 2), setForceRender = _b[1];
    useEffect(function () {
        var callback = function () {
            setForceRender(Math.random());
            action && action();
        };
        listenTo(user.getPreferences(), 'change:dateTimeFormat change:timeZone', callback);
        return function () {
            return stopListening(user.getPreferences(), 'change:dateTimeFormat change:timeZone', callback);
        };
    }, []);
};
export default useTimePrefs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlVGltZVByZWZzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9maWVsZHMvdXNlVGltZVByZWZzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBQ3BFLE9BQU8sSUFBSSxNQUFNLDZCQUE2QixDQUFBO0FBRTlDLElBQU0sWUFBWSxHQUFHLFVBQUMsTUFBbUI7SUFDakMsSUFBQSxLQUE4QixXQUFXLEVBQUUsRUFBekMsUUFBUSxjQUFBLEVBQUUsYUFBYSxtQkFBa0IsQ0FBQTtJQUMzQyxJQUFBLEtBQUEsT0FBcUIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFBLEVBQXpDLGNBQWMsUUFBMkIsQ0FBQTtJQUVsRCxTQUFTLENBQUM7UUFDUixJQUFNLFFBQVEsR0FBRztZQUNmLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZQUM3QixNQUFNLElBQUksTUFBTSxFQUFFLENBQUE7UUFDcEIsQ0FBQyxDQUFBO1FBQ0QsUUFBUSxDQUNOLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFDckIsdUNBQXVDLEVBQ3ZDLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsT0FBTztZQUNMLE9BQUEsYUFBYSxDQUNYLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFDckIsdUNBQXVDLEVBQ3ZDLFFBQVEsQ0FDVDtRQUpELENBSUMsQ0FBQTtJQUNMLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNSLENBQUMsQ0FBQTtBQUVELGVBQWUsWUFBWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcblxuY29uc3QgdXNlVGltZVByZWZzID0gKGFjdGlvbj86ICgpID0+IHZvaWQpID0+IHtcbiAgY29uc3QgeyBsaXN0ZW5Ubywgc3RvcExpc3RlbmluZyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCBbLCBzZXRGb3JjZVJlbmRlcl0gPSB1c2VTdGF0ZShNYXRoLnJhbmRvbSgpKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBzZXRGb3JjZVJlbmRlcihNYXRoLnJhbmRvbSgpKVxuICAgICAgYWN0aW9uICYmIGFjdGlvbigpXG4gICAgfVxuICAgIGxpc3RlblRvKFxuICAgICAgdXNlci5nZXRQcmVmZXJlbmNlcygpLFxuICAgICAgJ2NoYW5nZTpkYXRlVGltZUZvcm1hdCBjaGFuZ2U6dGltZVpvbmUnLFxuICAgICAgY2FsbGJhY2tcbiAgICApXG4gICAgcmV0dXJuICgpID0+XG4gICAgICBzdG9wTGlzdGVuaW5nKFxuICAgICAgICB1c2VyLmdldFByZWZlcmVuY2VzKCksXG4gICAgICAgICdjaGFuZ2U6ZGF0ZVRpbWVGb3JtYXQgY2hhbmdlOnRpbWVab25lJyxcbiAgICAgICAgY2FsbGJhY2tcbiAgICAgIClcbiAgfSwgW10pXG59XG5cbmV4cG9ydCBkZWZhdWx0IHVzZVRpbWVQcmVmc1xuIl19