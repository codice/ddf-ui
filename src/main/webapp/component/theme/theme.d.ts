/// <reference types="react" />
type Theme = {
    primary: string;
    secondary: string;
    background: string;
    navbar: string;
    panels: string;
    overlays: string;
    paper: string;
    tabs: string;
};
export declare const dark: Theme;
export declare const light: Theme;
export declare const Elevations: {
    navbar: number;
    background: number;
    paper: number;
    panels: number;
    overlays: number;
};
export declare const MuiOutlinedInputBorderClasses = "px-[14px] py-[8.5px] border rounded dark:border-white/20 border-black/20 dark:hover:border-white hover:border-black";
declare module '@mui/material' {
    interface ButtonPropsColorOverrides {
        grey: true;
    }
}
export declare const Provider: ({ children }: {
    children: any;
}) => JSX.Element;
export {};
