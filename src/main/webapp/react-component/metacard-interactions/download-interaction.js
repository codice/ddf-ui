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
import { MetacardInteraction } from './metacard-interactions';
import { hot } from 'react-hot-loader';
import { StartupDataStore } from '../../js/model/Startup/startup';
var openValidUrl = function (result) {
    var downloadUrl = result.getDownloadUrl();
    downloadUrl && window.open(downloadUrl);
};
var isDownloadable = function (model) {
    return model.some(function (result) { return result.getDownloadUrl(); });
};
var handleDownload = function (model) {
    model.forEach(openValidUrl);
};
var DownloadProduct = function (_a) {
    var model = _a.model;
    if (!model || model.length === 0) {
        return null;
    }
    if (!isDownloadable(model)) {
        return null;
    }
    return (React.createElement(MetacardInteraction, { text: "Download", help: "Downloads the result's associated product directly to your machine.", icon: "fa fa-download", onClick: function () { return handleDownload(model); } }, isRemoteResourceCached(model) && (React.createElement("span", { "data-help": "Displayed if the remote resource has been cached locally.", className: "download-cached" }, "Local"))));
};
var isRemoteResourceCached = function (model) {
    if (!model || model.length <= 0)
        return false;
    return (model[0].isResourceLocal &&
        model[0].plain.metacard.properties['source-id'] !==
            StartupDataStore.Sources.localSourceId);
};
export default hot(module)(DownloadProduct);
//# sourceMappingURL=download-interaction.js.map