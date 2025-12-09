export interface UserInput {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  question?: string;
}

export interface Planet {
  name: string;
  sign_id: number; // 1 = Aries, 12 = Pisces
  house: number; // 1-12
  is_retro: boolean;
}

export interface ChartData {
  ascendant: {
    sign_id: number;
    sign_name: string;
  };
  rashi: string;
  day: string;
  planets: Planet[];
}

export interface KundliResponse {
  markdown: string;
  chart_data: ChartData;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type TabView = 'CHART' | 'CHAT' | 'VISION';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type ImageSize = '1K' | '2K' | '4K';