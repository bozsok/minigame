import * as Phaser from 'phaser';
import { FullscreenButton } from '../gameObjects/FullscreenButton';

export default class MenuScene extends Phaser.Scene {
  private fullscreenButton!: FullscreenButton;
  private background!: Phaser.GameObjects.Image;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    // Canvas pozicionálás felülre
    this.scale.canvas.style.position = 'absolute';
    this.scale.canvas.style.top = '0px';
    this.scale.canvas.style.left = '0px';

    // Háttér - dinamikus méretezés
    this.background = this.add.image(0, 0, 'pantry-bg');
    this.updateBackgroundSize(this.background);

    // Teljesképernyős gomb (jobb felső sarok)
    this.fullscreenButton = new FullscreenButton(this, 860 - 40, 40);
  }

  /**
   * Resize kezelés (FullscreenButton számára)
   */
  public handleResize(newWidth?: number, newHeight?: number): void {
    console.log(`=== MENUSCENE HANDLERESIZE ELINDULT ===`);
    console.log(`Paraméterek: newWidth=${newWidth}, newHeight=${newHeight}`);
    
    const gameWidth = newWidth || this.scale.width;
    const gameHeight = newHeight || this.scale.height;
    
    console.log(`MenuScene resize handler: ${gameWidth}x${gameHeight} (scale: ${this.scale.width}x${this.scale.height})`);
    
    // Háttér újra méretezése
    if (this.background) {
      console.log('MenuScene háttér frissítés kezdése...');
      this.updateBackgroundSizeWithDimensions(this.background, gameWidth, gameHeight);
      console.log('MenuScene háttér frissítés befejezve.');
    } else {
      console.log('HIBA: MenuScene háttér objektum nem található!');
    }
    
    console.log(`=== MENUSCENE HANDLERESIZE BEFEJEZVE ===`);
  }

  /**
   * Háttér méretének frissítése
   */
  private updateBackgroundSize(background: Phaser.GameObjects.Image): void {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    this.updateBackgroundSizeWithDimensions(background, gameWidth, gameHeight);
  }

  /**
   * Háttér méretének frissítése megadott méretekkel
   */
  private updateBackgroundSizeWithDimensions(background: Phaser.GameObjects.Image, gameWidth: number, gameHeight: number): void {
    console.log(`MenuScene háttér frissítés: ${gameWidth}x${gameHeight}`);
    
    // Eredeti kép méret lekérése
    const originalWidth = background.texture.source[0].width;
    const originalHeight = background.texture.source[0].height;
    
    console.log(`MenuScene eredeti háttér méret: ${originalWidth}x${originalHeight}`);
    
    // Háttér skálázása hogy fedje a teljes játékterületet (cover mode)
    const scaleX = gameWidth / originalWidth;
    const scaleY = gameHeight / originalHeight;
    const scale = Math.max(scaleX, scaleY);
    
    console.log(`MenuScene háttér skála: ${scale} (scaleX: ${scaleX}, scaleY: ${scaleY})`);
    
    background.setScale(scale);
    background.setPosition(gameWidth / 2, gameHeight / 2);
    background.setOrigin(0.5, 0.5);
    
    // Hátteret hátrahelyezzük hogy minden más előtte legyen
    background.setDepth(-1);
  }

  shutdown(): void {
    if (this.fullscreenButton) {
      this.fullscreenButton.destroy();
    }
  }
}