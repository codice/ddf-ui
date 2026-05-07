import React from 'react';
export declare const enterKeySubmitEventName = "enter key submit";
export type CustomEventType = CustomEvent<React.SyntheticEvent>;
export declare const EnterKeySubmitEventHandler: (e: React.KeyboardEvent) => void;
export declare const EnterKeySubmitProps: Required<Pick<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onKeyUp'>>;
export declare const dispatchEnterKeySubmitEvent: (e: React.SyntheticEvent) => void;
export declare const useListenToEnterKeySubmitEvent: ({ callback, }: {
    callback: (e: CustomEventType) => void;
}) => {
    setElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};
