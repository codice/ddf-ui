import { __extends } from "tslib";
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
import withListenTo from '../backbone-container';
import Sources from './presentation';
import sources from '../../component/singletons/sources-instance';
import { CommonAjaxSettings } from '../../js/AjaxSettings';
var SourcesSummaryContainer = /** @class */ (function (_super) {
    __extends(SourcesSummaryContainer, _super);
    function SourcesSummaryContainer(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            amountDown: sources.filter(function (source) {
                return !source.get('available');
            }).length,
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ available: boolean; contentTypes: { name: ... Remove this comment to see the full error message
            sources: sources.toJSON()
        };
        return _this;
    }
    SourcesSummaryContainer.prototype.componentDidMount = function () {
        this.props.listenTo(sources, 'all', this.handleChange.bind(this));
    };
    SourcesSummaryContainer.prototype.handleChange = function () {
        this.setState({
            amountDown: sources.filter(function (source) {
                return !source.get('available');
            }).length,
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ available: boolean; contentTypes: { name: ... Remove this comment to see the full error message
            sources: sources.toJSON()
        });
    };
    SourcesSummaryContainer.prototype.render = function () {
        return (React.createElement(Sources, { sources: this.state.sources, refreshSources: function () { return sources.fetch(CommonAjaxSettings); }, amountDown: this.state.amountDown }));
    };
    return SourcesSummaryContainer;
}(React.Component));
export default withListenTo(SourcesSummaryContainer);
//# sourceMappingURL=container.js.map