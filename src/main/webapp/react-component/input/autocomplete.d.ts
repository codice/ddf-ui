import { Props as CreatableProps } from 'react-select/src/Creatable';
import { AsyncProps } from 'react-select/src/Async';
import { Props as SelectProps } from 'react-select/src/Select';
export type Option = {
    label: string;
    value: any;
};
export type GroupOptions = {
    label: string;
    options: Option[];
};
/**
 * Very important note when using async options: Because `onInputChange` for some reason is an 'interceptor' rather than a handler that ignores
 * the callback's return value (https://github.com/JedWatson/react-select/issues/1760), if you inline the method like
 * <CreatableSelect onInputChange={(value) => handleValue(value)}
 * and handleValue is an asynchronous function, it will attempt to alter the input value with the return value of handleValue, which will
 * immediately be a promise, causing CreatableSelect to throw an error (in my case `str.replace is not a function`)
 *
 * TLDR: You must not use the shorthand arrow syntax to auto return.
 * <CreatableSelect onInputChange={(value) => {handleValue(value)}} would work without issues.
 */
export declare const WrappedCreatableSelect: (props: CreatableProps<any>) => JSX.Element;
type AsyncCreateableProps = {
    /**
     * Time in ms to debounce load options call.
     */
    debounce?: number;
} & CreatableProps<any> & AsyncProps<any>;
export declare const WrappedAsyncCreatableSelect: (props: AsyncCreateableProps) => JSX.Element;
type AsyncSelectProps = {
    /**
     * Time in ms to debounce load options call.
     */
    debounce?: number;
} & SelectProps & AsyncProps<any>;
export declare const WrappedAsyncSelect: (props: AsyncSelectProps) => JSX.Element;
export {};
