// Bab rendszer specifikus típusok
export interface BeanSpawnPoint {
  x: number;
  y: number;
  isValid: boolean;
  lastSpawnTime: number;
}

export interface BeanCollectionEvent {
  beanId: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface BeanPoolConfig {
  initialSize: number;
  maxSize: number;
  expandBy: number;
}

export enum BeanAnimationState {
  IDLE = 'idle',
  SPAWN = 'spawn',
  COLLECT = 'collect',
  DESTROYED = 'destroyed'
}

export interface BeanPhysics {
  body: Phaser.Physics.Arcade.Body;
  collisionGroup: number;
  isCollectable: boolean;
}

export interface BeanCluster {
  center: { x: number, y: number };
  radius: number;
  positions: { x: number, y: number }[];
}