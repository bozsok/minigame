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

// Bab rendszer típus definíciók
export interface BeanData {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  spawnTime: number;
}

export enum BeanState {
  SPAWNED = 'spawned',
  COLLECTED = 'collected',
  DESTROYED = 'destroyed'
}

export interface BeanConfig {
  maxBeansOnScreen: number;
  spawnInterval: number;
  beanSize: number;
  collisionRadius: number;
}

export interface JarPhase {
  phase: number;
  beansCollected: number;
  beansRequired: number;
  isComplete: boolean;
}