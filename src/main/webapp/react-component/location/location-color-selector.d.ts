/// <reference types="react" />
export declare const ColorSquare: import("styled-components").StyledComponent<"button", import("styled-components").DefaultTheme, {}, never>;
type LocationColorSelectorProps = {
    setColor: (color: string) => void;
};
export declare const locationColors: {
    purple: string;
    yellow: string;
    cyan: string;
    red: string;
    green: string;
    blue: string;
    violet: string;
    orange: string;
    teal: string;
    grey: string;
    black: string;
    white: string;
};
export declare const contrastingColor = "#996600";
export declare const LocationColorSelector: ({ setColor, }: LocationColorSelectorProps) => JSX.Element;
export {};
