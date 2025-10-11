/**
 * Esemény típusok definiálása a típusbiztonság érdekében
 */

// BeanCount UI frissítés esemény
export interface BeanCountUpdateEvent {
  totalBeans: number;
  beansInJar: number;
  jarPhase: number;
}

// Jar UI frissítés esemény
export interface JarUIUpdateEvent {
  currentJarIndex: number;
  currentJarBeans: number;
  totalBeans: number;
  allJarsFull: boolean;
}

// Jar highlight esemény
export interface JarHighlightEvent {
  jarIndex: number;
  message: string;
}

// Jar leadás esemény
export interface JarDeliveredEvent {
  jarIndex: number;
  totalJarsInPitcher: number;
}

// Jar fázis befejezés esemény
export interface JarPhaseCompletedEvent {
  phase: number;
  totalPhases: number;
}

// Jar befejezés esemény
export interface JarCompletedEvent {
  totalBeansCollected: number;
}

// Bean gyűjtés esemény
export interface BeanCollectionEvent {
  beanId: string;
}

// Sajt evés esemény
export interface CheeseEatenEvent {
  cheeseId: string;
  cheeseType: string;
  currentFrame: number;
  energyBonus: number;
}

// Resize esemény
export interface ResizeEvent {
  width: number;
  height: number;
}

// GameSize esemény
export interface GameSizeEvent {
  width: number;
  height: number;
}

// Drag and drop események
export interface DragDropEvent {
  x: number;
  y: number;
}

// Phaser események típusai
export interface PhaserResizeEvent {
  gameSize: GameSizeEvent;
  baseSize: GameSizeEvent;
  displaySize: GameSizeEvent;
  resolution: number;
}