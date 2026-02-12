export type QueryResponseType = {
    results: any;
    statusBySource: {
        [key: string]: {
            hits: number;
            count: number;
            elapsed: number;
            id: string;
            successful: boolean;
            warnings: any[];
            errors: string[];
        };
    };
    types: any;
    highlights: any;
    didYouMeanFields: any;
    showingResultsForFields: any;
};
export declare function checkForErrors(response: QueryResponseType): void;
export type FetchErrorEventType = CustomEvent<{
    errors: string[];
}>;
export declare function throwFetchErrorEvent(errors?: string[]): void;
export declare function listenForFetchErrorEvent(callback: (event: FetchErrorEventType) => void): () => void;
export default function (url: string, { headers, ...opts }?: RequestInit): Promise<Response>;
