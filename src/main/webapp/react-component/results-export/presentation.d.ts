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
declare const ResultsExportComponent: ({ selectedFormat, exportFormats, exportDisabled, onExportClick, handleExportOptionChange, exportSuccessful, onClose, loading, }: Props) => import("react/jsx-runtime").JSX.Element;
export default ResultsExportComponent;
