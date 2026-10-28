type LocationInputReactPropsType = {
    value: string;
    onChange: (val: string) => void;
    isStateDirty?: boolean;
    resetIsStateDirty?: () => void;
};
export declare const LocationInputReact: ({ value, onChange, isStateDirty, resetIsStateDirty, }: LocationInputReactPropsType) => import("react/jsx-runtime").JSX.Element;
export default LocationInputReact;
