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
export declare const MuiOutlinedInputBorderClasses = "MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline border";
export declare const Provider: ({ children }: {
    children: any;
}) => JSX.Element;
export {};
