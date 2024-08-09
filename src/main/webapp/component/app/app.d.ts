/// <reference types="react" />
import { RouteProps, LinkProps } from 'react-router-dom';
import { SettingsComponentType } from '../../react-component/user-settings/user-settings';
import { PermissiveComponentType } from '../../typescript';
import { BaseProps } from '../button/expanding-button';
export declare const handleBase64EncodedImages: (url: string) => string;
type ForNavButtonType = Omit<BaseProps, 'expanded'> & Required<Pick<BaseProps, 'dataId'>>;
export type RouteShownInNavType = {
    routeProps: RouteProps;
    linkProps: LinkProps;
    showInNav: true;
    navButtonProps: ForNavButtonType;
};
export type RouteNotShownInNavType = {
    routeProps: RouteProps;
    showInNav: false;
};
export type IndividualRouteType = RouteShownInNavType | RouteNotShownInNavType;
type AppPropsType = {
    RouteInformation: IndividualRouteType[];
    NotificationsComponent: PermissiveComponentType;
    SettingsComponents: SettingsComponentType;
};
/**
 * If you're not using a custom loading screen,
 * this handles removing the default one for you on first render
 * of the app.
 */
export declare const useDefaultWelcome: () => void;
export declare const useNavContextProvider: () => {
    setNavOpen: (_navOpen: boolean) => void;
    navOpen: boolean;
};
declare const _default: ({ RouteInformation, NotificationsComponent, SettingsComponents, }: AppPropsType) => JSX.Element;
export default _default;
