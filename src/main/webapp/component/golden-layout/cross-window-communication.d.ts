import type { GoldenLayoutViewProps } from './golden-layout.view';
export declare const GoldenLayoutWindowCommunicationEvents: {
    requestInitialState: string;
    consumeInitialState: string;
    consumeStateChange: string;
    consumePreferencesChange: string;
    consumeSubwindowLayoutChange: string;
    consumeNavigationChange: string;
    consumeWreqrEvent: string;
};
/**
 *  Overrides navigation functionality within subwindows of golden layout, so that navigation is handled by the main window.
 *
 *  Notice we do this as a component rather than a hook so we can override the same useHistory instance that the visualization is using.
 *  (we temporarily eject from react to use golden layout, and rewrap each visual in it's own instance of the various providers, like react router)
 *
 *  We could rewrite it as a hook and put it further down in the tree, but this is the same thing so no need.
 *
 *  Also notice we attach this at the visual level for that reason, rather than at the single golden layout instance level.
 */
export declare const UseSubwindowConsumeNavigationChange: ({ goldenLayout, }: {
    goldenLayout: any;
}) => null;
export declare const useCrossWindowGoldenLayoutCommunication: ({ goldenLayout, isInitialized, options, }: {
    goldenLayout: any;
    isInitialized: boolean;
    options: GoldenLayoutViewProps;
}) => void;
