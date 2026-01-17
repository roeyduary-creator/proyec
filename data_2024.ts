import { Question } from './types';
import { DATA_CIRUGIA_2024 } from './2024_cirugia';
import { DATA_GINOBS_2024 } from './2024_gineco';
import { DATA_PEDIATRIA_2024 } from './2024_pediatria';
import { DATA_MEDINT_2024 } from './2024_interna';

export const DATA_2024: Question[] = [
  ...DATA_CIRUGIA_2024,
  ...DATA_GINOBS_2024,
  ...DATA_PEDIATRIA_2024,
  ...DATA_MEDINT_2024
];