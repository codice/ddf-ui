type Query = {
    srcs?: string[];
    count?: number;
    cql: string;
    facets?: string[];
};
declare const query: (q: Query) => Promise<any>;
export default query;
