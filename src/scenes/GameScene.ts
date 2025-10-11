import * as Phaser from 'phaser';
import { BeanManager } from '../systems/BeanManager';
import { JarManager } from '../systems/JarManager';
import { CheeseManager } from '../systems/CheeseManager';
import { Pitcher } from '../gameObjects/Pitcher';
import { GameBalance } from '../config/GameBalance';
import { FullscreenButton } from '../gameObjects/FullscreenButton';

export default class GameScene extends Phaser.Scene {
  private beanManager!: BeanManager;
  private jarManager!: JarManager;
  private cheeseManager!: CheeseManager;
  private pitcher!: Pitcher;
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

    // JarManager inicializálása (5 üveg bal felső sarokban) - kezdetben láthatatlan
    this.jarManager = new JarManager(this);
    this.jarManager.setVisible(false); // Kezdetben láthatatlan

    // CheeseManager inicializálása (5 sajt különböző pozíciókban) - kezdetben láthatatlan
    this.cheeseManager = new CheeseManager(this);

    // Pitcher létrehozása (jobb alsó sarok) - kezdetben láthatatlan
    // Inicializáláskor alapértelmezett pozíció, később frissítjük
    this.pitcher = new Pitcher(this, 740, 364); // 860-120, 484-120
    this.pitcher.setVisible(false); // Kezdetben láthatatlan

    // Elemek skálázásának inicializálása
    this.updateGameElementsScale(this.scale.gameSize.width, this.scale.gameSize.height);

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
    // Bab számláló (jobb felső sarok)
    this.uiElements.beanCountText = this.add.text(860 - 20, 20, 'Babok: 0', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);

    // Aktív üveg állapot (középen felül)
    this.uiElements.jarPhaseText = this.add.text(430, 20, 'Aktív üveg: 1 (0/50 bab)', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0);

