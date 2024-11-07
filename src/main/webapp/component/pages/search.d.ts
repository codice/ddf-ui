/// <reference types="react" />
import { LinkProps } from 'react-router-dom';
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
import { AutocompleteProps } from '@mui/material/Autocomplete';
type SaveFormType = {
    selectionInterface: any;
    onSave: (title: string) => void;
    onClose: () => void;
};
export declare const SaveForm: ({ onClose, selectionInterface, onSave, }: SaveFormType) => JSX.Element;
export declare const OpenSearch: ({ onFinish, constructLink, label, archived, autocompleteProps, }: {
    onFinish: (selection: LazyQueryResult) => void;
    constructLink: (result: LazyQueryResult) => LinkProps['to'];
    label: string;
    archived?: boolean | undefined;
    autocompleteProps?: Partial<AutocompleteProps<LazyQueryResult, false, true, false, "div">> | undefined;
}) => JSX.Element;
export declare const HomePage: () => JSX.Element;
export {};
