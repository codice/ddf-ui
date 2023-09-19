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
import React from 'react';
type RadioProps = {
    value?: string;
    onChange?: (...args: any[]) => any;
    children?: React.ReactNode;
};
declare const Radio: (props: RadioProps) => JSX.Element;
type RadioItemProps = {
    value?: string;
    children?: any;
};
declare const RadioItem: (props: RadioItemProps) => JSX.Element;
export { Radio, RadioItem };
