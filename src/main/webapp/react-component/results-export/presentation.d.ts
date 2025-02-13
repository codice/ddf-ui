/// <reference types="react" />
import { AddSnack } from '../../component/snack/snack.provider';
type ExportFormat = {
    id: string;
    displayName: string;
};
export type Props = {
    selectedFormat: string;
    exportFormats: ExportFormat[];
    exportDisabled: boolean;
    onExportClick: (addSnack: AddSnack) => void;
    handleExportOptionChange: (val: string) => void;
    loading?: boolean;
    setLoading?: any;
    onClose?: any;
    exportSuccessful?: boolean;
    setExportSuccessful?: any;
};
declare const _default: ({ selectedFormat, exportFormats, exportDisabled, onExportClick, handleExportOptionChange, exportSuccessful, onClose, loading, }: Props) => JSX.Element;
export default _default;
