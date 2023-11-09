/// <reference types="react" />
type Props = {
    value?: string;
    onChange?: (...args: any[]) => any;
};
declare const TextField: (props: Props) => JSX.Element;
export default TextField;
