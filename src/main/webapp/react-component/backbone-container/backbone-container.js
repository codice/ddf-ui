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
//# sourceMappingURL=backbone-container.js.map