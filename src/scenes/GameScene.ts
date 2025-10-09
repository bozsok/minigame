import * as Phaser from 'phaser';
import { BeanManager } from '../systems/BeanManager';
import { GameBalance } from '../config/GameBalance';
import { FullscreenButton } from '../gameObjects/FullscreenButton';

export default class GameScene extends Phaser.Scene {
  private beanManager!: BeanManager;
  private fullscreenButton!: FullscreenButton;
  private background!: Phaser.GameObjects.Image;
  private gameStartTime: number = 0;
  private energyRemaining: number = GameBalance.energy.initialTime;
  private uiElements: {
    energyText?: Phaser.GameObjects.Text;
    beanCountText?: Phaser.GameObjects.Text;
    jarPhaseText?: Phaser.GameObjects.Text;
    instructionText?: Phaser.GameObjects.Text;
  } = {};

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.gameStartTime = Date.now();
    this.energyRemaining = GameBalance.energy.initialTime;

    // Háttér hozzáadása - dinamikus méretezés
    this.background = this.add.image(0, 0, 'pantry-bg');
    this.updateBackgroundSize(this.background);

    // Scale manager eseményeinek figyelése
    this.scale.on('resize', (gameSize: any, baseSize: any, displaySize: any, resolution: any) => {
      console.log('Phaser scale resize:', gameSize);
      this.handleResize();
    });

    // BeanManager inicializálása
    this.beanManager = new BeanManager(this);

    // Teljesképernyős gomb létrehozása (jobb felső sarok)
    this.fullscreenButton = new FullscreenButton(this, 860 - 40, 40);

    // UI elemek létrehozása
    this.createUI();

    // Esemény figyelők beállítása
    this.setupEventListeners();

    // Játék indítása
    this.startGame();

