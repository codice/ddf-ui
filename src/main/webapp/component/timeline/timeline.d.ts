/// <reference types="react" />
import { Moment } from 'moment-timezone';
export type TimelineItem = {
    id: string;
    selected: boolean;
    data?: any;
    attributes: {
        [key: string]: Moment[];
    };
};
export interface TimelineProps {
    /**
     * Height in pixels.
     */
    height: number;
    /**
     * Mode that the timeline should be in.
     */
    mode?: 'single' | 'range';
    /**
     * Timezone to use when displaying times.
     */
    timezone: string;
    /**
     * Date format to use when displaying times.
     */
    format: string;
    /**
     * TimelineItem points
     */
    data?: TimelineItem[];
    /**
     * Alias Map for date attributes
     */
    dateAttributeAliases?: {
        [key: string]: string;
    };
    /**
     * Called when the done button is clicked, providing the current selection range.
     */
    onDone?: (selectionRange: Moment[]) => void;
    /**
     * Called when the a selection is made.
     */
    onSelect?: (data: TimelineItem[]) => void;
    /**
     * Render function for tooltips
     */
    renderTooltip?: (data: TimelineItem[]) => any;
    /**
     * Height offset to combat issues with dynamic heights when rendering the timeline.
     */
    heightOffset?: number;
    /**
     * Called when a date is copied to the clipboard.
     */
    onCopy?: (copiedValue: string) => void;
    /**
     * Minimum date bounds to render items between.
     */
    min?: Moment;
    /**
     * Maximum date bounds to render items between.
     */
    max?: Moment;
}
export declare const Timeline: (props: TimelineProps) => JSX.Element;
export default Timeline;
