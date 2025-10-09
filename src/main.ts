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