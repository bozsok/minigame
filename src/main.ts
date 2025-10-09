import * as Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  ...GameConfig,
  scene: [BootScene, PreloadScene, MenuScene, GameScene],
};

const game = new Phaser.Game(config);

console.log('Phaser játék elindítva!');

// Globális API a külső HTML gomboknak
(window as any).EgerKalandAPI = {
  startGame: async () => {
    console.log('=== KÜLSŐ PLAY GOMB API HÍVÁS ===');
    
    try {
      // 1. Átváltás GameScene-re
      const menuScene = game.scene.getScene('MenuScene') as MenuScene;
      if (menuScene) {
        console.log('MenuScene → GameScene átváltás...');
        menuScene.scene.start('GameScene');
      }
      
      // 2. Kis késleltetés majd teljesképernyős mód
      setTimeout(async () => {
        console.log('Automatikus teljesképernyős indítás...');
        
        // Teljesképernyős mód aktiválása
        const gameContainer = document.getElementById('game-container');
        const element = gameContainer || document.documentElement;

        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
        
        console.log('Teljesképernyős mód aktiválva - játék kezdődhet!');
      }, 500);
      
    } catch (error) {
      console.error('Játék indítás hiba:', error);
    }
  }
};

console.log('EgerKalandAPI elérhető a window.EgerKalandAPI-n keresztül');