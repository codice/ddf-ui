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
import { ExportCountInfo, DownloadInfo } from '../../react-component/utils/export';
type Props = {
    selectionInterface: () => void;
    exportFormats: Option[];
    getWarning: (exportCountInfo: ExportCountInfo) => string;
    onDownloadClick: (downloadInfo: DownloadInfo) => void;
};
type Option = {
    label: string;
    value: string;
};
type State = {
    exportSizes: Option[];
    exportFormat: string;
    exportSize: string;
    customExportCount: number;
};
declare const _default: {
    new (props: Props): {
        handleExportFormatChange: (value: string) => void;
        handleExportSizeChange: (value: string) => void;
        handleCustomExportCountChange: (value: number) => void;
        render(): JSX.Element;
        context: unknown;
        setState<K extends keyof State>(state: State | ((prevState: Readonly<State>, props: Readonly<Props>) => State | Pick<State, K> | null) | Pick<State, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<Props>;
        state: Readonly<State>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<Props>, prevState: Readonly<State>): any;
        componentDidUpdate?(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<Props>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<Props>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): void;
    };
    contextType?: React.Context<any> | undefined;
};
export default _default;
