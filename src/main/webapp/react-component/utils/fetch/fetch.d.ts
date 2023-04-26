type Options = {
    headers?: object;
    [key: string]: unknown;
};
export type FetchProps = (url: string, options?: Options) => Promise<Response>;
export default function (url: string, { headers, ...opts }?: Options): Promise<Response>;
export {};
