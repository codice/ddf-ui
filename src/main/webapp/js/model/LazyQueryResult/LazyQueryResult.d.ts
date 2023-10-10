/// <reference types="backbone" />
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
import { ResultType } from '../Types';
import { LazyQueryResults, AttributeHighlights } from './LazyQueryResults';
type SubscribableType = 'backboneCreated' | 'selected' | 'filtered' | 'backboneSync';
export declare class LazyQueryResult {
    ['subscriptionsToMe.backboneCreated']: {
        [key: string]: () => void;
    };
    ['subscriptionsToMe.backboneSync']: {
        [key: string]: () => void;
    };
    ['subscriptionsToMe.selected']: {
        [key: string]: () => void;
    };
    ['subscriptionsToMe.filtered']: {
        [key: string]: () => void;
    };
    subscribeTo({ subscribableThing, callback, }: {
        subscribableThing: SubscribableType;
        callback: () => void;
    }): () => void;
    _notifySubscribers(subscribableThing: SubscribableType): void;
    ['_notifySubscribers.backboneCreated'](): void;
    ['_notifySubscribers.backboneSync'](): void;
    ['_notifySubscribers.selected'](): void;
    ['_notifySubscribers.filtered'](): void;
    _turnOnDebouncing(): void;
    index: number;
    prev?: LazyQueryResult;
    next?: LazyQueryResult;
    parent?: LazyQueryResults;
    plain: ResultType;
    backbone?: any;
    isResourceLocal: boolean;
    highlights: AttributeHighlights;
    type: 'query-result';
    ['metacard.id']: string;
    isSelected: boolean;
    isFiltered: boolean;
    constructor(plain: ResultType, highlights?: AttributeHighlights);
    syncWithBackbone(): void;
    syncWithPlain(): void;
    refreshFromEditResponse(response: [
        {
            ids: string[];
            attributes: [
                {
                    attribute: string;
                    values: string[];
                }
            ];
        }
    ]): void;
    refreshData(metacardProperties: LazyQueryResult['plain']['metacard']['properties']): void;
    refreshDataOverNetwork(): void;
    handleRefreshError(): void;
    parseRefresh(response: {
        results: ResultType[];
    }): void;
    getDownloadUrl(): string;
    getPreview(): string;
    hasPreview(): boolean;
    isSearch(): boolean;
    isResource(): boolean;
    isRevision(): boolean;
    isDeleted(): boolean;
    isRemote(): boolean;
    hasGeometry(attribute?: any): boolean;
    getGeometries(attribute?: any): any;
    getPoints(attribute?: any): any;
    getMapActions(): {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    hasMapActions(): boolean;
    getExportActions(): {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    hasExportActions(): boolean;
    getOtherActions(): {
        description: string;
        displayName: string;
        id: string;
        title: string;
        url: string;
    }[];
    hasRelevance(): boolean;
    getRoundedRelevance(): string;
    hasErrors(): boolean;
    getErrors(): any;
    hasWarnings(): boolean;
    getWarnings(): any;
    getColor(): string;
    getBackbone(): any;
    _setBackbone(backboneModel: Backbone.Model): void;
    setSelected(isSelected: boolean): boolean;
    shiftSelect(): void;
    controlSelect(): void;
    select(): void;
    setFiltered(isFiltered: boolean): boolean;
    currentOverlayUrl?: string;
}
export {};
