/// <reference types="react" />
type Props = {
    persistence: boolean;
    expiration: number;
    onExpirationChange: (v: number) => any;
    onPersistenceChange: (v: boolean) => any;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
