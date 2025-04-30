import { LinkProps } from 'react-router-dom';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
import { AutocompleteProps } from '@mui/material/Autocomplete';
type SaveFormType = {
    selectionInterface: any;
    onSave: (title: string) => void;
    onClose: () => void;
};
export declare const SaveForm: ({ onClose, selectionInterface, onSave, }: SaveFormType) => import("react/jsx-runtime").JSX.Element;
export declare const OpenSearch: ({ onFinish, constructLink, label, archived, autocompleteProps, }: {
    onFinish: (selection: LazyQueryResult) => void;
    constructLink: (result: LazyQueryResult) => LinkProps["to"];
    label: string;
    archived?: boolean;
    autocompleteProps?: Partial<AutocompleteProps<LazyQueryResult, false, true, false>>;
}) => import("react/jsx-runtime").JSX.Element;
export default function HomePage(): import("react/jsx-runtime").JSX.Element;
export {};
