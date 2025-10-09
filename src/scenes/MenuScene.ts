import * as Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    // Canvas pozicionálás felülre
    this.scale.canvas.style.position = 'absolute';
    this.scale.canvas.style.top = '0px';
    this.scale.canvas.style.left = '0px';

    // Háttér - teljes képernyős
    this.add.image(0, 0, 'pantry-bg').setOrigin(0, 0).setScale(860 / 1920, 484 / 1080);
  }
}