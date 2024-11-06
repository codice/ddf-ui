/// <reference types="react" />
type Props = {
    selectionInterface: any;
    mode: any;
    setMode: any;
};
type ResultsCommonControlsType = {
    getStartingLeft: () => string[];
    getStartingRight: () => string[];
    onSave: (active: string[]) => void;
};
export declare const ResultsCommonControls: ({ getStartingLeft, getStartingRight, onSave, }: ResultsCommonControlsType) => JSX.Element;
declare const _default: ({ selectionInterface, mode, setMode }: Props) => JSX.Element;
export default _default;
