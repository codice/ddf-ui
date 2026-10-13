import { SortType } from '../Query.shared-types';
export type QuerySortType = SortType;
export type TruncatingFilterType = {
    type: 'ILIKE' | string;
    property: string;
    value: string;
    filters: undefined;
};
export type FilterType = {
    type: 'AND' | 'OR' | 'NOT AND' | 'NOT OR';
    filters: (TruncatingFilterType | FilterType)[];
};
export type MasterType = TruncatingFilterType | FilterType;
