import { Question } from './types';
import { DATA_2025 } from './data_2025';
import { DATA_2024 } from './data_2024';
import { DATA_2023 } from './data_2023';
import { DATA_2022 } from './data_2022';
import { DATA_2021 } from './data_2021';

export const INITIAL_DATA: Question[] = [
  ...DATA_2025,
  ...DATA_2024,
  ...DATA_2023,
  ...DATA_2022,
  ...DATA_2021,
];