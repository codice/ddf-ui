/// <reference types="react" />
type IndividualSettingsComponentType = ({ SettingsComponents, }: {
    SettingsComponents: SettingsComponentType;
}) => JSX.Element;
export type SettingsComponentType = {
    [key: string]: {
        component: IndividualSettingsComponentType;
    };
};
export declare const BaseSettings: SettingsComponentType;
type UserSettingsProps = {
    SettingsComponents: SettingsComponentType;
};
declare const _default: ({ SettingsComponents }: UserSettingsProps) => JSX.Element;
export default _default;
