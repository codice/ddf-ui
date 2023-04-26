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
import { GridProps } from '@material-ui/core/Grid';
import { LazyQueryResults } from '../../../js/model/LazyQueryResult/LazyQueryResults';
import { ButtonProps } from '@material-ui/core/Button';
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
};
export declare const CellComponent: (props: GridProps) => JSX.Element;
export declare const HeaderCheckbox: ({ showText, lazyResults, buttonProps, }: {
    showText?: boolean | undefined;
    lazyResults: HeaderProps['lazyResults'];
    buttonProps?: ButtonProps<"button", {}> | undefined;
}) => JSX.Element;
export declare const Header: ({ lazyResults, setHeaderColWidth, headerColWidth, }: HeaderProps) => JSX.Element;
declare const _default: ({ lazyResults, setHeaderColWidth, headerColWidth, }: HeaderProps) => JSX.Element;
export default _default;
