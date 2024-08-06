import moment, { Moment } from 'moment-timezone';
import { Timescale } from './types';
export declare const useSelectionRange: (defaultValues: Moment[], timescale: Timescale) => [moment.Moment[], (newValue: Moment[]) => void];
