export interface GameState {
  level: number;
  score: number;
  timeRemaining: number;
  energy: number;
  jarsFilled: number;
  totalBeans: number;
}

export interface SaveData {
  highScore: number;
  totalPlayTime: number;
  achievements: string[];
}

export interface InputConfig {
  leftClickEnabled: boolean;
  rightClickEnabled: boolean;
  doubleClickEnabled: boolean;
  dragEnabled: boolean;
}