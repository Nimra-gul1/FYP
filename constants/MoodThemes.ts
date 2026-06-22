export interface MoodTheme {
  id: string;
  label: string;
  colors: [string, string, string]; // bgGradient
  primary: string;
  accent: string;
  textDark: string;
  textDim: string;
}

export const MOOD_THEMES: MoodTheme[] = [
  {
    id: 'lavender',
    label: 'Lavender Dream',
    colors: ['#F3E8FF', '#D7BDE2', '#F5D5E0'],
    primary: '#9D50BB',
    accent: '#6E48AA',
    textDark: '#4A235A',
    textDim: '#884EA0',
  },
  {
    id: 'ocean',
    label: 'Ocean Calm',
    colors: ['#E0F7FA', '#B2EBF2', '#80DEEA'],
    primary: '#00838F',
    accent: '#006064',
    textDark: '#00363A',
    textDim: '#006064',
  },
  {
    id: 'pink',
    label: 'Rose Petal',
    colors: ['#FCE4EC', '#F8BBD0', '#F48FB1'],
    primary: '#E91E63',
    accent: '#C2185B',
    textDark: '#880E4F',
    textDim: '#AD1457',
  },
  {
    id: 'midnight',
    label: 'Midnight Soul',
    colors: ['#1A1A2E', '#16213E', '#2E004F'],
    primary: '#9D50BB',
    accent: '#E0C3FC',
    textDark: '#FFFFFF',
    textDim: '#B39DDB',
  },
  {
    id: 'forest',
    label: 'Forest Peace',
    colors: ['#E8F5E9', '#A5D6A7', '#E1F5FE'],
    primary: '#2E7D32',
    accent: '#1B5E20',
    textDark: '#1A332D',
    textDim: '#4E6B66',
  },
];
