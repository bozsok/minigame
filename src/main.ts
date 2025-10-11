import * as Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import { Logger } from './utils/Logger';
import { UIConstants } from './config/UIConstants';

const config: Phaser.Types.Core.GameConfig = {
  ...GameConfig,
  scene: [BootScene, PreloadScene, MenuScene, GameScene],
};

const game = new Phaser.Game(config);

Logger.info('Phaser játék elindítva!');

// Globális API a külső HTML gomboknak
(window as any).EgerKalandAPI = {
  startGame: async () => {
    Logger.info('=== KÜLSŐ PLAY GOMB API HÍVÁS ===');
    
    try {
      // 1. Átváltás GameScene-re
      const menuScene = game.scene.getScene('MenuScene') as MenuScene;
      if (menuScene) {
        Logger.debug('MenuScene → GameScene átváltás...');
        menuScene.scene.start('GameScene');
        
        // 2. GameScene startGame() metódusának meghívása
        setTimeout(() => {
          const gameScene = game.scene.getScene('GameScene') as GameScene;
          if (gameScene && gameScene.startGame) {
            Logger.debug('GameScene startGame() meghívása...');
            gameScene.startGame();
          }
        }, UIConstants.timings.sceneTransitionDelay);
      }
      
      // 2. Kis késleltetés majd teljesképernyős mód
      setTimeout(async () => {
        Logger.info('Automatikus teljesképernyős indítás...');
        
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
        
        Logger.info('Teljesképernyős mód aktiválva - játék kezdődhet!');
      }, UIConstants.timings.fullscreenDelay);
      
    } catch (error) {
      Logger.error('Játék indítás hiba:', error);
    }
  }
};

Logger.info('EgerKalandAPI elérhető a window.EgerKalandAPI-n keresztül');