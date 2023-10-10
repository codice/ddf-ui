/// <reference types="react" />
type ValidationIndicatorProps = {
    helperMessage?: string | JSX.Element;
    error?: boolean;
};
declare const ValidationIndicator: ({ helperMessage: helperText, error, }: ValidationIndicatorProps) => JSX.Element;
export default ValidationIndicator;
