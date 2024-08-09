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
interface MenuProps {
    /** Currently selected value of the provided `<MenuItems />`. */
    value?: any;
    /**
     * Determines if multiple items can be selected
     *
     * @default false
     */
    multi?: boolean;
    /**
     * MenuItems
     */
    children?: any;
    /** Optional value change handler. */
    onChange: (value: any) => void;
    /** Optional className to style root menu element.  */
    className?: string;
    onClose?: () => void;
}
type MenuState = {
    active: boolean;
};
export declare class Menu extends React.Component<MenuProps, MenuState> {
    constructor(props: MenuProps);
    chooseActive(): any;
    onHover(active: any): void;
    getChildren(): (string | number | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal)[];
    getChildrenFrom(children: any): (string | number | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal)[];
    onShift(offset: any): void;
    getValue(value: any): any;
    onChange(value: any): void;
    onKeyDown(e: any): void;
    componentDidUpdate(previousProps: MenuProps): void;
    render(): JSX.Element;
}
type MenuItemProps = {
    /** A value to represent the current Item */
    value?: any;
    /**
     * Children to display for menu item.
     *
     * @default value
     */
    children?: any;
    /** Optional styles for root element. */
    style?: object;
    selected?: any;
    onClick?: any;
    active?: any;
    disabled?: any;
    onHover?: any;
};
export declare const MenuItem: {
    (props: MenuItemProps): JSX.Element;
    displayName: string;
};
export {};
