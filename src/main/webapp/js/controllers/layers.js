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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL2NvbnRyb2xsZXJzL2xheWVycy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFnQnpEO0lBQTJCLHlCQUFpQztJQUUxRCxlQUFZLEtBQWdCO1FBQzFCLFlBQUEsTUFBSyxXQUFFLFNBQUE7UUFDUCxLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7SUFDcEIsQ0FBQztJQUNILFlBQUM7QUFBRCxDQUFDLEFBTkQsQ0FBMkIsWUFBWSxHQU10Qzs7QUFFRDtJQUE0QiwwQkFBa0Q7SUFFNUUsZ0JBQVksTUFBa0I7UUFDNUIsWUFBQSxNQUFLLFdBQUUsU0FBQTtRQUNQLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBOztJQUN0QixDQUFDO0lBQ0gsYUFBQztBQUFELENBQUMsQUFORCxDQUE0QixZQUFZLEdBTXZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCB7IFN1YnNjcmliYWJsZSB9IGZyb20gJy4uL21vZGVsL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuXG5leHBvcnQgdHlwZSBMYXllclR5cGUgPSB7XG4gIGFscGhhOiBzdHJpbmdcbiAgaWQ6IHN0cmluZ1xuICBsYWJlbDogc3RyaW5nXG4gIG5hbWU6IHN0cmluZ1xuICBvcmRlcjogbnVtYmVyXG4gIHBhcmFtZXRlcnM6IGFueVxuICBwcm94eUVuYWJsZWQ6IGJvb2xlYW5cbiAgc2hvdzogYm9vbGVhblxuICB0eXBlOiBzdHJpbmdcbiAgdXJsOiBzdHJpbmdcbiAgd2l0aENyZWRlbnRpYWxzOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMYXllciBleHRlbmRzIFN1YnNjcmliYWJsZTx7IHRoaW5nOiAnY2hhbmdlJyB9PiB7XG4gIGxheWVyOiBMYXllclR5cGVcbiAgY29uc3RydWN0b3IobGF5ZXI6IExheWVyVHlwZSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmxheWVyID0gbGF5ZXJcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTGF5ZXJzIGV4dGVuZHMgU3Vic2NyaWJhYmxlPHsgdGhpbmc6ICdzb3J0JyB8ICdhZGQnIHwgJ3JlbW92ZScgfT4ge1xuICBsYXllcnM6IEFycmF5PGFueT5cbiAgY29uc3RydWN0b3IobGF5ZXJzOiBBcnJheTxhbnk+KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubGF5ZXJzID0gbGF5ZXJzXG4gIH1cbn1cbiJdfQ==