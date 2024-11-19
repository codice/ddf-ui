/// <reference types="react" />
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult';
import { Overridable } from '../../js/model/Base/base-classes';
export declare const normalDownload: ({ result }: {
    result: LazyQueryResult;
}) => void;
export declare const BaseDownload: ({ lazyResults, }: {
    lazyResults: LazyQueryResult[];
}) => JSX.Element;
export declare const OverridableDownload: Overridable<({ lazyResults, }: {
    lazyResults: LazyQueryResult[];
}) => JSX.Element>;
export declare const useDownloadComponent: () => ({ lazyResults, }: {
    lazyResults: LazyQueryResult[];
}) => JSX.Element;
