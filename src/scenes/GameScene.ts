import * as Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create(): void {
    // Háttér hozzáadása
    this.add.image(400, 300, 'pantry-bg').setScale(0.5);

    // Ideiglenes szöveg a játék kezdetéhez
    const gameText = this.add.text(400, 300, 'Játék jelenet - Hamarosan elkészül!', {
      fontSize: '24px',
      color: '#000000',
    });
    gameText.setOrigin(0.5);

    // Vissza a menübe gomb
    const backButton = this.add.text(400, 400, 'Vissza a menübe', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { x: 10, y: 5 },
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}