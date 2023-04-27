type Option = {
    label: string;
    value: string;
};
type Props = {
    exportSize: string;
    exportFormat: string;
    handleExportSizeChange: (value: any) => void;
    handleExportFormatChange: (value: any) => void;
    handleCustomExportCountChange: (value: any) => void;
    exportSizeOptions: Option[];
    exportFormatOptions: Option[];
    onDownloadClick: () => void;
    warning: string;
    customExportCount: number;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
