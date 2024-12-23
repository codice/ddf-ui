import * as React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { LinkProps, Link } from 'react-router-dom';
export type BaseProps = {
    Icon?: React.FC<React.PropsWithChildren<any>>;
    expandedLabel: React.ReactNode;
    unexpandedLabel: React.ReactNode;
    dataId?: string;
    expanded: boolean;
    orientation?: 'vertical' | 'horizontal';
};
type ExpandingButtonProps = (ButtonProps & {
    component?: undefined;
} & BaseProps) | (ButtonProps & BaseProps & {
    component: typeof Link;
} & Partial<LinkProps>) | (ButtonProps & BaseProps & {
    component: 'a';
} & Partial<React.HTMLAttributes<HTMLAnchorElement>>) | (ButtonProps & BaseProps & {
    component: typeof Button;
} & Partial<ButtonProps>);
declare const _default: ({ expanded, Icon, expandedLabel, unexpandedLabel, dataId, orientation, ...buttonProps }: ExpandingButtonProps) => JSX.Element;
export default _default;
