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
declare const TableExports: ({ selectionInterface, onClose, setExportSuccessful, exportSuccessful, }: Props) => import("react/jsx-runtime").JSX.Element;
export default TableExports;
