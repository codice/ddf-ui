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
export declare const ResultsCommonControls: ({ getStartingLeft, getStartingRight, onSave, }: ResultsCommonControlsType) => import("react/jsx-runtime").JSX.Element;
declare const TableVisual: ({ selectionInterface, mode, setMode }: Props) => import("react/jsx-runtime").JSX.Element;
export default TableVisual;
