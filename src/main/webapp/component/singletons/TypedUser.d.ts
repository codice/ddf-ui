/// <reference types="backbone" />
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
import { SortType } from '../../js/model/Query.shared-types';
import { FilterBuilderClass } from '../filter-builder/filter.structure';
export declare const TypedUserInstance: {
    getUserInstance: () => any;
    getResultsAttributesSummaryShown: () => string[];
    getResultsAttributesShownList: () => string[];
    getResultsAttributesShownTable: () => string[];
    getResultsAttributesPossibleSummaryShown: () => string[];
    getResultsAttributesPossibleTable: () => string[];
    getResultsAttributesPossibleList: () => string[];
    getQuerySettingsJSON: () => QuerySettingsType;
    getQuerySettingsModel: () => QuerySettingsModelType;
    updateQuerySettings: (newSettings: Partial<QuerySettingsType>) => void;
    getCoordinateFormat: () => string;
    getEphemeralSorts(): undefined | SortType[];
    getEphemeralFilter(): undefined | FilterBuilderClass;
    removeEphemeralFilter(): void;
    removeEphemeralSorts(): void;
    getPreferences(): import("backbone").Model<any, import("backbone").ModelSetOptions, {}> & {
        needsUpdate: (update: any) => boolean;
    };
    savePreferences(): void;
    getActingRole: () => string;
    setActingRole: (actingRole: string) => any;
    canWrite: (result: LazyQueryResult) => boolean;
    isAdmin: (result: LazyQueryResult) => boolean;
    getResultCount: () => number;
    getUserReadableDateTime: (val: any) => string;
    getMapHome: () => any;
    getDecimalPrecision: () => any;
    getMomentDate(date: string): string;
    needsUpdate(upToDatePrefs: any): boolean;
    sync(upToDatePrefs: any): void;
};
export declare function useActingRole<T extends string>(): T;
export declare const useEphemeralFilter: () => FilterBuilderClass | undefined;
type QuerySettingsType = {
    type: string;
    sources: string[];
    federation: 'selected' | 'enterprise';
    sorts: {
        attribute: string;
        direction: 'descending' | 'ascending';
    }[];
    template: string;
    spellcheck: boolean;
    phonetics: boolean;
    additionalOptions?: string;
};
type QuerySettingsModelType = {
    get: (attr: string) => any;
    set: (attr: any, value?: any) => void;
    toJSON: () => QuerySettingsType;
};
export {};
