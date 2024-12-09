import * as React from 'react';
import { CardProps } from '@mui/material/Card';
import { CardHeaderProps } from '@mui/material/CardHeader';
import { CardActionsProps } from '@mui/material/CardActions';
import { CardContentProps } from '@mui/material/CardContent';
import { CardActionAreaProps } from '@mui/material/CardActionArea';
import { TypographyProps } from '@mui/material/Typography';
export declare const ZeroWidthSpace: () => JSX.Element;
export declare const WrappedHeader: ({ title, ...otherProps }: CardHeaderProps) => JSX.Element;
export declare const WrappedCard: React.ComponentType<React.PropsWithChildren<CardProps>>;
export declare const WrappedCardActions: React.ComponentType<React.PropsWithChildren<CardActionsProps>>;
export declare const WrappedCardContent: React.ComponentType<React.PropsWithChildren<CardContentProps>>;
export declare const WrappedCardContentLabel: (props: TypographyProps) => JSX.Element;
export declare const WrappedCardContentValue: ({ children, ...otherProps }: TypographyProps) => JSX.Element;
export declare const WrappedCardActionArea: import("styled-components").StyledComponent<React.ForwardRefExoticComponent<Omit<CardActionAreaProps, "ref"> & React.RefAttributes<any>>, import("styled-components").DefaultTheme, {
    classes?: Partial<import("@mui/material/CardActionArea").CardActionAreaClasses> | undefined;
    focusVisibleClassName?: string | undefined;
    sx?: import("@mui/system").SxProps<import("@mui/material").Theme> | undefined;
} & Omit<{
    action?: React.Ref<import("@mui/material").ButtonBaseActions> | undefined;
    centerRipple?: boolean | undefined;
    children?: React.ReactNode;
    classes?: Partial<import("@mui/material").ButtonBaseClasses> | undefined;
    disabled?: boolean | undefined;
    disableRipple?: boolean | undefined;
    disableTouchRipple?: boolean | undefined;
    focusRipple?: boolean | undefined;
    focusVisibleClassName?: string | undefined;
    LinkComponent?: React.ElementType<any> | undefined;
    onFocusVisible?: React.FocusEventHandler<any> | undefined;
    sx?: import("@mui/system").SxProps<import("@mui/material").Theme> | undefined;
    tabIndex?: number | undefined;
    TouchRippleProps?: Partial<import("@mui/material/ButtonBase/TouchRipple").TouchRippleProps> | undefined;
    touchRippleRef?: React.Ref<import("@mui/material/ButtonBase/TouchRipple").TouchRippleActions> | undefined;
}, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    ref?: ((instance: HTMLButtonElement | null) => void) | React.RefObject<HTMLButtonElement> | null | undefined;
}, "children" | keyof import("@mui/material/OverridableComponent").CommonProps | "disabled" | "sx" | "tabIndex" | "action" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef">, never>;
type CreateCardProps = {
    text: string;
    cardProps?: CardProps;
};
export declare const CreateCard: import("styled-components").StyledComponent<React.ForwardRefExoticComponent<CreateCardProps & React.RefAttributes<any>>, import("styled-components").DefaultTheme, CreateCardProps, never>;
export {};
