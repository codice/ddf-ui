/// <reference types="react" />
type Props = {
    coordinateValues: {
        dms: string;
        lat: string;
        lon: string;
        mgrs: string;
        utmUps: string;
    };
    closeParent: () => void;
};
declare const _default: (props: Props) => JSX.Element;
export default _default;
