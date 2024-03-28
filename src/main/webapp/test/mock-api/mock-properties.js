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
import { StartupDataStore } from '../../js/model/Startup/startup';
import api from './index';
var mock = function () {
    StartupDataStore.Configuration.config = api('./internal/config');
    StartupDataStore.Configuration.platformUiConfiguration = api('./internal/platform/config/ui');
    StartupDataStore.Configuration._notifySubscribers({
        thing: 'configuration-update',
    });
};
var unmock = function () { };
export { mock, unmock };
//# sourceMappingURL=mock-properties.js.map