/// <reference types="react" />
type LocationInputReactPropsType = {
    value: string;
    onChange: (val: string) => void;
    isStateDirty?: boolean;
    resetIsStateDirty?: () => void;
};
export declare const LocationInputReact: ({ value, onChange, isStateDirty, resetIsStateDirty, }: LocationInputReactPropsType) => JSX.Element;
declare const _default: ({ value, onChange, isStateDirty, resetIsStateDirty, }: LocationInputReactPropsType) => JSX.Element;
export default _default;
