import { ExportCountInfo, DownloadInfo } from '../../react-component/utils/export';
export type Props = {
    selectionInterface: any;
    filteredAttributes: string[];
};
export declare const getWarning: (exportCountInfo: ExportCountInfo) => string;
export declare const getDownloadBody: (downloadInfo: DownloadInfo) => {
    phonetics: any;
    spellcheck: any;
    searches: {
        srcs: any;
        cql: string;
        count: number;
        cacheId: any;
    }[];
    count: number;
    sorts: any;
    args: {
        hiddenFields: string[];
        columnOrder: string[];
        columnAliasMap: any;
    };
};
declare const TableExports: ({ selectionInterface, filteredAttributes }: Props) => JSX.Element;
export default TableExports;
