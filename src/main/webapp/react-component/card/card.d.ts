import * as React from 'react';
import { CardProps } from '@mui/material/Card';
import { CardHeaderProps } from '@mui/material/CardHeader';
import { CardActionsProps } from '@mui/material/CardActions';
import { CardContentProps } from '@mui/material/CardContent';
import { CardActionAreaProps } from '@mui/material/CardActionArea';
import { TypographyProps } from '@mui/material/Typography';
export declare const ZeroWidthSpace: () => import("react/jsx-runtime").JSX.Element;
export declare const WrappedHeader: ({ title, ...otherProps }: CardHeaderProps) => import("react/jsx-runtime").JSX.Element;
export declare const WrappedCard: React.ComponentType<React.PropsWithChildren<CardProps>>;
export declare const WrappedCardActions: React.ComponentType<React.PropsWithChildren<CardActionsProps>>;
export declare const WrappedCardContent: React.ComponentType<React.PropsWithChildren<CardContentProps>>;
export declare const WrappedCardContentLabel: (props: TypographyProps) => import("react/jsx-runtime").JSX.Element;
export declare const WrappedCardContentValue: ({ children, ...otherProps }: TypographyProps) => import("react/jsx-runtime").JSX.Element;
export declare const WrappedCardActionArea: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components/dist/types").Substitute<Omit<Omit<CardActionAreaProps, "ref"> & React.RefAttributes<any>, "ref"> & {
    ref?: ((instance: any) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | React.RefObject<any> | null | undefined;
}, CardActionAreaProps>> & string & Omit<React.ForwardRefExoticComponent<Omit<CardActionAreaProps, "ref"> & React.RefAttributes<any>>, keyof React.Component<any, {}, any>>;
type CreateCardProps = {
    text: string;
    cardProps?: CardProps;
};
export declare const CreateCard: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components/dist/types").Substitute<Omit<CreateCardProps & React.RefAttributes<any>, "ref"> & {
    ref?: ((instance: any) => void | React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof React.DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | React.RefObject<any> | null | undefined;
}, CreateCardProps>> & string & Omit<React.ForwardRefExoticComponent<CreateCardProps & React.RefAttributes<any>>, keyof React.Component<any, {}, any>>;
export {};
