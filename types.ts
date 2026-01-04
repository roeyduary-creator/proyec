export interface Question {
  id: number;
  specialty: string;
  year: number;
  question: string;
  options: string[];
  correctAnswer: string;
  chapter: string;
  subtopic?: string;
}

export interface ChartStat {
  name: string;
  count: number;
  fill?: string;
}

export interface Theme {
  bg: string;
  text: string;
  textLight: string;
  accent: string;
  accentDark: string;
  white: string;
  cardShadow: string;
}