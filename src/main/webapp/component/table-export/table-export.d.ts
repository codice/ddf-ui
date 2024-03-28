/// <reference types="react" />
import { ExportCountInfo, DownloadInfo } from '../../react-component/utils/export';
export type Props = {
    selectionInterface: any;
};
export declare const getWarning: (exportCountInfo: ExportCountInfo) => string;
export declare const getDownloadBody: (downloadInfo: DownloadInfo) => Promise<{
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
        columnAliasMap: Record<string, string> | undefined;
    };
}>;
declare const TableExports: ({ selectionInterface }: Props) => JSX.Element;
export default TableExports;
