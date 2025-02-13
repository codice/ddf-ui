import { __read } from "tslib";
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
import * as React from 'react';
import LocationComponent from './location';
import { ddToWkt, dmsToWkt, usngToWkt } from './utils';
import { hot } from 'react-hot-loader';
import LocationNewModel from './location-new';
export var LocationInputReact = function (_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.isStateDirty, isStateDirty = _b === void 0 ? false : _b, _c = _a.resetIsStateDirty, resetIsStateDirty = _c === void 0 ? function () { } : _c;
    var _d = __read(React.useState(new LocationNewModel({ wkt: value, mode: 'wkt' }).toJSON()), 2), state = _d[0], setState = _d[1];
    React.useEffect(function () {
        if (isStateDirty) {
            setState(new LocationNewModel({ wkt: value, mode: state.mode }).toJSON());
            resetIsStateDirty();
        }
    }, [isStateDirty]);
    React.useEffect(function () {
        if (state.valid) {
            switch (state.mode) {
                case 'wkt':
                    onChange(state.wkt);
                    break;
                case 'dd':
                    onChange(ddToWkt(state.dd));
                    break;
                case 'dms':
                    onChange(dmsToWkt(state.dms));
                    break;
                case 'usng':
                    onChange(usngToWkt(state.usng));
                    break;
                case 'keyword':
                    onChange(state.keyword ? state.keyword.wkt : null);
                    break;
                default:
            }
        }
        else {
            onChange('INVALID');
        }
    }, [state]);
    return React.createElement(LocationComponent, { state: state, options: {}, setState: setState });
};
export default hot(module)(LocationInputReact);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24tbmV3LnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2xvY2F0aW9uLW5ldy9sb2NhdGlvbi1uZXcudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLGlCQUE2QyxNQUFNLFlBQVksQ0FBQTtBQUN0RSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxTQUFTLENBQUE7QUFDdEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXRDLE9BQU8sZ0JBQWdCLE1BQU0sZ0JBQWdCLENBQUE7QUFTN0MsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUcsVUFBQyxFQUtMO1FBSjVCLEtBQUssV0FBQSxFQUNMLFFBQVEsY0FBQSxFQUNSLG9CQUFvQixFQUFwQixZQUFZLG1CQUFHLEtBQUssS0FBQSxFQUNwQix5QkFBNEIsRUFBNUIsaUJBQWlCLG1CQUFHLGNBQU8sQ0FBQyxLQUFBO0lBRXRCLElBQUEsS0FBQSxPQUFvQixLQUFLLENBQUMsUUFBUSxDQUN0QyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDM0QsSUFBQSxFQUZNLEtBQUssUUFBQSxFQUFFLFFBQVEsUUFFckIsQ0FBQTtJQUVELEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFlBQVksRUFBRTtZQUNoQixRQUFRLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDekUsaUJBQWlCLEVBQUUsQ0FBQTtTQUNwQjtJQUNILENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7SUFFbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNmLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDbEIsS0FBSyxLQUFLO29CQUNSLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7b0JBQ25CLE1BQUs7Z0JBQ1AsS0FBSyxJQUFJO29CQUNQLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBUSxDQUFDLENBQUE7b0JBQ2xDLE1BQUs7Z0JBQ1AsS0FBSyxLQUFLO29CQUNSLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBUSxDQUFDLENBQUE7b0JBQ3BDLE1BQUs7Z0JBQ1AsS0FBSyxNQUFNO29CQUNULFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBUSxDQUFDLENBQUE7b0JBQ3RDLE1BQUs7Z0JBQ1AsS0FBSyxTQUFTO29CQUNaLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ2xELE1BQUs7Z0JBQ1AsUUFBUTthQUNUO1NBQ0Y7YUFBTTtZQUNMLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUNwQjtJQUNILENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFFWCxPQUFPLG9CQUFDLGlCQUFpQixJQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxHQUFJLENBQUE7QUFDN0UsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgTG9jYXRpb25Db21wb25lbnQsIHsgTG9jYXRpb25JbnB1dFByb3BzVHlwZSB9IGZyb20gJy4vbG9jYXRpb24nXG5pbXBvcnQgeyBkZFRvV2t0LCBkbXNUb1drdCwgdXNuZ1RvV2t0IH0gZnJvbSAnLi91dGlscydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5cbmltcG9ydCBMb2NhdGlvbk5ld01vZGVsIGZyb20gJy4vbG9jYXRpb24tbmV3J1xuXG50eXBlIExvY2F0aW9uSW5wdXRSZWFjdFByb3BzVHlwZSA9IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBvbkNoYW5nZTogKHZhbDogc3RyaW5nKSA9PiB2b2lkXG4gIGlzU3RhdGVEaXJ0eT86IGJvb2xlYW5cbiAgcmVzZXRJc1N0YXRlRGlydHk/OiAoKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBjb25zdCBMb2NhdGlvbklucHV0UmVhY3QgPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UsXG4gIGlzU3RhdGVEaXJ0eSA9IGZhbHNlLFxuICByZXNldElzU3RhdGVEaXJ0eSA9ICgpID0+IHt9LFxufTogTG9jYXRpb25JbnB1dFJlYWN0UHJvcHNUeXBlKSA9PiB7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGU8TG9jYXRpb25JbnB1dFByb3BzVHlwZT4oXG4gICAgbmV3IExvY2F0aW9uTmV3TW9kZWwoeyB3a3Q6IHZhbHVlLCBtb2RlOiAnd2t0JyB9KS50b0pTT04oKVxuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoaXNTdGF0ZURpcnR5KSB7XG4gICAgICBzZXRTdGF0ZShuZXcgTG9jYXRpb25OZXdNb2RlbCh7IHdrdDogdmFsdWUsIG1vZGU6IHN0YXRlLm1vZGUgfSkudG9KU09OKCkpXG4gICAgICByZXNldElzU3RhdGVEaXJ0eSgpXG4gICAgfVxuICB9LCBbaXNTdGF0ZURpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzdGF0ZS52YWxpZCkge1xuICAgICAgc3dpdGNoIChzdGF0ZS5tb2RlKSB7XG4gICAgICAgIGNhc2UgJ3drdCc6XG4gICAgICAgICAgb25DaGFuZ2Uoc3RhdGUud2t0KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgICBvbkNoYW5nZShkZFRvV2t0KHN0YXRlLmRkKSBhcyBhbnkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnZG1zJzpcbiAgICAgICAgICBvbkNoYW5nZShkbXNUb1drdChzdGF0ZS5kbXMpIGFzIGFueSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICd1c25nJzpcbiAgICAgICAgICBvbkNoYW5nZSh1c25nVG9Xa3Qoc3RhdGUudXNuZykgYXMgYW55KVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ2tleXdvcmQnOlxuICAgICAgICAgIG9uQ2hhbmdlKHN0YXRlLmtleXdvcmQgPyBzdGF0ZS5rZXl3b3JkLndrdCA6IG51bGwpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb25DaGFuZ2UoJ0lOVkFMSUQnKVxuICAgIH1cbiAgfSwgW3N0YXRlXSlcblxuICByZXR1cm4gPExvY2F0aW9uQ29tcG9uZW50IHN0YXRlPXtzdGF0ZX0gb3B0aW9ucz17e319IHNldFN0YXRlPXtzZXRTdGF0ZX0gLz5cbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoTG9jYXRpb25JbnB1dFJlYWN0KVxuIl19