type Props = {
    search: any;
};
export declare const getHumanReadableSourceName: (sourceId: string) => string | import("react/jsx-runtime").JSX.Element;
/**
 * So we used to use two separate search properties to track sources, federation and sources.
 * If federation was enterprise, we searched everything.  If not, we looked to sources.  I also think local was a thing.
 *
 * Instead, we're going to swap to storing only one property, sources (an array of strings).
 * If sources includes, 'all' then that's enterprise.  If it includes 'local', then that means everything local.
 * If it includes 'remote', that that means everything remote.  All other values are singular selections of a source.
 */
declare const SourceSelector: ({ search }: Props) => import("react/jsx-runtime").JSX.Element;
export default SourceSelector;
