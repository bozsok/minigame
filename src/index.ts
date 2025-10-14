// Egér Kaland a Kamrában - NPM Package Export
import * as Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import BootScene from './scenes/BootScene';

// Game configuration interface
export interface GameConfig {
  width?: number;
  height?: number;
  parent: string | HTMLElement;
  onGameComplete?: (stats: GameStats) => void;
  onGameStart?: () => void;
  onFullscreenRequest?: () => void;
}

// Game statistics interface
export interface GameStats {
  beansCollected: number;
  jarsFilled: number;
  timeRemaining: number;
  energyBonusUsed: number;
  completionTime: number;
}

// Main game class for NPM package
export class EgerKalandJatek {
  private game: Phaser.Game | null = null;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = {
      width: 860,
      height: 484,
      ...config
    };
  }

  // Initialize and start the game
  public start(): void {
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: this.config.width,
      height: this.config.height,
      parent: this.config.parent,
      scale: {
        mode: Phaser.Scale.NONE,
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
    if (this.config.onGameComplete) {
      this.game.events.on('game-completed', this.config.onGameComplete);
    }

    if (this.config.onGameStart) {
      this.game.events.on('game-started', this.config.onGameStart);
    }

    if (this.config.onFullscreenRequest) {
      this.game.events.on('fullscreen-request', this.config.onFullscreenRequest);
    }

    // Notify that game has started
    if (this.config.onGameStart) {
      this.config.onGameStart();
    }
  }

  // Stop and destroy the game
  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  // Get current game instance
  public getGame(): Phaser.Game | null {
    return this.game;
  }
}

// API hozzáadása fejlesztői környezethez (standalone játékhoz)
if (typeof window !== 'undefined') {
  // Import necessary modules for API
  import('./main').then(() => {
    // The main.ts will set up the EgerKalandAPI
    console.log('EgerKalandAPI loaded for development');
  }).catch(error => {
    console.warn('Could not load main module for API:', error);
  });
}

// Default export for easy importing
export default EgerKalandJatek;