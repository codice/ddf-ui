import { __awaiter, __generator } from "tslib";
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
var DEFAULT_AUTO_MERGE_TIME = 1000;
import $ from 'jquery';
import _ from 'underscore';
import fetch from '../react-component/utils/fetch';
function match(regexList, attribute) {
    return (_.chain(regexList)
        .map(function (str) { return new RegExp(str); })
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(regex: RegExp) => RegExpExecArr... Remove this comment to see the full error message
        .find(function (regex) { return regex.exec(attribute); })
        .value() !== undefined);
}
// these variables are defined during the build
/* global __COMMIT_HASH__, __IS_DIRTY__, __COMMIT_DATE__ */
var properties = {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_HASH__'.
    commitHash: __COMMIT_HASH__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__IS_DIRTY__'.
    isDirty: __IS_DIRTY__,
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_DATE__'.
    commitDate: __COMMIT_DATE__,
    canvasThumbnailScaleFactor: 10,
    slidingAnimationDuration: 150,
    defaultFlytoHeight: 15000.0,
    CQL_DATE_FORMAT: 'YYYY-MM-DD[T]HH:mm:ss[Z]',
    ui: {},
    basicSearchTemporalSelectionDefault: [
        'created',
        'effective',
        'modified',
        'metacard.created',
        'metacard.modified',
    ],
    imageryProviders: [
        {
            type: 'SI',
            url: './images/natural_earth_50m.png',
            parameters: {
                imageSize: [10800, 5400]
            },
            alpha: 1,
            name: 'Default Layer',
            show: true,
            proxyEnabled: true,
            order: 0
        },
    ],
    iconConfig: {},
    i18n: {
        'sources.unavailable': '{amountDown} {amountDown, plural, one {source is} other {sources are}} currently down',
        'sources.polling.error.title': 'Error Polling Sources',
        'search.sources.selected.none.message': 'No sources are currently selected. Edit the search and select at least one source.',
        'sources.available': 'All sources are currently up',
        'sources.title': 'Sources',
        'sources.polling.error.message': 'Unable to query server for list of active sources',
        'sources.options.all': 'All Sources',
        'form.title': 'title'
    },
    attributeAliases: {},
    commonAttributes: [],
    filters: {
        METADATA_CONTENT_TYPE: 'metadata-content-type',
        SOURCE_ID: 'source-id',
        GEO_FIELD_NAME: 'anyGeo',
        ANY_GEO: 'geometry',
        ANY_TEXT: 'anyText',
        OPERATIONS: {
            string: ['contains', 'matchcase', 'equals'],
            xml: ['contains', 'matchcase', 'equals'],
            date: ['before', 'after'],
            number: ['=', '>', '>=', '<', '<='],
            geometry: ['intersects']
        },
        numberTypes: ['float', 'short', 'long', 'double', 'integer']
    },
    sourcePollInterval: 60000,
    enums: {},
    fetched: false,
    initializing: false,
    init: function () {
        return __awaiter(this, void 0, void 0, function () {
            var props;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initializing) {
                            return [2 /*return*/];
                        }
                        this.initializing = true;
                        props = this;
                        return [4 /*yield*/, fetch('./internal/config')
                                .then(function (res) {
                                return res.json();
                            })
                                .then(function (data) {
                                props = _.extend(props, data);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, fetch('./internal/platform/config/ui')
                                .then(function (res) { return res.json(); })
                                .then(function (data) {
                                props.ui = data;
                            })];
                    case 2:
                        _a.sent();
                        this.handleFeedback();
                        this.handleExperimental();
                        this.handleUpload();
                        this.handleListTemplates();
                        this.fetched = true;
                        return [2 /*return*/];
                }
            });
        });
    },
    handleListTemplates: function () {
        try {
            ;
            this.listTemplates = this.listTemplates.map(JSON.parse);
        }
        catch (error) {
            /*
                              would be a good to start reporting errors like this to a log that can alert admins
                              or update the admin interface to include validation that prevents errors like this
                              ideally both
                          */
            ;
            this.listTemplates = [];
        }
    },
    handleFeedback: function () {
        $('html').toggleClass('is-feedback-restricted', this.isFeedbackRestricted());
    },
    handleExperimental: function () {
        $('html').toggleClass('is-experimental', this.hasExperimentalEnabled());
    },
    handleUpload: function () {
        $('html').toggleClass('is-upload-enabled', this.isUploadEnabled());
    },
    isHidden: function (attribute) {
        if (attribute === 'anyDate') {
            // feels like we should consolidate all the attribute logic into the metacard definitions file, but for now don't want to risk circular dependency
            return true;
        }
        return match(this.hiddenAttributes, attribute);
    },
    isReadOnly: function (attribute) {
        return match(this.readOnly, attribute);
    },
    hasExperimentalEnabled: function () {
        return this.isExperimental;
    },
    getAutoMergeTime: function () {
        return this.autoMergeTime || DEFAULT_AUTO_MERGE_TIME;
    },
    isFeedbackRestricted: function () {
        return !this.queryFeedbackEnabled;
    },
    isDisableLocalCatalog: function () {
        return this.disableLocalCatalog;
    },
    isHistoricalSearchEnabled: function () {
        return !this.isHistoricalSearchDisabled;
    },
    isArchiveSearchEnabled: function () {
        return !this.isArchiveSearchDisabled;
    },
    isUploadEnabled: function () {
        return this.showIngest;
    },
    isDevelopment: function () {
        return process.env.NODE_ENV !== 'production';
    },
    isSpellcheckEnabled: function () {
        return this.isSpellcheckEnabled;
    },
    isPhoneticsEnabled: function () {
        return this.isPhoneticsEnabled;
    },
    isFuzzyResultsEnabled: function () {
        return this.isFuzzyResultsEnabled;
    },
    isMetacardPreviewEnabled: function () {
        return !this.isMetacardPreviewDisabled;
    }
};
export default properties;
//# sourceMappingURL=properties.js.map