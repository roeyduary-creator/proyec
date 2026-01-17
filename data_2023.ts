import { Question } from './types';
import { DATA_CIRUGIA_2023 } from './2023_cirugia';
import { DATA_GINOBS_2023 } from './2023_gineco';

export const DATA_2023: Question[] = [
  ...DATA_CIRUGIA_2023,
  ...DATA_GINOBS_2023,
];