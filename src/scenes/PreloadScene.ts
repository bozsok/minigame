import * as Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {

    
    // Háttér betöltése
    this.load.image('pantry-bg', 'assets/images/pantry-bg.jpg');

    // Sprite-ok betöltése  
    // beans.png sprite sheet betöltése (3 bab: 32x20px each, horizontally)
    this.load.spritesheet('beans', 'assets/images/beans.png', {
      frameWidth: 32,   // Egy bab szélessége
      frameHeight: 20   // Egy bab magassága
    });
    this.load.image('jar-body', 'assets/images/jar-body.png');
    this.load.image('jar-lid', 'assets/images/jar-lid.png');
    this.load.image('pitcher', 'assets/images/pitcher.png');

    // Sprite sheet-ek
    this.load.spritesheet('bean-growth', 'assets/images/bean-growth.png', {
      frameWidth: 68,  // Helyes méret
      frameHeight: 92, // Helyes méret
    });

    // Sajt sprite sheet-ek (5 frame horizontálisan egymás mellett)
    this.load.spritesheet('cheese-1', 'assets/images/cheese-1.png', {
      frameWidth: 234,   // CHEESE-1 frame szélessége
      frameHeight: 141   // CHEESE-1 frame magassága
    });
    this.load.spritesheet('cheese-2', 'assets/images/cheese-2.png', {
      frameWidth: 412,   // CHEESE-2 frame szélessége  
      frameHeight: 199   // CHEESE-2 frame magassága
    });
    this.load.spritesheet('cheese-3', 'assets/images/cheese-3.png', {
      frameWidth: 342,   // CHEESE-3 frame szélessége
      frameHeight: 104   // CHEESE-3 frame magassága
    });
    this.load.spritesheet('cheese-4', 'assets/images/cheese-4.png', {
      frameWidth: 178,   // CHEESE-4 frame szélessége
      frameHeight: 74    // CHEESE-4 frame magassága
    });
    this.load.spritesheet('cheese-5', 'assets/images/cheese-5.png', {
      frameWidth: 214,   // CHEESE-5 frame szélessége
      frameHeight: 119   // CHEESE-5 frame magassága
    });

    // Ütközési térkép
    this.load.image('pantry-collision', 'assets/images/pantry-collision.jpg');

    // Kurzor képek
    this.load.image('cursor-default', 'assets/images/cursor-default.png');
    this.load.image('cursor-eat', 'assets/images/cursor-eat.png');

    // Egyéb
    this.load.image('em', 'assets/images/em.png');
    this.load.image('tm', 'assets/images/tm.png');

    // Betöltés vége
    this.load.on('complete', () => {
      this.scene.start('MenuScene');
    });
  }

  create(): void {
    // Üres
  }
}