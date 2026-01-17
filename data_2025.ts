import { Question } from './types';
import { DATA_CIRUGIA_2025 } from './2025_cirugia';
import { DATA_GINOBS_2025 } from './2025_gineco';
import { DATA_PEDIATRIA_2025 } from './2025_pediatria';
import { DATA_MEDINT_2025 } from './2025_interna';

export const DATA_2025: Question[] = [
  ...DATA_CIRUGIA_2025,
  ...DATA_GINOBS_2025,
  ...DATA_PEDIATRIA_2025,
  ...DATA_MEDINT_2025
];