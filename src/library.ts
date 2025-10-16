// Library export - clean, csak a szükséges exportok
import * as Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import BootScene from './scenes/BootScene';

// Global declarations
declare global {
  var EGER_KALAND_LIBRARY_MODE: boolean | undefined;
  var EGER_KALAND_CONFIG: GameConfig | undefined;
}

// Timer event data interface
export interface TimerEventData {
  timeRemaining: number;
  timeElapsed: number;
  formatted: string; // "04:35" format
  totalTime: number; // 300 (5 minutes)
}

// Game state event data interface  
export interface GameStateData {
  isActive: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  currentScene: string;
}

// Fullscreen event data interface
export interface FullscreenEventData {
  isFullscreen: boolean;
  timestamp: number;
  screenSize?: { width: number; height: number };
  windowSize?: { width: number; height: number };
}

// Game start event data interface
export interface GameStartEventData {
  timestamp: number;
  sceneType: string;
  gameMode: string;
}

// Game end event data interface  
export interface GameEndEventData {
  timestamp: number;
  reason: 'completed' | 'timeout' | 'energy-depleted' | 'stopped';
  jarsCompleted: number;
  beansCollected: number;
  timeRemaining: number;
  completionTime: number;
  energyRemaining: number;
}

// Jar delivered event data interface
export interface JarDeliveredEventData {
  jarIndex: number;
  timestamp: number;
  jarsDelivered: number;
  jarsRemaining: number;
  progressPercentage: number; // 0-100%
}

// Game configuration interface  
export interface GameConfig {
  width?: number;
  height?: number;
  parent: string | HTMLElement;
  onGameComplete?: (stats: GameStats) => void;
  onGameStart?: (data: GameStartEventData) => void;
  onGameEnd?: (data: GameEndEventData) => void;
  // Fullscreen kezelés kívülről
  onFullscreenRequest?: () => void;
  // Canvas kontroll módok
  allowFullscreen?: boolean;
  disableAutoScale?: boolean;
  
  // ✅ ÚJ: Timer Events - React szinkronizációhoz
  onTimerStart?: (data: TimerEventData) => void;
  onTimerUpdate?: (data: TimerEventData) => void;
  onTimerPause?: (data: TimerEventData) => void;
  onTimerResume?: (data: TimerEventData) => void;
  onTimerEnd?: (data: TimerEventData & { reason: 'timeout' | 'completed' | 'stopped' }) => void;
  
  // ✅ ÚJ: Game State Events - React állapot szinkronizációhoz  
  onGameStateChange?: (data: GameStateData) => void;
  onJarDelivered?: (data: JarDeliveredEventData) => void;
  onFullscreenEnter?: (data: FullscreenEventData) => void;
  onFullscreenExit?: (data: FullscreenEventData) => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
}

// Game statistics interface
export interface GameStats {
  beansCollected: number;
  jarsFilled: number;
  timeRemaining: number;
  energyBonusUsed: number;
  completionTime: number;
}

// Game state interface
export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentScene: string;
}

