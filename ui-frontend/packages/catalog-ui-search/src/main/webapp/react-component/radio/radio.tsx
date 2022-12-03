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
import styled from 'styled-components';
import { readableColor, rgba } from 'polished';
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
const foreground = (props: any) => {
    if (props.theme.backgroundDropdown !== undefined) {
        return readableColor(props.theme.backgroundDropdown);
    }
};
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
const background = (props: any, alpha = 0.4) => {
    if (props.theme.backgroundDropdown !== undefined) {
        return rgba(readableColor(props.theme.backgroundDropdown), alpha);
    }
};
const Root = styled.div `
  border-radius: ${(props) => props.theme.borderRadius};
  white-space: nowrap;
  background-color: inherit;
  border: 1px solid ${background};
  display: inline-block;
`;
const Button = styled.button `
  vertical-align: top;
  opacity: ${(props) => props.theme.minimumOpacity};
  min-width: ${(props) => props.theme.minimumButtonSize};
  min-height: ${(props) => props.theme.minimumButtonSize};
  border: none;
  border-left: ${(props) => !(props as any).first ? '1px solid ' + background(props) : 'none'};
  background-color: inherit;
  padding: 0px 10px;
  cursor: pointer;
  font-size: ${(props) => props.theme.minimumFontSize};
  color: ${foreground};
  ${(props) => (props as any).selected
    ? `
    opacity: 1;
    font-weight: bolder;
    background: ${background(props, 0.1)};
  `
    : ''};
`;
type RadioProps = {
    value?: string;
    onChange?: (...args: any[]) => any;
    children?: React.ReactNode;
};
const Radio = (props: RadioProps) => {
    const { value, children, onChange } = props;
    const childrenWithProps = React.Children.map(children, (child, i) => {
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        return React.cloneElement(child, {
            first: i === 0,
            selected: value === (child as any).props.value,
            // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
            onClick: () => onChange((child as any).props.value),
        });
    });
    return <Root>{childrenWithProps}</Root>;
};
type RadioItemProps = {
    value?: string;
};
const RadioItem = (props: RadioItemProps) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'first' does not exist on type 'RadioItem... Remove this comment to see the full error message
    const { value, first, children, selected, onClick } = props;
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: any; first: any; selected: any; ... Remove this comment to see the full error message
    return (<Button first={first} selected={selected} onClick={() => onClick(value)}>
      {children || value}
    </Button>);
};
export { Radio, RadioItem };
