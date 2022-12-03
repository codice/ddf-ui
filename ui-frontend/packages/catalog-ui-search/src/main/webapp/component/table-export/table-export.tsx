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
import { useEffect, useState } from 'react';
import TableExport from '../../react-component/table-export';
import Sources from '../../component/singletons/sources-instance';
import { getExportOptions, Transformer, } from '../../react-component/utils/export';
import user from '../../component/singletons/user-instance';
import { exportResultSet, ExportCountInfo, DownloadInfo, } from '../../react-component/utils/export';
import saveFile from '../../react-component/utils/save-file';
import { DEFAULT_USER_QUERY_OPTIONS } from '../../js/model/TypedQuery';
import useSnack from '../hooks/useSnack';
import { AddSnack } from '../snack/snack.provider';
import properties from '../../js/properties';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition';
type ExportResponse = {
    displayName: string;
    id: string;
};
export type Props = {
    selectionInterface: any;
    filteredAttributes: string[];
};
type Source = {
    id: string;
    hits: number;
};
// @ts-expect-error ts-migrate(6133) FIXME: 'exportSize' is declared but its value is never re... Remove this comment to see the full error message
export function getStartIndex(src: string, exportSize: any, selectionInterface: any) {
    const srcIndexMap = selectionInterface.getCurrentQuery()
        .nextIndexForSourceGroup;
    if (src === Sources.localCatalog) {
        return srcIndexMap['local'];
    }
    return srcIndexMap[src];
}
function getSrcs(selectionInterface: any) {
    return selectionInterface.getCurrentQuery().getSelectedSources();
}
export function getSrcCount(src: any, count: any, exportSize: any, selectionInterface: any) {
    const result = selectionInterface.getCurrentQuery().get('result');
    return exportSize === 'currentPage'
        ? Object.values(result.get('lazyResults').status as {
            [key: string]: any;
        }).find((status: any) => status.id === src).count
        : count;
}
function getColumnOrder(): string[] {
    return user.get('user').get('preferences').get('columnOrder');
}
function getHiddenFields(): string[] {
    return user.get('user').get('preferences').get('columnHide');
}
function getSearches(exportSize: string, srcs: string[], cql: string, count: any, selectionInterface: any): any {
    const cacheId = selectionInterface.getCurrentQuery().get('cacheId');
    if (exportSize !== 'currentPage') {
        return srcs.length > 0
            ? [
                {
                    srcs,
                    cql,
                    count,
                    cacheId,
                },
            ]
            : [];
    }
    return srcs.map((src: string) => {
        const start = getStartIndex(src, exportSize, selectionInterface);
        const srcCount = getSrcCount(src, count, exportSize, selectionInterface);
        return {
            src,
            cql,
            start,
            count: srcCount,
            cacheId,
        };
    });
}
function getHits(sources: Source[]): number {
    return sources
        .filter((source) => source.id !== 'cache')
        .reduce((hits, source) => (source.hits ? hits + source.hits : hits), 0);
}
function getExportCount({ exportSize, selectionInterface, customExportCount, }: ExportCountInfo): number {
    if (exportSize === 'custom') {
        return customExportCount;
    }
    const result = selectionInterface.getCurrentQuery().get('result');
    return exportSize === 'all'
        ? getHits(Object.values(result.get('lazyResults').status))
        : Object.keys(result.get('lazyResults').results).length;
}
function getSorts(selectionInterface: any) {
    return selectionInterface.getCurrentQuery().get('sorts');
}
export const getWarning = (exportCountInfo: ExportCountInfo): string => {
    const exportCount = getExportCount(exportCountInfo);
    const result = exportCountInfo.selectionInterface
        .getCurrentQuery()
        .get('result');
    const totalHits = getHits(Object.values(result.get('lazyResults').status));
    const limitWarning = `You cannot export more than the administrator configured limit of ${(properties as any).exportResultLimit}.`;
    let warningMessage = '';
    if (exportCount > (properties as any).exportResultLimit) {
        if (exportCountInfo.exportSize === 'custom') {
            return limitWarning;
        }
        warningMessage =
            limitWarning +
                `  Only ${(properties as any).exportResultLimit} ${(properties as any).exportResultLimit === 1 ? `result` : `results`} will be exported.`;
    }
    if (exportCountInfo.exportSize === 'custom') {
        if (exportCount > totalHits) {
            warningMessage = `You are trying to export ${exportCount} results but there ${totalHits === 1 ? `is` : `are`} only ${totalHits}.  Only ${totalHits} ${totalHits === 1 ? `result` : `results`} will be exported.`;
        }
    }
    if (totalHits > 100 &&
        exportCount > 100 &&
        (properties as any).exportResultLimit > 100) {
        warningMessage += `  This may take a long time.`;
    }
    return warningMessage;
};
export const getDownloadBody = (downloadInfo: DownloadInfo) => {
    const { exportSize, customExportCount, selectionInterface, filteredAttributes, } = downloadInfo;
    const hiddenFields = getHiddenFields();
    const columnOrder = getColumnOrder().filter((property: string) => filteredAttributes.includes(property) && !properties.isHidden(property));
    const count = Math.min(getExportCount({ exportSize, selectionInterface, customExportCount }), (properties as any).exportResultLimit);
    const query = selectionInterface.getCurrentQuery();
    const cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
        originalFilterTree: query.get('filterTree'),
        queryRef: query,
    });
    const srcs = getSrcs(selectionInterface);
    const sorts = getSorts(selectionInterface);
    const phonetics = query.get('phonetics');
    const spellcheck = query.get('spellcheck');
    const args = {
        hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
        columnOrder: columnOrder.length > 0 ? columnOrder : [],
        columnAliasMap: properties.attributeAliases,
    };
    const searches = getSearches(exportSize, srcs, cql, count, selectionInterface);
    return {
        phonetics,
        spellcheck,
        searches,
        count,
        sorts,
        args,
    };
};
const generateOnDownloadClick = ({ addSnack }: {
    addSnack: AddSnack;
}) => {
    return async (downloadInfo: DownloadInfo) => {
        const exportFormat = encodeURIComponent(downloadInfo.exportFormat);
        try {
            const body = getDownloadBody(downloadInfo);
            const response = await exportResultSet(exportFormat, body);
            if (response.status === 200) {
                const data = await response.blob();
                const contentType = response.headers.get('content-type');
                const filename = contentDisposition.parse(response.headers.get('content-disposition')).parameters.filename;
                saveFile(filename, 'data:' + contentType, data);
            }
            else {
                addSnack('Error: Could not export results.', {
                    alertProps: { severity: 'error' },
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    };
};
const TableExports = (props: Props) => {
    const [formats, setFormats] = useState([]);
    const addSnack = useSnack();
    useEffect(() => {
        const fetchFormats = async () => {
            const exportFormats = await getExportOptions(Transformer.Query);
            const sortedExportFormats = exportFormats.sort((format1: ExportResponse, format2: ExportResponse) => {
                return format1.displayName.localeCompare(format2.displayName);
            });
            setFormats(sortedExportFormats.map((exportFormat: ExportResponse) => ({
                label: exportFormat.displayName,
                value: exportFormat.id,
            })));
        };
        fetchFormats();
    }, []);
    return (<TableExport exportFormats={formats} selectionInterface={props.selectionInterface} getWarning={getWarning} onDownloadClick={generateOnDownloadClick({ addSnack })} filteredAttributes={props.filteredAttributes}/>);
};
export default TableExports;
