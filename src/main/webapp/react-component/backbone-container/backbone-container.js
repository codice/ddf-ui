import { __assign, __extends } from "tslib";
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
import Backbone from 'backbone';
var withListenTo = function (Component) {
    return /** @class */ (function (_super) {
        __extends(BackboneContainer, _super);
        function BackboneContainer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.backbone = new Backbone.Model({});
            return _this;
        }
        BackboneContainer.prototype.componentWillUnmount = function () {
            this.backbone.stopListening();
            this.backbone.destroy();
        };
        BackboneContainer.prototype.render = function () {
            return (
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ listenTo: any; stopListening: any; listenT... Remove this comment to see the full error message
            React.createElement(Component, __assign({ listenTo: this.backbone.listenTo.bind(this.backbone), stopListening: this.backbone.stopListening.bind(this.backbone), listenToOnce: this.backbone.listenToOnce.bind(this.backbone) }, this.props)));
        };
        return BackboneContainer;
    }(React.Component));
};
export default withListenTo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2JvbmUtY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9iYWNrYm9uZS1jb250YWluZXIvYmFja2JvbmUtY29udGFpbmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRzlCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQVkvQixJQUFNLFlBQVksR0FBRyxVQUNuQixTQUEwRDtJQUUxRDtRQUF1QyxxQ0FHdEM7UUFITTtZQUFBLHFFQW9CTjtZQWhCQyxjQUFRLEdBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBOztRQWdCeEMsQ0FBQztRQWZDLGdEQUFvQixHQUFwQjtZQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUN6QixDQUFDO1FBQ0Qsa0NBQU0sR0FBTjtZQUNFLE9BQU87WUFDTCxtSkFBbUo7WUFDbkosb0JBQUMsU0FBUyxhQUNSLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNwRCxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDOUQsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQ3hELElBQUksQ0FBQyxLQUFLLEVBQ2QsQ0FDSCxDQUFBO1FBQ0gsQ0FBQztRQUNILHdCQUFDO0lBQUQsQ0FBQyxBQXBCTSxDQUFnQyxLQUFLLENBQUMsU0FBUyxHQW9CckQ7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBTdWJ0cmFjdCB9IGZyb20gJy4uLy4uL3R5cGVzY3JpcHQnXG5cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuZXhwb3J0IHR5cGUgV2l0aEJhY2tib25lUHJvcHMgPSB7XG4gIGxpc3RlblRvOiAob2JqZWN0OiBhbnksIGV2ZW50czogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pID0+IGFueVxuICBzdG9wTGlzdGVuaW5nOiAoXG4gICAgb2JqZWN0PzogYW55LFxuICAgIGV2ZW50cz86IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjYWxsYmFjaz86IEZ1bmN0aW9uIHwgdW5kZWZpbmVkXG4gICkgPT4gYW55XG4gIGxpc3RlblRvT25jZTogKG9iamVjdDogYW55LCBldmVudHM6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiBhbnlcbn1cblxuY29uc3Qgd2l0aExpc3RlblRvID0gPFAgZXh0ZW5kcyBXaXRoQmFja2JvbmVQcm9wcz4oXG4gIENvbXBvbmVudDogUmVhY3QuQ29tcG9uZW50VHlwZTxSZWFjdC5Qcm9wc1dpdGhDaGlsZHJlbjxQPj5cbikgPT4ge1xuICByZXR1cm4gY2xhc3MgQmFja2JvbmVDb250YWluZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8XG4gICAgU3VidHJhY3Q8UCwgV2l0aEJhY2tib25lUHJvcHM+LFxuICAgIHt9XG4gID4ge1xuICAgIGJhY2tib25lOiBhbnkgPSBuZXcgQmFja2JvbmUuTW9kZWwoe30pXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLmJhY2tib25lLnN0b3BMaXN0ZW5pbmcoKVxuICAgICAgdGhpcy5iYWNrYm9uZS5kZXN0cm95KClcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICd7IGxpc3RlblRvOiBhbnk7IHN0b3BMaXN0ZW5pbmc6IGFueTsgbGlzdGVuVC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIDxDb21wb25lbnRcbiAgICAgICAgICBsaXN0ZW5Ubz17dGhpcy5iYWNrYm9uZS5saXN0ZW5Uby5iaW5kKHRoaXMuYmFja2JvbmUpfVxuICAgICAgICAgIHN0b3BMaXN0ZW5pbmc9e3RoaXMuYmFja2JvbmUuc3RvcExpc3RlbmluZy5iaW5kKHRoaXMuYmFja2JvbmUpfVxuICAgICAgICAgIGxpc3RlblRvT25jZT17dGhpcy5iYWNrYm9uZS5saXN0ZW5Ub09uY2UuYmluZCh0aGlzLmJhY2tib25lKX1cbiAgICAgICAgICB7Li4udGhpcy5wcm9wc31cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2l0aExpc3RlblRvXG4iXX0=