// Main game class for library usage
export class EgerKalandJatek {
  private game: Phaser.Game | null = null;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = {
      width: 860,
      height: 484,
      allowFullscreen: false, // Default: disabled for React
      disableAutoScale: false,
      ...config
    };
  }

  // Initialize and start the game
  public start(): void {
    // Set global configuration for scenes
    globalThis.EGER_KALAND_LIBRARY_MODE = true;
    globalThis.EGER_KALAND_CONFIG = this.config;
    
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: this.config.width,
      height: this.config.height,
      parent: this.config.parent,
      scale: {
        mode: this.config.disableAutoScale ? Phaser.Scale.NONE : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      backgroundColor: 'transparent',
      scene: [BootScene, PreloadScene, MenuScene, GameScene]
    };

    this.game = new Phaser.Game(phaserConfig);

    // Set up event listeners for communication
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.game) return;

    // Existing events (legacy compatibility)
    if (this.config.onGameComplete) {
      this.game.events.on('game-completed', this.config.onGameComplete);
    }

    if (this.config.onGameStart) {
      this.game.events.on('game-started', this.config.onGameStart);
    }

    if (this.config.onGameEnd) {
      this.game.events.on('game-ended', this.config.onGameEnd);
    }

    if (this.config.onFullscreenRequest) {
      this.game.events.on('fullscreen-request', this.config.onFullscreenRequest);
    }

    // ✅ NEW: Timer Events - for React synchronization
    if (this.config.onTimerStart) {
      this.game.events.on('timer-start', this.config.onTimerStart);
    }

    if (this.config.onTimerUpdate) {
      this.game.events.on('timer-update', this.config.onTimerUpdate);
    }

    if (this.config.onTimerPause) {
      this.game.events.on('timer-pause', this.config.onTimerPause);
    }

    if (this.config.onTimerResume) {
      this.game.events.on('timer-resume', this.config.onTimerResume);
    }

    if (this.config.onTimerEnd) {
      this.game.events.on('timer-end', this.config.onTimerEnd);
    }

    // ✅ NEW: Game State Events - for React UI synchronization
    if (this.config.onGameStateChange) {
      this.game.events.on('game-state-change', this.config.onGameStateChange);
    }

    if (this.config.onJarDelivered) {
      this.game.events.on('jar-delivered', this.config.onJarDelivered);
    }

    if (this.config.onFullscreenEnter) {
      this.game.events.on('fullscreen-enter', this.config.onFullscreenEnter);
    }

    if (this.config.onFullscreenExit) {
      this.game.events.on('fullscreen-exit', this.config.onFullscreenExit);
    }

    if (this.config.onGamePause) {
      this.game.events.on('game-pause', this.config.onGamePause);
    }

    if (this.config.onGameResume) {
      this.game.events.on('game-resume', this.config.onGameResume);
    }
  }

  // Game control methods
  
  /**
   * Start the actual game (transition from MenuScene to GameScene and begin gameplay)
   * Call this method when your external "Play" button is clicked
   */
  public startGame(): void {
    if (!this.game) {
      console.warn('EgerKalandJatek: Game not initialized, call start() first');
      return;
    }

    // 1. Switch to GameScene
    const menuScene = this.game.scene.getScene('MenuScene');
    if (menuScene) {
      menuScene.scene.start('GameScene');
      
      // 2. Call GameScene's startGame() after scene transition
      setTimeout(() => {
        const gameScene = this.game!.scene.getScene('GameScene') as any;
        if (gameScene && typeof gameScene.startGame === 'function') {
          gameScene.startGame();
        }
      }, 100); // Small delay for scene transition
    }
  }
  
  public pause(): void {
    if (this.game) {
      const activeScene = this.game.scene.getScenes(true)[0];
      if (activeScene) {
        this.game.scene.pause(activeScene.scene.key);
      }
    }
  }

  public resume(): void {
    if (this.game) {
      const activeScene = this.game.scene.getScenes(true)[0];
      if (activeScene) {
        this.game.scene.resume(activeScene.scene.key);
      }
    }
  }

  public restart(): void {
    if (this.game) {
      this.game.scene.start('MenuScene');
    }
  }

  // Get current game state
  public getState(): GameState {
    if (!this.game) {
      return {
        isRunning: false,
        isPaused: false,
        currentScene: 'none'
      };
    }

    const activeScenes = this.game.scene.getScenes(true);
    const activeScene = activeScenes.length > 0 ? activeScenes[0] : null;
    const isPaused = activeScene ? this.game.scene.isPaused(activeScene.scene.key) : false;
    
    return {
      isRunning: !!this.game,
      isPaused: isPaused,
      currentScene: activeScene ? activeScene.scene.key : 'unknown'
    };
  }

  // Stop the current game (emit game-ended event)
  public stopGame(): void {
    if (this.game) {
      // Emit game-ended event with 'stopped' reason
      this.game.events.emit('stop-game');
    }
  }

  // Stop and destroy the game
  public destroy(): void {
    if (this.game) {
      // Clean up global variables
      delete globalThis.EGER_KALAND_LIBRARY_MODE;
      delete globalThis.EGER_KALAND_CONFIG;
      
      this.game.destroy(true);
      this.game = null;
    }
  }

  // Get current game instance (for advanced usage)
  public getGame(): Phaser.Game | null {
    return this.game;
  }
}

// Default export for easy importing
export default EgerKalandJatek;