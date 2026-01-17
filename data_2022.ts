import { Question } from './types';
import { DATA_CIRUGIA_2022 } from './2022_cirugia';
import { DATA_GINOBS_2022 } from './2022_gineco';
import { DATA_PEDIATRIA_2022 } from './2022_pediatria';
import { DATA_MEDINT_2022 } from './2022_interna';

export const DATA_2022: Question[] = [
  ...DATA_CIRUGIA_2022,
  ...DATA_GINOBS_2022,
  ...DATA_PEDIATRIA_2022,
  ...DATA_MEDINT_2022
];