import { Moment } from 'moment-timezone';
import { Timescale } from './types';
export declare const useSelectionRange: (defaultValues: Moment[], timescale: Timescale) => [Moment[], (newValue: Moment[]) => void];
