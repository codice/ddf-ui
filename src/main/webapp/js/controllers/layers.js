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
import { __extends } from "tslib";
import { Subscribable } from '../model/Base/base-classes';
var Layer = /** @class */ (function (_super) {
    __extends(Layer, _super);
    function Layer(layer) {
        var _this = _super.call(this) || this;
        _this.layer = layer;
        return _this;
    }
    return Layer;
}(Subscribable));
export { Layer };
var Layers = /** @class */ (function (_super) {
    __extends(Layers, _super);
    function Layers(layers) {
        var _this = _super.call(this) || this;
        _this.layers = layers;
        return _this;
    }
    return Layers;
}(Subscribable));
export { Layers };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL2NvbnRyb2xsZXJzL2xheWVycy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFnQnpEO0lBQTJCLHlCQUFpQztJQUUxRCxlQUFZLEtBQWdCO1FBQTVCLFlBQ0UsaUJBQU8sU0FFUjtRQURDLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBOztJQUNwQixDQUFDO0lBQ0gsWUFBQztBQUFELENBQUMsQUFORCxDQUEyQixZQUFZLEdBTXRDOztBQUVEO0lBQTRCLDBCQUFrRDtJQUU1RSxnQkFBWSxNQUFrQjtRQUE5QixZQUNFLGlCQUFPLFNBRVI7UUFEQyxLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTs7SUFDdEIsQ0FBQztJQUNILGFBQUM7QUFBRCxDQUFDLEFBTkQsQ0FBNEIsWUFBWSxHQU12QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgeyBTdWJzY3JpYmFibGUgfSBmcm9tICcuLi9tb2RlbC9CYXNlL2Jhc2UtY2xhc3NlcydcblxuZXhwb3J0IHR5cGUgTGF5ZXJUeXBlID0ge1xuICBhbHBoYTogc3RyaW5nXG4gIGlkOiBzdHJpbmdcbiAgbGFiZWw6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgb3JkZXI6IG51bWJlclxuICBwYXJhbWV0ZXJzOiBhbnlcbiAgcHJveHlFbmFibGVkOiBib29sZWFuXG4gIHNob3c6IGJvb2xlYW5cbiAgdHlwZTogc3RyaW5nXG4gIHVybDogc3RyaW5nXG4gIHdpdGhDcmVkZW50aWFsczogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXIgZXh0ZW5kcyBTdWJzY3JpYmFibGU8eyB0aGluZzogJ2NoYW5nZScgfT4ge1xuICBsYXllcjogTGF5ZXJUeXBlXG4gIGNvbnN0cnVjdG9yKGxheWVyOiBMYXllclR5cGUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5sYXllciA9IGxheWVyXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExheWVycyBleHRlbmRzIFN1YnNjcmliYWJsZTx7IHRoaW5nOiAnc29ydCcgfCAnYWRkJyB8ICdyZW1vdmUnIH0+IHtcbiAgbGF5ZXJzOiBBcnJheTxhbnk+XG4gIGNvbnN0cnVjdG9yKGxheWVyczogQXJyYXk8YW55Pikge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmxheWVycyA9IGxheWVyc1xuICB9XG59XG4iXX0=