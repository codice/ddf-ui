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
import _cloneDeep from 'lodash.clonedeep';
import _isEqualWith from 'lodash.isequalwith';
import { Subscribable } from '../Base/base-classes';
/**
 *  useSyncExternalStore expects us to return a cached or immutable version of the object
 *  as a result, it tries to be smart and only rerender if the object itself is different (despite our subscription telling it to update)
 *  this allows us to do a simple compare / snapshot to handle our usage of mutable data with useSyncExternalStore
 */
var SnapshotManager = /** @class */ (function (_super) {
    __extends(SnapshotManager, _super);
    function SnapshotManager(getMutable, subscribeToMutable) {
        var _this = _super.call(this) || this;
        _this.updateSnapshot = function () {
            var newSnapshot = _cloneDeep(_this.getMutable());
            if (!_isEqualWith(newSnapshot, _this.snapshot, function (_v1, _v2, key) {
                if (key === 'subscriptionsToMe') {
                    return true; // Ignore the "subscriptionsToMe" field
                }
                // Perform default comparison for other fields
                return undefined;
            })) {
                _this.snapshot = newSnapshot;
                _this._notifySubscribers({ thing: 'update' });
            }
        };
        _this.subscribe = function (callback) {
            return _this.subscribeTo({ subscribableThing: 'update', callback: callback });
        };
        _this.getSnapshot = function () {
            return _this.snapshot;
        };
        _this.getMutable = getMutable;
        _this.snapshot = _cloneDeep(_this.getMutable());
        _this.subscribeToMutable = subscribeToMutable;
        _this.subscribeToMutable(function () {
            _this.updateSnapshot();
        });
        return _this;
    }
    return SnapshotManager;
}(Subscribable));
export { SnapshotManager };
//# sourceMappingURL=snapshot.js.map