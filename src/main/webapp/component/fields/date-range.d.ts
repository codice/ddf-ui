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
import { DateRangeInput, DateRangeInputProps } from '@blueprintjs/datetime';
import { ValueTypes } from '../filter-builder/filter.structure';
type Props = {
    value: ValueTypes['during'];
    onChange: (value: ValueTypes['during']) => void;
    /**
     * Override if you absolutely must
     */
    BPDateRangeProps?: Partial<DateRangeInputProps>;
    /**
     * Optional ref to access the underlying Blueprint DateRangeInput component
     */
    ref?: React.RefObject<DateRangeInput>;
};
export declare function defaultValue(): {
    start: string;
    end: string;
};
/**
 *  By updating invalid starting values before we go into the above component, we can make sure we always have a valid value to fall back to.
 */
export declare const DateRangeField: React.ForwardRefExoticComponent<Omit<Props, "ref"> & React.RefAttributes<DateRangeInput>>;
export {};
