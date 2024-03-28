/// <reference types="react" />
type ExportFormat = {
    id: string;
    displayName: string;
};
type Props = {
    selectedFormat: string;
    exportFormats: ExportFormat[];
    downloadDisabled: boolean;
    onDownloadClick: () => void;
    handleExportOptionChange: (val: string) => void;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
