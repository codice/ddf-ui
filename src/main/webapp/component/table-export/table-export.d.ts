/// <reference types="react" />
import { ExportCountInfo, ExportInfo } from '../../react-component/utils/export';
export type Props = {
    selectionInterface: any;
    onClose?: any;
    exportSuccessful?: boolean;
    setExportSuccessful?: any;
};
export declare const getWarning: (exportCountInfo: ExportCountInfo) => string;
export declare const getExportBody: (ExportInfo: ExportInfo) => Promise<{
    phonetics: any;
    spellcheck: any;
    additionalOptions: string;
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
declare const TableExports: ({ selectionInterface, onClose, setExportSuccessful, exportSuccessful, }: Props) => JSX.Element;
export default TableExports;
