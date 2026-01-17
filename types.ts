export interface Question {
  id: number;
  specialty: string;
  year: number;
  tema: string; // Anteriormente 'chapter'
  subtopic?: string;
  pregunta: string; // Anteriormente 'question'
  opciones: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  respuesta: string; // Anteriormente 'correctAnswer' (solo la letra)
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