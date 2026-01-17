import { Question } from './types';
import { DATA_CIRUGIA_2021 } from './2021_cirugia';
import { DATA_GINOBS_2021 } from './2021_gineco';
import { DATA_PEDIATRIA_2021 } from './2021_pediatria';
import { DATA_MEDINT_2021 } from './2021_interna';

export const DATA_2021: Question[] = [
  ...DATA_CIRUGIA_2021,
  ...DATA_GINOBS_2021,
  ...DATA_PEDIATRIA_2021,
  ...DATA_MEDINT_2021
];