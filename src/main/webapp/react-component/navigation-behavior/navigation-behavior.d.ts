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
type Props = {
    className?: string;
    style?: React.CSSProperties;
};
type State = {
    open: boolean;
};
declare class Dropdown extends React.Component<Props, State> {
    state: {
        open: boolean;
    };
    wrapperRef: React.RefObject<HTMLDivElement>;
    focus: () => void;
    getMenuItems: () => any;
    getAllPossibleMenuItems: () => any;
    listenToKeydown: () => void;
    handleMouseEnter: (e: any) => void;
    handleUpArrow: () => void;
    handleDownArrow: () => void;
    handleKeydown: (event: KeyboardEvent) => void;
    listenToFocusIn(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
declare const _default: typeof Dropdown;
export default _default;
