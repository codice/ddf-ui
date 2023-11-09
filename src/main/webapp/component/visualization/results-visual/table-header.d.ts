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
import { LazyQueryResults } from '../../../js/model/LazyQueryResult/LazyQueryResults';
import { ButtonProps } from '@mui/material/Button';
export type Header = {
    hidden: boolean;
    id: string;
    label?: string;
    sortable: boolean;
};
type HeaderProps = {
    lazyResults: LazyQueryResults;
    setHeaderColWidth: Function;
    headerColWidth: Map<string, string>;
    actionWidth: number;
    addOnWidth: number;
};
export declare const CellComponent: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<any>>;
export declare const HeaderCheckbox: ({ showText, lazyResults, buttonProps, }: {
    showText?: boolean | undefined;
    lazyResults: HeaderProps['lazyResults'];
    buttonProps?: ButtonProps | undefined;
}) => JSX.Element;
export declare const Header: ({ lazyResults, setHeaderColWidth, headerColWidth, actionWidth, addOnWidth, }: HeaderProps) => JSX.Element;
declare const _default: ({ lazyResults, setHeaderColWidth, headerColWidth, actionWidth, addOnWidth, }: HeaderProps) => JSX.Element;
export default _default;
