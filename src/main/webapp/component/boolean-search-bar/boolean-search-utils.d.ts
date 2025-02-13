export declare const getRandomId: () => string;
export type Option = {
    type: string;
    token: string;
};
type Suggestions = {
    [key: string]: string[];
};
export declare const suggestionsToOptions: (suggestions: Suggestions) => Option[];
type CallbackType = ({ options, error, }: {
    options: Option[];
    error: any;
}) => void;
export declare const fetchSuggestions: ({ text, callback, signal, }: {
    text: string;
    callback: CallbackType;
    signal: AbortSignal;
}) => Promise<void>;
type BooleanEndpointReturnType = {
    cql?: string;
    error?: boolean;
    errorMessage?: string;
};
export declare const fetchCql: ({ searchText, searchProperty, callback, signal, }: {
    callback: (result: BooleanEndpointReturnType) => void;
    searchText: string | null;
    searchProperty?: string | undefined;
    signal?: AbortSignal | undefined;
}) => Promise<void>;
export {};