    // Egyszerűsített UI - üvegek vizuálisan láthatók a bal felső sarokban
  }

  /**
   * Esemény figyelők beállítása
   */
  private setupEventListeners(): void {
    // Context menu letiltása (jobb egérgomb funkciókhoz)
    this.input.mouse?.disableContextMenu();
    
    // Bab számláló frissítése (BeanManager-től)
    this.events.on('bean-count-updated', (data: any) => {
      this.updateBeanCountUI(data);
    });

    // Jar UI frissítés (JarManager-től)
    this.events.on('jar-ui-update', (data: any) => {
      this.updateJarUI(data);
    });

    // Jar highlight üzenet (villogás + útmutatás)
    this.events.on('jar-highlight', (data: any) => {
      this.handleJarHighlight(data);
    });

    // Minden üveg megtelt
    this.events.on('all-jars-full', () => {
      this.handleAllJarsFull();
    });

    // Üveg leadva a pitcher-be
    this.events.on('jar-delivered-to-pitcher', (data: any) => {
      this.handleJarDelivered(data);
    });

    // Minden üveg leadva - játék befejezve
    this.events.on('all-jars-delivered', () => {
      this.handleGameComplete();
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
    console.log('1 másodperces várakozás a babok és interaktív elemek megjelenése előtt...');
    
    // 1 másodperc várakozás majd minden egyszerre megjelenik
    setTimeout(() => {
      console.log('250 bab spawn-ja indul...');
      this.beanManager.spawnAllBeans();
      
      // Interaktív elemek megjelenítése (üvegek, korsó, sajtok)
      console.log('Interaktív elemek megjelenítése...');
      this.jarManager.setVisible(true);
      this.pitcher.setVisible(true);
      
      // Sajtok spawn-ja (5 sajt különböző pozíciókban)
      console.log('5 sajt spawn-ja...');
      this.cheeseManager.spawnCheeses();
      
      // Energia csökkentés indítása
      this.startEnergyCountdown();
      
    }, 1000); // 2000-ről 1000-re csökkentve
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

  private updateJarUI(data: any): void {
    if (this.uiElements.jarPhaseText) {
      const { currentJarIndex, currentJarBeans, allJarsFull } = data;
      
      if (allJarsFull) {
        this.uiElements.jarPhaseText.setText('Minden üveg tele! Zárd be és vidd a pitcher-be!');
        this.uiElements.jarPhaseText.setBackgroundColor('#FF9800'); // narancssárga
      } else {
        this.uiElements.jarPhaseText.setText(`Aktív üveg: ${currentJarIndex + 1} (${currentJarBeans}/50 bab)`);
        this.uiElements.jarPhaseText.setBackgroundColor('#4CAF50'); // zöld
      }
    }
  }

  private handleAllJarsFull(): void {
    console.log('GameScene: Minden üveg megtelt!');
    // Itt leállíthatnánk a bean spawn-t, de a BeanManager már kezeli
    // Üzenet megjelenítése a játékosnak
    if (this.uiElements.jarPhaseText) {
      this.uiElements.jarPhaseText.setText('Minden üveg tele! Dupla klikk → lezár → pitcher-be húz!');
      this.uiElements.jarPhaseText.setBackgroundColor('#FF5722'); // piros-narancssárga
    }
  }

  private handleJarDelivered(data: any): void {
    const { jarIndex, totalJarsInPitcher } = data;
    console.log(`GameScene: Jar ${jarIndex} leadva! Összesen: ${totalJarsInPitcher}/5`);
    
    // UI frissítése
    if (this.uiElements.jarPhaseText) {
      this.uiElements.jarPhaseText.setText(`Leadott üvegek: ${totalJarsInPitcher}/5`);
      this.uiElements.jarPhaseText.setBackgroundColor('#2196F3'); // kék
    }
  }

  private handleJarHighlight(data: any): void {
    const { jarIndex, message } = data;
    console.log(`GameScene: Jar ${jarIndex} highlight - ${message}`);
    
    // Csak console log - nincs UI üzenet változtatás
    // A villogás elég vizuális feedback
  }

  private handleGameComplete(): void {
    console.log('🎉 JÁTÉK BEFEJEZVE! Mind az 5 üveg leadva!');
    
    // Victory UI
    if (this.uiElements.jarPhaseText) {
      this.uiElements.jarPhaseText.setText('🎉 GYŐZELEM! Mind az 5 üveg leadva! 🎉');
      this.uiElements.jarPhaseText.setBackgroundColor('#4CAF50'); // zöld
    }

    // Játék logika leállítása
    this.beanManager.stopGame();
    
    // TODO: Victory screen vagy restart opció
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

    // Játék elemek skálázása és pozícionálása
    this.updateGameElementsScale(gameWidth, gameHeight);

    // Teljesképernyős gomb pozíciója már frissítve van a FullscreenButton-ban
  }

  /**
   * Játék elemek (üvegek, korsó) skálázása és pozícionálása
   * VALÓS ARÁNYOSÍTÁS: Fullscreen = natív méret, Ablakos = canvas arányosítás
   */
  private updateGameElementsScale(gameWidth: number, gameHeight: number): void {
    // Valós arányosítás: eredeti spawn canvas vs jelenlegi canvas
    const isFullscreen = gameWidth > 1200;
    
    let gameScale: number;
    if (isFullscreen) {
      gameScale = 1.0; // Fullscreen = natív méret
    } else {
      // Valós arányosítás: BeanManager-től kérjük el az eredeti méretet
      const originalWidth = this.beanManager ? this.beanManager.getOriginalCanvasWidth() : gameWidth;
      const originalHeight = this.beanManager ? this.beanManager.getOriginalCanvasHeight() : gameHeight;
      
      // Arányosítás a kisebb értékkel (hogy minden beleférjen)
      const scaleX = gameWidth / originalWidth;
      const scaleY = gameHeight / originalHeight;
      gameScale = Math.min(scaleX, scaleY);
    }
    
    console.log(`🎯 VALÓS ARÁNYOSÍTÁS - Játék elemek skálázása: ${gameScale.toFixed(3)} (${isFullscreen ? 'FULLSCREEN' : 'ABLAKOS'}) - ${gameWidth}x${gameHeight}`);

    // JarManager skálázása és újrapozícionálása
    if (this.jarManager) {
      this.jarManager.updateScale(gameScale, gameWidth, gameHeight);
    }

    // Pitcher skálázása és újrapozícionálása
    if (this.pitcher) {
      this.pitcher.updateScaleAndPosition(gameScale, gameWidth, gameHeight);
    }

    // Babok skálázása
    if (this.beanManager) {
      this.beanManager.updateScale(gameScale, gameWidth, gameHeight);
    }

    // Sajtok skálázása és pozicionálása (kivéve dev mode-ban)
    if (this.cheeseManager && !this.cheeseManager.isDevMode()) {
      this.cheeseManager.updateScale(gameScale, gameWidth, gameHeight);
    }
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