export declare const ColorSquare: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components").FastOmit<Omit<import("styled-components").FastOmit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, never>, "ref"> & {
    ref?: ((instance: HTMLButtonElement | null) => void | import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof import("react").DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | import("react").RefObject<HTMLButtonElement> | null | undefined;
}, never>> & string;
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
export declare const LocationColorSelector: ({ setColor, }: LocationColorSelectorProps) => import("react/jsx-runtime").JSX.Element;
export {};
