type Props = {
    model: any;
};
/**
 * We use the filterTree of the model as the single source of truth, so it's always up to date.
 * As a result, we have to listen to updates to it.
 */
export declare const FilterBuilderRoot: ({ model }: Props) => JSX.Element;
export {};
