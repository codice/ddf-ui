import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
import { Overridable } from '../../../js/model/Base/base-classes';
export declare enum Transformer {
    Metacard = "metacard",
    Query = "query"
}
export type ResultSet = {
    cql: string;
    src?: string;
    srcs?: string[];
    start?: number;
    count: number;
};
export type ExportBody = {
    searches: ResultSet[];
    count: number;
    sorts: Object[];
    args?: Object;
};
export type ExportFormat = {
    id: string;
    displayName: string;
};
export interface ExportCountInfo {
    exportSize: string;
    selectionInterface: any;
    customExportCount: number;
}
export type DownloadInfo = {
    exportFormat: string;
    exportSize: string;
    customExportCount: number;
    selectionInterface: any;
};
export declare const getExportResults: (results: LazyQueryResult[]) => {
    id: string;
    source: string;
    attributes: string[];
}[];
export declare const getExportResult: (result: LazyQueryResult) => {
    id: string;
    source: string;
    attributes: string[];
};
export declare const getExportOptions: (type: Transformer) => Promise<any>;
export declare const getColumnOrder: () => string[];
export declare const OverridableGetColumnOrder: Overridable<() => string[]>;
export declare const aliasMap: () => string;
export declare const exportResultSet: (transformer: string, body: ExportBody) => Promise<Response>;