    console.log('GameScene létrehozva - Bab gyűjtés játék elindult!');
  }

  /**
   * UI elemek létrehozása
   */
  private createUI(): void {
    // Energia kijelző (bal felső sarok)
    this.uiElements.energyText = this.add.text(20, 20, `Energia: ${this.energyRemaining}s`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });

    // Bab számláló (jobb felső sarok)
    this.uiElements.beanCountText = this.add.text(860 - 20, 20, 'Babok: 0', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);

    // Üveg fázis kijelző (középen felül)
    this.uiElements.jarPhaseText = this.add.text(430, 20, 'Üveg fázis: 0/5', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0);

    // Minden felesleges UI elem eltávolítva - tiszta bab gyűjtő játék
  }

  /**
   * Esemény figyelők beállítása
   */
  private setupEventListeners(): void {
    // Bab számláló frissítése
    this.events.on('bean-count-updated', (data: any) => {
      this.updateBeanCountUI(data);
    });

    // Üveg fázis befejezés
    this.events.on('jar-phase-completed', (data: any) => {
      this.updateJarPhaseUI(data);
    });

    // Üveg befejezés
    this.events.on('jar-completed', (data: any) => {
      this.handleJarCompletion(data);
    });

    // Méretváltás kezelése
    this.events.on('resize', (data: any) => {
      this.resize(data);
    });
  }

  /**
   * Játék indítása
   */
  private startGame(): void {
    console.log('=== JÁTÉK INDÍTÁSA ===');
    console.log('2 másodperces várakozás a babok spawn-ja előtt...');
    
    // 2 másodperc várakozás majd 250 bab spawn-ja egyszerre
    setTimeout(() => {
      console.log('250 bab spawn-ja indul...');
      this.beanManager.spawnAllBeans();
      
      // Energia csökkentés indítása
      this.startEnergyCountdown();
      
    }, 2000);
  }

  /**
   * Energia számláló indítása
   */
  private startEnergyCountdown(): void {
    console.log('Energia számláló indítva...');
    // TODO: Implementálni az energia csökkentést
  }

  /**
   * Fő game loop
   */
  update(time: number, delta: number): void {
    // BeanManager frissítése
    this.beanManager.update(delta);

    // Energia kijelző frissítése (de nincs időkorlát!)
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - this.gameStartTime) / 1000);
    
    // UI frissítése (csak információs célból, nincs game over)
    this.updateEnergyUI(elapsedSeconds);
  }

  /**
   * UI frissítések - csak információs célból, nincs időkorlát
   */
  private updateEnergyUI(elapsedSeconds: number): void {
    if (this.uiElements.energyText) {
      // Eltelt időt mutatjuk, nem hátralevőt
      this.uiElements.energyText.setText(`Eltelt idő: ${elapsedSeconds}s`);
      this.uiElements.energyText.setBackgroundColor('#4CAF50'); // mindig zöld - nincs időnyomás
    }
  }

  private updateBeanCountUI(data: any): void {
    if (this.uiElements.beanCountText) {
      this.uiElements.beanCountText.setText(`Babok: ${data.totalBeans}`);
    }
  }

  private updateJarPhaseUI(data: any): void {
    if (this.uiElements.jarPhaseText) {
      this.uiElements.jarPhaseText.setText(`Üveg fázis: ${data.phase}/${GameBalance.jar.phasesPerJar}`);
    }

    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setText(`Fázis befejezve! (${data.phase}/${data.totalPhases})`);
      
      // 2 másodperc múlva visszaáll az eredeti szöveg
      setTimeout(() => {
        if (this.uiElements.instructionText) {
          this.uiElements.instructionText.setText('Kattints a babokra a gyűjtéshez!');
        }
      }, 2000);
    }
  }

  /**
   * Üveg befejezés kezelése
   */
  private handleJarCompletion(data: any): void {
    console.log('Üveg befejezve!', data);
    
    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setText('🎉 Üveg kész! Új üveg kezdődik!');
      this.uiElements.instructionText.setBackgroundColor('#4CAF50');
      
      setTimeout(() => {
        if (this.uiElements.instructionText) {
          this.uiElements.instructionText.setText('Kattints a babokra a gyűjtéshez!');
          this.uiElements.instructionText.setBackgroundColor('#2196F3');
        }
      }, 3000);
    }
  }

  /**
   * Játék vége - csak akkor hívjuk, ha minden bab összegyűjtve
   */
  private gameOver(): void {
    console.log('Minden bab összegyűjtve! Gratulálunk!');
    
    // Csak akkor hívjuk ha tényleg kész a játék (250 bab összegyűjtve)
    // BeanManager leállítása
    this.beanManager.cleanup();
    
    // Vissza a menübe
    this.scene.start('MenuScene');
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
    console.log(`Háttér frissítés: ${gameWidth}x${gameHeight}`);
    
    // Eredeti kép méret lekérése
    const originalWidth = background.texture.source[0].width;
    const originalHeight = background.texture.source[0].height;
    
    console.log(`Eredeti háttér méret: ${originalWidth}x${originalHeight}`);
    
    // Háttér skálázása hogy fedje a teljes játékterületet (cover mode)
    const scaleX = gameWidth / originalWidth;
    const scaleY = gameHeight / originalHeight;
    const scale = Math.max(scaleX, scaleY);
    
    console.log(`Háttér skála: ${scale} (scaleX: ${scaleX}, scaleY: ${scaleY})`);
    
    background.setScale(scale);
    background.setPosition(gameWidth / 2, gameHeight / 2);
    background.setOrigin(0.5, 0.5);
    
    // Hátteret hátrahelyezzük hogy minden más előtte legyen
    background.setDepth(-1);
  }

  /**
   * Phaser scale manager resize kezelése
   */
  public handleResize(newWidth?: number, newHeight?: number): void {
    console.log(`=== GAMESCENE HANDLERESIZE ELINDULT ===`);
    console.log(`Paraméterek: newWidth=${newWidth}, newHeight=${newHeight}`);
    
    const gameWidth = newWidth || this.scale.width;
    const gameHeight = newHeight || this.scale.height;
    
    console.log(`Phaser resize handler: ${gameWidth}x${gameHeight} (scale: ${this.scale.width}x${this.scale.height})`);
    
    // Háttér újra méretezése a megadott méretekkel
    if (this.background) {
      console.log('Háttér frissítés kezdése...');
      this.updateBackgroundSizeWithDimensions(this.background, gameWidth, gameHeight);
      console.log('Háttér frissítés befejezve.');
    } else {
      console.log('HIBA: Háttér objektum nem található!');
    }
    
    // UI elemek pozíciójának frissítése
    this.updateUIPositionsWithDimensions(gameWidth, gameHeight);
    console.log(`=== GAMESCENE HANDLERESIZE BEFEJEZVE ===`);
  }

  /**
   * Ablakméret változás kezelése (custom esemény)
   */
  resize(gameSize: Phaser.Structs.Size): void {
    console.log(`Custom resize: ${gameSize.width}x${gameSize.height}`);
    
    // Háttér újra méretezése
    if (this.background) {
      this.updateBackgroundSize(this.background);
    }
    
    // UI elemek pozíciójának frissítése
    this.updateUIPositions();
    
    // BeanManager spawn pontjainak frissítése (ha szükséges)
    if (this.beanManager) {
      // A BeanManager automatikusan frissíti a spawn pontokat a scene méret alapján
    }
  }

  /**
   * UI elemek pozíciójának frissítése
   */
  private updateUIPositions(): void {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    this.updateUIPositionsWithDimensions(gameWidth, gameHeight);
  }

  /**
   * UI elemek pozíciójának frissítése megadott méretekkel
   */
  private updateUIPositionsWithDimensions(gameWidth: number, gameHeight: number): void {
    console.log(`UI pozíciók frissítése: ${gameWidth}x${gameHeight}`);

    // Energia kijelző (bal felső sarok)
    if (this.uiElements.energyText) {
      this.uiElements.energyText.setPosition(20, 20);
    }

    // Bab számláló (jobb felső sarok)
    if (this.uiElements.beanCountText) {
      this.uiElements.beanCountText.setPosition(gameWidth - 20, 20);
    }

    // Üveg fázis kijelző (középen felül)
    if (this.uiElements.jarPhaseText) {
      this.uiElements.jarPhaseText.setPosition(gameWidth / 2, 20);
    }

    // Utasítás szöveg (lent középen)
    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setPosition(gameWidth / 2, gameHeight - 40);
    }

    // Teljesképernyős gomb pozíciója már frissítve van a FullscreenButton-ban
  }

  /**
   * Scene cleanup
   */
  shutdown(): void {
    if (this.beanManager) {
      this.beanManager.cleanup();
    }
    if (this.fullscreenButton) {
      this.fullscreenButton.destroy();
    }
    this.events.removeAllListeners();
  }
}