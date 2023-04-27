declare const properties: {
    [key: string]: any;
    fetched: boolean;
    initializing: boolean;
    init: () => Promise<void> | void;
};
export default properties;
