import * as Phaser from 'phaser';
import { BeanManager } from '../systems/BeanManager';
import { JarManager } from '../systems/JarManager';
import { CheeseManager } from '../systems/CheeseManager';
import { Pitcher } from '../gameObjects/Pitcher';
import { GameBalance } from '../config/GameBalance';
import { FullscreenButton } from '../gameObjects/FullscreenButton';
import { Logger } from '../utils/Logger';
import { UIConstants } from '../config/UIConstants';
import {
  BeanCountUpdateEvent,
  JarUIUpdateEvent,
  JarHighlightEvent,
  JarDeliveredEvent,
  CheeseEatenEvent,
  ResizeEvent,
  PhaserResizeEvent
} from '../types/EventTypes';

export default class GameScene extends Phaser.Scene {
  private beanManager!: BeanManager;
  private jarManager!: JarManager;
  private cheeseManager!: CheeseManager;
  private pitcher!: Pitcher;
  private fullscreenButton!: FullscreenButton;
  private background!: Phaser.GameObjects.Image;
  private gameStartTime: number = 0;
  private energyRemaining: number = GameBalance.energy.initialTime; // Másodpercben
  private energyPixels: number = UIConstants.energy.baseWidth; // Pixel alapú energia (120px = 60s)
  private energyLastUpdate: number = 0; // Utolsó energia frissítés időpontja
  private countdownTime: number = GameBalance.time.totalTime; // Konfigurációból olvassuk az időt
  private timerStarted: boolean = false; // Timer csak babok betöltése után indul
  private energyTimerStarted: boolean = false; // Energia timer indítása
  private gameActive: boolean = true; // Játék állapot követése
  private timerBackground!: Phaser.GameObjects.Graphics;
  private energyBackground!: Phaser.GameObjects.Image;
  private energyBar!: Phaser.GameObjects.Graphics; // Fogyó energia csík
  private uiElements: {
    energyText?: Phaser.GameObjects.Text;
    timerText?: Phaser.GameObjects.Text;
    instructionText?: Phaser.GameObjects.Text;
  } = {};

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.gameStartTime = Date.now();
    this.energyRemaining = GameBalance.energy.initialTime;
    this.energyPixels = UIConstants.energy.baseWidth; // Energia pixel reset teljes értékre
    this.energyTimerStarted = false; // Energia timer reset
    this.timerStarted = false; // Timer még nem indult el
    this.gameActive = true; // Játék állapot reset
    this.countdownTime = GameBalance.time.totalTime; // Timer reset

    // Natív cursor használata
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.style.cursor = 'default';
    }

    // Háttér hozzáadása - dinamikus méretezés
    this.background = this.add.image(0, 0, 'pantry-bg');
    this.updateBackgroundSize(this.background);

    // Scale manager eseményeinek figyelése
    this.scale.on('resize', (gameSize: PhaserResizeEvent, baseSize: any, displaySize: any, resolution: any) => {
      Logger.debug('Phaser scale resize:', gameSize);
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
    this.fullscreenButton = new FullscreenButton(this, 860 - UIConstants.positions.fullscreenButtonOffset, UIConstants.positions.fullscreenButtonOffset);

    // UI elemek létrehozása
    this.createUI();

    // Esemény figyelők beállítása
    this.setupEventListeners();

    Logger.info('GameScene létrehozva - Várakozás Play gomb megnyomására!');
  }

  /**
   * UI elemek létrehozása
   */
  private createUI(): void {
    // TISZTÍTÁS: Töröljük a korábbi timer objektumokat ha léteznek
    if (this.uiElements.timerText) {
      this.uiElements.timerText.destroy();
      this.uiElements.timerText = undefined;
    }
    if (this.timerBackground) {
      this.timerBackground.destroy();
      // this.timerBackground újra létre lesz hozva createTimerBackground()-ban
    }
    
    // Energia UI elemek tisztítása
    if (this.uiElements.energyText) {
      this.uiElements.energyText.destroy();
      this.uiElements.energyText = undefined;
    }
    if (this.energyBackground) {
      // Border objektum törlése ha létezik
      if ((this.energyBackground as any).border) {
        (this.energyBackground as any).border.destroy();
      }
      this.energyBackground.destroy();
      // this.energyBackground újra létre lesz hozva createEnergyBackground()-ban
    }
    
    // Időszámláló azonnal létrehozása REJTVE - betűtípus betöltéséhez
    this.createHiddenTimerElements();
    
    // Energia kijelző létrehozása REJTVE
    this.createHiddenEnergyElements();
  }

  /**
   * Rejtett időszámláló elemek létrehozása (scene indításakor - font már betöltött PreloadScene-ben)
   */
  private createHiddenTimerElements(): void {
    // Valós arányosítás számítása (mint a többi elem)
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isFullscreen = gameWidth > 1200;
    let gameScale: number;
    if (isFullscreen) {
      gameScale = 1.0; // Fullscreen = natív méret
    } else {
      // Ugyanaz az arányosítás mint a többi elemnél
      const originalWidth = this.beanManager ? this.beanManager.getOriginalCanvasWidth() : gameWidth;
      const originalHeight = this.beanManager ? this.beanManager.getOriginalCanvasHeight() : gameHeight;
      const scaleX = gameWidth / originalWidth;
      const scaleY = gameHeight / originalHeight;
      gameScale = Math.min(scaleX, scaleY);
    }
    
    // Font méret arányosítása (eredeti design: 42px)
    const baseFontSize = UIConstants.timer.baseFontSize;
    const baseStrokeThickness = UIConstants.timer.baseStrokeThickness;
    const fontSize = Math.round(baseFontSize * gameScale);
    const strokeThickness = Math.round(baseStrokeThickness * gameScale);
    
    // Időszámláló szöveg létrehozása REJTVE - BBH Sans Hegarty már elérhető
    this.uiElements.timerText = this.add.text(0, 0, '05:00', {
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontFamily: '"BBH Sans Hegarty", "Berlin Sans FB Demi", "Arial Black", Arial, sans-serif',
      stroke: UIConstants.colors.timerStroke,
      strokeThickness: strokeThickness
    }).setOrigin(0.5, 0.5);

    // Időszámláló háttér létrehozása REJTVE
    this.createTimerBackground();
    
    // REJTÉS - nem látható amíg a Play gomb meg nem nyomva
    this.uiElements.timerText.setVisible(false);
    this.timerBackground.setVisible(false);
    
    Logger.debug('⏰ Rejtett időszámláló elemek létrehozva - BBH Sans Hegarty (PreloadScene-ben előbetöltött)');
  }

  /**
   * Rejtett energia elemek létrehozása (scene indításakor)
   */
  private createHiddenEnergyElements(): void {
    // Energia háttér létrehozása REJTVE
    this.createEnergyBackground();
    
    // Energia csík létrehozása REJTVE
    this.createEnergyBar();
    
    // REJTÉS - nem látható amíg a Play gomb meg nem nyomva
    this.energyBackground.setVisible(false);
    this.energyBar.setVisible(false);
    
    Logger.debug('⚡ Rejtett energia elemek létrehozva');
  }

  /**
   * Időszámláló megjelenítése (babok spawn-ja után)
   */
  private showTimerElements(): void {
    if (this.uiElements.timerText && this.timerBackground) {
      // Elemek láthatóvá tétele
      this.uiElements.timerText.setVisible(true);
      this.timerBackground.setVisible(true);
      
      // Timer indítása
      this.timerStarted = true;
      this.gameStartTime = Date.now();
      this.countdownTime = GameBalance.time.totalTime; // Konfigurációból olvassuk az időt
      
      // AZONNAL beállítjuk a kezdő szöveget
      this.updateTimerUI();
      
      // Pozíció újraszámítása
      this.updateTimerPosition(this.scale.width);
      
      Logger.debug('⏰ Időszámláló megjelenítve és elindítva - azonnal 05:00 szöveggel');
    }
  }

  /**
   * Időszámláló háttér létrehozása
   */
  private createTimerBackground(): void {
    // Pozíció számítás - fullscreen gomb bal oldala mellett, 10px távolság
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // Valós arányosítás számítása (mint a többi elem)
    const isFullscreen = gameWidth > 1200;
    let gameScale: number;
    if (isFullscreen) {
      gameScale = 1.0; // Fullscreen = natív méret
    } else {
      // Ugyanaz az arányosítás mint a többi elemnél
      const originalWidth = this.beanManager ? this.beanManager.getOriginalCanvasWidth() : gameWidth;
      const originalHeight = this.beanManager ? this.beanManager.getOriginalCanvasHeight() : gameHeight;
      const scaleX = gameWidth / originalWidth;
      const scaleY = gameHeight / originalHeight;
      gameScale = Math.min(scaleX, scaleY);
    }
    
    // Timer méretei (eredeti design) * arányosítási faktor
    const baseTimerWidth = UIConstants.timer.baseWidth;
    const baseTimerHeight = UIConstants.timer.baseHeight;
    const timerWidth = baseTimerWidth * gameScale;
    const timerHeight = baseTimerHeight * gameScale;
    
    const fullscreenButtonX = gameWidth - UIConstants.positions.fullscreenButtonOffset;
    const timerX = fullscreenButtonX - UIConstants.positions.fullscreenButtonOffset - timerWidth - UIConstants.positions.timerOffsetFromButton;
    const timerY = UIConstants.positions.energyOffset;

    // Graphics objektum létrehozása
    this.timerBackground = this.add.graphics();
    
    // Border és lekerekítés arányosítása
    const baseBorderWidth = UIConstants.timer.baseBorderWidth;
    const baseCornerRadius = UIConstants.timer.baseCornerRadius;
    const borderWidth = Math.round(baseBorderWidth * gameScale);
    const cornerRadius = Math.round(baseCornerRadius * gameScale);
    
    // Border rajzolása (#3ba4c2 szín, arányosított vastagság)
    this.timerBackground.lineStyle(borderWidth, parseInt(UIConstants.colors.timerBorder.replace('#', '0x')));
    this.timerBackground.fillStyle(0x000000); // Fekete kitöltés
    
    // Lekerekített téglalap - arányosított lekerekítés
    this.timerBackground.fillRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);
    this.timerBackground.strokeRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);

    // Timer szöveg pozícionálása a téglalap közepére
    if (this.uiElements.timerText) {
      this.uiElements.timerText.setPosition(timerX + timerWidth / 2, timerY + timerHeight / 2);
      Logger.debug(`⏰ Timer szöveg pozícionálva: (${timerX + timerWidth / 2}, ${timerY + timerHeight / 2})`);
    }
  }

  /**
   * Energia háttér létrehozása
   */
  private createEnergyBackground(): void {
    // Fekete háttér az energia csík alá - ez mindig látszik
    this.energyBackground = this.add.image(0, 0, '__BLACK');
    this.energyBackground.setDisplaySize(UIConstants.energy.baseWidth, UIConstants.energy.baseHeight);
    this.energyBackground.setOrigin(0, 0);
    this.energyBackground.setDepth(9999);
    
    // Border létrehozása külön Graphics objektummal
    const border = this.add.graphics();
    border.lineStyle(UIConstants.energy.baseBorderWidth, parseInt(UIConstants.energy.borderColor.replace('#', '0x')));
    border.strokeRect(0, 0, UIConstants.energy.baseWidth, UIConstants.energy.baseHeight);
    border.setDepth(10001); // A színátmenet felett
    
    // Border referencia tárolása cleanup-hoz
    (this.energyBackground as any).border = border;
  }

  /**
   * Energia csík létrehozása (maszk a háttér gradient-hez)
   */
  private createEnergyBar(): void {
    // Graphics objektum létrehozása - ez fogja rajzolni a színátmenetet
    this.energyBar = this.add.graphics();
    
    // Kezdeti színátmenetes energia csík rajzolása
    this.updateEnergyBarMask(this.energyPixels);
    
    // Magasabb depth, mint a fekete háttér
    this.energyBar.setDepth(10000);
  }

  /**
   * Színinterpoláció segédfüggvény (Piros → Sárga → Zöld)
   */
  private interpolateEnergyColor(ratio: number): number {
    // ratio: 0.0 = üres (piros), 1.0 = tele (zöld)
    
    if (ratio <= 0.5) {
      // Első fél: Piros (FF0000) → Sárga (FFFF00)
      const localRatio = ratio * 2; // 0..1 tartománybe
      const r = 255;
      const g = Math.floor(255 * localRatio);
      const b = 0;
      return (r << 16) | (g << 8) | b;
    } else {
      // Második fél: Sárga (FFFF00) → Zöld (00FF00)
      const localRatio = (ratio - 0.5) * 2; // 0..1 tartománybe
      const r = Math.floor(255 * (1 - localRatio));
      const g = 255;
      const b = 0;
      return (r << 16) | (g << 8) | b;
    }
  }

  /**
   * Energia csík színátmenetes rajzolása
   */
  private updateEnergyBarMask(width: number): void {
    this.energyBar.clear();
    
    // Színátmenetes energia csík rajzolása pixelenként
    const maxWidth = UIConstants.energy.baseWidth;
    const height = UIConstants.energy.baseHeight;
    
    for (let x = 0; x < width; x++) {
      const ratio = x / maxWidth; // 0..1 arány
      const color = this.interpolateEnergyColor(ratio);
      
      this.energyBar.fillStyle(color);
      this.energyBar.fillRect(x, 0, 1, height);
    }
  }

  /**
   * Energia kijelző megjelenítése (játék indításakor)
   */
  private showEnergyElements(): void {
    if (this.energyBackground && this.energyBar) {
      // Elemek láthatóvá tétele
      this.energyBackground.setVisible(true);
      this.energyBar.setVisible(true);
      
      // Energia timer indítása
      this.energyTimerStarted = true;
      this.energyLastUpdate = Date.now();
      
      // Energia UI kezdeti frissítése (teljes energia csík)
      this.updateEnergyUI();
      
      // Egermozgás figyelés beállítása
      this.setupEnergyCursorTracking();
      
      Logger.debug('⚡ Energia kijelző megjelenítve és elindítva');
    }
  }

  /**
   * Energia csík követése az egérkurzorral
   */
  private setupEnergyCursorTracking(): void {
    // Egermozgás esemény figyelése
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.energyBackground && this.energyBar) {
        // Pozíció frissítése az egérkurzorhoz képest
        const x = pointer.x - UIConstants.energy.baseWidth / 2;
        const y = pointer.y - UIConstants.energy.cursorOffset;
        
        this.energyBackground.setPosition(x, y);
        this.energyBar.setPosition(x, y);
        
        // Border is mozgatása
        if ((this.energyBackground as any).border) {
          (this.energyBackground as any).border.setPosition(x, y);
        }
      }
    });
  }

  /**
   * Időszámláló pozíció frissítése (responsive)
   */
  private updateTimerPosition(gameWidth: number): void {
    const gameHeight = this.scale.height;
    
    // Valós arányosítás számítása (mint a többi elem)
    const isFullscreen = gameWidth > 1200;
    let gameScale: number;
    if (isFullscreen) {
      gameScale = 1.0; // Fullscreen = natív méret
    } else {
      // Ugyanaz az arányosítás mint a többi elemnél
      const originalWidth = this.beanManager ? this.beanManager.getOriginalCanvasWidth() : gameWidth;
      const originalHeight = this.beanManager ? this.beanManager.getOriginalCanvasHeight() : gameHeight;
      const scaleX = gameWidth / originalWidth;
      const scaleY = gameHeight / originalHeight;
      gameScale = Math.min(scaleX, scaleY);
    }
    
    // Timer méretei (eredeti design) * arányosítási faktor
    const baseTimerWidth = UIConstants.timer.baseWidth;
    const baseTimerHeight = UIConstants.timer.baseHeight;
    const timerWidth = baseTimerWidth * gameScale;
    const timerHeight = baseTimerHeight * gameScale;
    
    const fullscreenButtonX = gameWidth - UIConstants.positions.fullscreenButtonOffset;
    const timerX = fullscreenButtonX - UIConstants.positions.fullscreenButtonOffset - timerWidth - UIConstants.positions.timerOffsetFromButton;
    const timerY = UIConstants.positions.energyOffset;

    // Graphics háttér frissítése
    if (this.timerBackground) {
      this.timerBackground.clear();
      
      // Border és lekerekítés arányosítása
      const baseBorderWidth = UIConstants.timer.baseBorderWidth;
      const baseCornerRadius = UIConstants.timer.baseCornerRadius;
      const borderWidth = Math.round(baseBorderWidth * gameScale);
      const cornerRadius = Math.round(baseCornerRadius * gameScale);
      
      this.timerBackground.lineStyle(borderWidth, parseInt(UIConstants.colors.timerBorder.replace('#', '0x')));
      this.timerBackground.fillStyle(0x000000);
      this.timerBackground.fillRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);
      this.timerBackground.strokeRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);
    }

    // Timer szöveg pozíció frissítése
    if (this.uiElements.timerText) {
      this.uiElements.timerText.setPosition(timerX + timerWidth / 2, timerY + timerHeight / 2);
    }
  }

  /**
   * Font betöltés várakozás - specifikus BBH Sans Hegarty ellenőrzés
   */
  private waitForFontLoad(): Promise<void> {
    return new Promise((resolve) => {
      // Specifikus font ellenőrzés
      if ('fonts' in document && document.fonts.check) {
        const checkFont = () => {
          const fontLoaded = document.fonts.check('44px "BBH Sans Hegarty"');
          if (fontLoaded) {
            Logger.debug('⏰ BBH Sans Hegarty font specifikusan betöltve és elérhető');
            resolve();
          } else {
            Logger.debug('⏰ BBH Sans Hegarty még nem elérhető, újrapróbálkozás...');
            setTimeout(checkFont, UIConstants.timings.fontCheckInterval);
          }
        };
        
        // Első ellenőrzés
        checkFont();
        
        // Biztonsági timeout 2 másodperc után
        setTimeout(() => {
          Logger.warn('⏰ Font timeout - folytatás fallback fonttal');
          resolve();
        }, UIConstants.timings.fontTimeout);
      } else {
        // Fallback - 800ms várakozás
        setTimeout(() => {
          Logger.debug('⏰ Font várakozás fallback (800ms)');
          resolve();
        }, UIConstants.timings.fontFallbackTimeout);
      }
    });
  }

  /**
   * Font beállítás biztosítása - explicit font alkalmazás
   */
  private ensureCorrectFont(): void {
    if (this.uiElements.timerText) {
      // Explicit setStyle hívás a font biztosításához
      this.uiElements.timerText.setStyle({
        fontSize: '44px',
        color: '#ffffff',
        fontFamily: '"BBH Sans Hegarty", "Berlin Sans FB Demi", "Arial Black", Arial, sans-serif',
        stroke: UIConstants.colors.timerStroke,
        strokeThickness: 4
      });
      
      // Kényszerített szöveg frissítés a font alkalmazásához
      const currentText = this.uiElements.timerText.text;
      this.uiElements.timerText.setText('');
      this.uiElements.timerText.setText(currentText);
      
      Logger.debug('⏰ Font explicit beállítás és szöveg frissítés végrehajtva');
    }
  }

  /**
   * Esemény figyelők beállítása
   */
  private setupEventListeners(): void {
    // Context menu letiltása (jobb egérgomb funkciókhoz)
    this.input.mouse?.disableContextMenu();
    
    // Bab számláló frissítése (BeanManager-től)
    this.events.on('bean-count-updated', (data: BeanCountUpdateEvent) => {
      this.updateBeanCountUI(data);
    });

    // Jar UI frissítés (JarManager-től)
    this.events.on('jar-ui-update', (data: JarUIUpdateEvent) => {
      this.updateJarUI(data);
    });

    // Jar highlight üzenet (villogás + útmutatás)
    this.events.on('jar-highlight', (data: JarHighlightEvent) => {
      this.handleJarHighlight(data);
    });

    // Minden üveg megtelt
    this.events.on('all-jars-full', () => {
      this.handleAllJarsFull();
    });

    // Üveg leadva a pitcher-be
    this.events.on('jar-delivered-to-pitcher', (data: JarDeliveredEvent) => {
      this.handleJarDelivered(data);
    });

    // Minden üveg leadva - játék befejezve
    this.events.on('all-jars-delivered', () => {
      this.handleGameComplete();
    });

    // Sajt evés energia bonus
    this.events.on('cheese-eaten', (data: CheeseEatenEvent) => {
      Logger.info(`🧀 CHEESE-EATEN EVENT FOGADVA: ${data.cheeseType} sajt, frame: ${data.currentFrame}, energyTimerStarted: ${this.energyTimerStarted}`);
      this.addEnergyBonus();
    });

    // Méretváltás kezelése
    this.events.on('resize', (data: ResizeEvent) => {
      this.resize(data);
    });
  }

  /**
   * Játék indítása
   */
  public startGame(): void {
    Logger.info('=== JÁTÉK INDÍTÁSA ===');
    Logger.info('1 másodperces várakozás a babok és interaktív elemek megjelenése előtt...');
    
    // 1 másodperc várakozás majd minden egyszerre megjelenik
    setTimeout(() => {
      Logger.info('250 bab spawn-ja indul...');
      this.beanManager.spawnAllBeans();
      
      // Interaktív elemek megjelenítése (üvegek, korsó, sajtok)
      Logger.debug('Interaktív elemek megjelenítése...');
      this.jarManager.setVisible(true);
      this.pitcher.setVisible(true);
      
      // Sajtok spawn-ja (5 sajt különböző pozíciókban)
      Logger.info('5 sajt spawn-ja...');
      this.cheeseManager.spawnCheeses();
      
      // Energia csökkentés indítása
      this.startEnergyCountdown();
      
      // ENERGIA KIJELZŐ MEGJELENÍTÉSE
      this.showEnergyElements();
      
      // IDŐSZÁMLÁLÓ MEGJELENÍTÉSE ÉS INDÍTÁSA - babok betöltése után
      Logger.info('⏰ Időszámláló megjelenítése és indítása - 5 perc visszaszámlálás!');
      this.showTimerElements();
      
    }, UIConstants.timings.gameStartDelay);
  }

  /**
   * Energia számláló indítása
   */
  private startEnergyCountdown(): void {
    Logger.debug('Energia számláló indítva...');
    // ENERGIA RENDSZER: Implementálva - energia csökkenés idővel
    // A játékosnak van energiája, ami csökken másodpercenként
    // Sajt evés esetén bonus idő jár
  }

  /**
   * Fő game loop
   */
  update(time: number, delta: number): void {
    // BeanManager frissítése
    this.beanManager.update(delta);

    // Időszámláló logika frissítése - csak ha elindult és a játék aktív
    if (this.timerStarted && this.uiElements.timerText && this.gameActive) {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - this.gameStartTime) / 1000);
      const newCountdownTime = Math.max(0, GameBalance.time.totalTime - elapsedSeconds); // Konfigurációból olvassuk az időt
      
      // Timer UI frissítése ha változott az idő
      if (newCountdownTime !== this.countdownTime) {
        this.countdownTime = newCountdownTime;
        this.updateTimerUI();
        
        // Debug minden másodpercben
        Logger.debug(`⏰ Timer update: ${this.countdownTime}s (elapsed: ${elapsedSeconds}s)`);
      }
      
      // Időtúllépés ellenőrzés (game over) - csak egyszer hívjuk meg
      if (this.countdownTime <= 0 && this.timerStarted) {
        this.timerStarted = false; // Leállítjuk a timer logikáját
        this.handleTimeUp();
      }
    } else if (this.timerStarted && !this.gameActive) {
      // Ha a játék inaktív, de a timer még fut, állítsuk le
      Logger.debug('⏰ Timer leállítva játék inaktivitás miatt');
      this.timerStarted = false;
    }

    // Energia logika frissítése - csak ha elindult és a játék aktív
    if (this.energyTimerStarted && this.energyPixels > 0 && this.gameActive) {
      const currentTime = Date.now();
      const deltaTime = (currentTime - this.energyLastUpdate) / 1000; // másodpercben
      
      // Pixel alapú fogyás: 2px/mp
      const pixelsToConsume = Math.floor(deltaTime * UIConstants.energy.consumptionRate);
      
      if (pixelsToConsume > 0) {
        this.energyPixels = Math.max(0, this.energyPixels - pixelsToConsume);
        this.energyRemaining = Math.max(0, this.energyPixels / UIConstants.energy.consumptionRate); // Visszaszámítás másodpercre
        this.energyLastUpdate = currentTime;
        
        this.updateEnergyUI();
        
        // Energia elfogyása ellenőrzése
        if (this.energyPixels <= 0) {
          this.handleEnergyDepleted();
        }
      }
    }
  }

  /**
   * Időszámláló UI frissítése (MM:SS formátum)
   */
  private updateTimerUI(): void {
    if (!this.uiElements.timerText) {
      Logger.warn('⚠️ Timer text nem létezik - skipeljük frissítést!');
      return;
    }
    
    // EXTRA VÉDELEM: Ellenőrizzük, hogy a Phaser objektum valóban működőképes-e
    try {
      // Teszteljük, hogy az objektum még mindig valid-e
      if (!this.uiElements.timerText.scene || this.uiElements.timerText.scene !== this) {
        Logger.warn('⚠️ Timer text scene invalid - újralétrehozzuk!');
        this.createHiddenTimerElements();
        return;
      }
    } catch (error) {
      Logger.warn('⚠️ Timer text corrupt, újralétrehozzuk:', error);
      this.createHiddenTimerElements();
      return;
    }

    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Valós arányosítás számítása (mint a többi elem)
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isFullscreen = gameWidth > 1200;
    let gameScale: number;
    if (isFullscreen) {
      gameScale = 1.0; // Fullscreen = natív méret
    } else {
      // Ugyanaz az arányosítás mint a többi elemnél
      const originalWidth = this.beanManager ? this.beanManager.getOriginalCanvasWidth() : gameWidth;
      const originalHeight = this.beanManager ? this.beanManager.getOriginalCanvasHeight() : gameHeight;
      const scaleX = gameWidth / originalWidth;
      const scaleY = gameHeight / originalHeight;
      gameScale = Math.min(scaleX, scaleY);
    }
    
    // Font méret arányosítása (eredeti design: 42px)
    const baseFontSize = UIConstants.timer.baseFontSize;
    const baseStrokeThickness = UIConstants.timer.baseStrokeThickness;
    const fontSize = Math.round(baseFontSize * gameScale);
    const strokeThickness = Math.round(baseStrokeThickness * gameScale);
    
    // BIZTONSÁGOS szöveg és stílus beállítása try-catch-el
    try {
      this.uiElements.timerText.setText(timeString);
      this.uiElements.timerText.setStyle({
        fontSize: `${fontSize}px`,
        fontFamily: '"BBH Sans Hegarty", "Berlin Sans FB Demi", "Arial Black", Arial, sans-serif',
        stroke: UIConstants.colors.timerStroke,
        strokeThickness: strokeThickness
      });
      
      // Egyszerű színbeállítás
      if (this.countdownTime <= UIConstants.thresholds.timerRedThreshold) {
        this.uiElements.timerText.setColor(UIConstants.colors.timerRed);
      } else if (this.countdownTime <= UIConstants.thresholds.timerOrangeThreshold) {
        this.uiElements.timerText.setColor(UIConstants.colors.timerOrange);
      } else {
        this.uiElements.timerText.setColor(UIConstants.colors.timerWhite);
      }
    } catch (error) {
      Logger.error('⚠️ KRITIKUS: Timer text frissítés hiba - újralétrehozzuk!', error);
      // Újralétrehozzuk a timer objektumot
      this.createHiddenTimerElements();
      return; // Ne folytassuk a frissítést
    }

    // Biztosítjuk, hogy látható legyen (de csak ha a timer indítás megtörtént)
    // FONTOS: Ez NEM kontrollálja a timer megjelenését, csak a visible objektum frissítését!
    if (this.uiElements.timerText.visible) {
      this.uiElements.timerText.setAlpha(1);
      this.uiElements.timerText.setDepth(1000); // Legfelülre
    }

    // Debug minden frissítésnél (első 10 másodpercben)
    if (this.countdownTime >= GameBalance.time.totalTime - UIConstants.thresholds.timerDebugRange) {
      Logger.debug(`⏰ Timer frissítve: "${timeString}" (${this.countdownTime}s maradt)`);
      Logger.debug(`⏰ Text pos: (${this.uiElements.timerText.x}, ${this.uiElements.timerText.y})`);
      Logger.debug(`⏰ Text visible: ${this.uiElements.timerText.visible}, alpha: ${this.uiElements.timerText.alpha}`);
    }
  }

  /**
   * Időtúllépés kezelése
   */
  private handleTimeUp(): void {
    Logger.warn('⏰ IDŐ LEJÁRT! Játék megáll, elemek látva maradnak!');
    
    // Játék logika leállítása (de elemek látva maradnak)
    this.beanManager.stopGame();
    
    // Piros körvonal hozzáadása a maradék babokhoz
    this.beanManager.highlightRemainingBeans();
    
    // MINDEN INTERAKCIÓ LETILTÁSA
    this.disableAllInteractions();
    
    // Timer 00:00-n marad, semmi nem tűnik el
    // Játékos szabadon nézheti a maradék elemeket
    // Visszatérés: ablakos mód gomb → MenuScene
    Logger.info('⏰ Játék befagyasztva - ablakos mód gombbal lehet visszatérni');
  }

  /**
   * Minden interakció letiltása (idő lejárt vagy játék befejezve)
   */
  private disableAllInteractions(): void {
    Logger.debug('🚫 Minden interakció letiltása - játék vége');
    
    // CheeseManager letiltása
    if (this.cheeseManager) {
      this.cheeseManager.setGameActive(false);
    }
    
    // JarManager letiltása  
    if (this.jarManager) {
      this.jarManager.setGameActive(false);
    }
    
    Logger.debug('🚫 Minden interakció letiltva - sajt evés és jar műveletek tiltva');
  }

  /**
   * Energia UI frissítése
   */
  private updateEnergyUI(): void {
    if (this.energyBar) {
      // Színátmenetes energia csík frissítése
      this.updateEnergyBarMask(this.energyPixels);
    }
  }

  /**
   * Energia elfogyásának kezelése
   */
  private handleEnergyDepleted(): void {
    Logger.warn('⚡ ENERGIA ELFogyott! Game over - csak 1x piros glow!');
    
    // Energia timer leállítása
    this.energyTimerStarted = false;
    
    // Timer leállítása (ne számoljon tovább)
    this.timerStarted = false;
    
    // Babok interakciójának LEÁLLÍTSA - de a többi elem működjön
    this.beanManager.stopGame();
    
    // Piros körvonal hozzáadása a maradék babokhoz (csak 1x)
    this.beanManager.highlightRemainingBeans();
    
    // CSAK bab interakciót tiltjuk le, sajt evés továbbra működik
    if (this.jarManager) {
      this.jarManager.setGameActive(false);
    }
    
    Logger.info('⚡ Babok interakciója leállítva - sajt evés továbbra működik');
  }

  /**
   * Sajt evés bonus hozzáadása az energiához
   */
  public addEnergyBonus(): void {
    // Csak akkor adunk bonuszt, ha az energia timer még fut (tehát NEM game over)
    if (this.energyTimerStarted) {
      const bonusSeconds = GameBalance.energy.cheeseBonus;
      const bonusPixels = bonusSeconds * UIConstants.energy.consumptionRate; // 15s * 2px/s = 30px
      
      // Ellenőrizzük, hogy van-e hely a bonusznak
      const newEnergyPixels = Math.min(UIConstants.energy.baseWidth, this.energyPixels + bonusPixels);
      
      if (newEnergyPixels > this.energyPixels) {
        // Valóban növekedett az energia
        const actualBonus = newEnergyPixels - this.energyPixels;
        this.energyPixels = newEnergyPixels;
        this.energyRemaining = this.energyPixels / UIConstants.energy.consumptionRate; // Visszaszámítás másodpercre
        
        Logger.info(`⚡ Sajt evés bonus: +${bonusSeconds}s energia (+${actualBonus}px, új összesen: ${Math.floor(this.energyRemaining)}s)`);
        
        // UI frissítése
        this.updateEnergyUI();
        
        // Bonus effekt - zöld felvillanás
        if (this.energyBar) {
          // Zöld felvillanás effekt
          this.energyBar.fillStyle(0x00ff00); // Erős zöld
          this.energyBar.fillRect(0, 0, this.energyPixels, UIConstants.energy.baseHeight);
          
          // Visszaállítás eredeti színre
          this.time.delayedCall(500, () => {
            this.updateEnergyUI();
          });
        }
      } else {
        Logger.debug(`⚡ Sajt evés bonus nem adható: energia csík már tele van (${this.energyPixels}/${UIConstants.energy.baseWidth}px)`);
      }
    } else {
      Logger.debug(`⚡ Sajt evés bonus nem adható: energyTimerStarted=${this.energyTimerStarted} (game over vagy még nem indult el)`);
    }
  }

  private updateBeanCountUI(data: BeanCountUpdateEvent): void {
    // Bean count már nem jelenik meg a UI-on
    // Csak az időszámláló látható
  }

  private updateJarUI(data: JarUIUpdateEvent): void {
    // Jar UI frissítés már nem szükséges - vizuálisan látható az üvegeken
  }

  private handleAllJarsFull(): void {
    Logger.debug('GameScene: Minden üveg megtelt!');
    // A vizuális feedback már az üvegeken látható
  }

  private handleJarDelivered(data: JarDeliveredEvent): void {
    const { jarIndex, totalJarsInPitcher } = data;
    Logger.debug(`GameScene: Jar ${jarIndex} leadva! Összesen: ${totalJarsInPitcher}/5`);
    // A leadott üvegek száma vizuálisan követhető
  }

  private handleJarHighlight(data: JarHighlightEvent): void {
    const { jarIndex, message } = data;
    Logger.debug(`GameScene: Jar ${jarIndex} highlight - ${message}`);
    
    // Csak console log - nincs UI üzenet változtatás
    // A villogás elég vizuális feedback
  }

  private handleCheeseEaten(): void {
    // Sajt evés bonus hozzáadása az energiához
    this.addEnergyBonus();
  }

  private handleGameComplete(): void {
    Logger.info('🎉 JÁTÉK BEFEJEZVE! Mind az 5 üveg leadva!');
    
    // Timer megállítása - győzelem esetén nincs időkorlát
    this.timerStarted = false;
    
    // Energia timer megállítása - győzelem után ne fogyjon tovább
    this.energyTimerStarted = false;
    
    // Játék logika leállítása
    this.beanManager.stopGame();
    
    // VICTORY SCREEN: Jelenleg nincs implementálva
    // A játék leáll, de nincs victory képernyő vagy restart opció
    // A játékosnak manuálisan kell visszalépnie a menübe
  }

  private updateJarPhaseUI(data: any): void { // JAR PHASE UI: Nincs használatban, vizuális feedback helyett
    // Jar phase UI már nem szükséges - vizuálisan látható

    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setText(`Fázis befejezve! (${data.phase}/${data.totalPhases})`);
      
      // 2 másodperc múlva visszaáll az eredeti szöveg
      setTimeout(() => {
        if (this.uiElements.instructionText) {
          this.uiElements.instructionText.setText('Kattints a babokra a gyűjtéshez!');
        }
      }, UIConstants.timings.instructionReset);
    }
  }

  /**
   * Üveg befejezés kezelése
   */
  private handleJarCompletion(data: any): void { // JAR COMPLETION: Nincs használatban, vizuális feedback helyett
    Logger.debug('Üveg befejezve!', data);
    
    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setText('🎉 Üveg kész! Új üveg kezdődik!');
      this.uiElements.instructionText.setBackgroundColor(UIConstants.colors.energyBackground);
      
      setTimeout(() => {
        if (this.uiElements.instructionText) {
          this.uiElements.instructionText.setText('Kattints a babokra a gyűjtéshez!');
          this.uiElements.instructionText.setBackgroundColor(UIConstants.colors.instructionBackground);
        }
      }, UIConstants.timings.jarCompletionReset);
    }
  }

  /**
   * Játék vége - csak akkor hívjuk, ha minden bab összegyűjtve
   */
  private gameOver(): void {
    Logger.info('Minden bab összegyűjtve! Gratulálunk!');
    
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
    // Eredeti kép méret lekérése
    const originalWidth = background.texture.source[0].width;
    const originalHeight = background.texture.source[0].height;
    
    // Háttér skálázása hogy fedje a teljes játékterületet (cover mode)
    const scaleX = gameWidth / originalWidth;
    const scaleY = gameHeight / originalHeight;
    const scale = Math.max(scaleX, scaleY);
    
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
    const gameWidth = newWidth || this.scale.width;
    const gameHeight = newHeight || this.scale.height;
    
    // Háttér újra méretezése a megadott méretekkel
    if (this.background) {
      this.updateBackgroundSizeWithDimensions(this.background, gameWidth, gameHeight);
    } else {
      Logger.error('HIBA: Háttér objektum nem található!');
    }
    
    // UI elemek pozíciójának frissítése
    this.updateUIPositionsWithDimensions(gameWidth, gameHeight);
  }

  /**
   * Ablakméret változás kezelése (custom esemény)
   */
  resize(gameSize: ResizeEvent): void {
    Logger.debug(`Custom resize: ${gameSize.width}x${gameSize.height}`);
    
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
    // Energia kijelző (bal felső sarok) 
    if (this.uiElements.energyText) {
      this.uiElements.energyText.setPosition(UIConstants.positions.energyOffset, UIConstants.positions.energyOffset);
    }

    // Időszámláló pozíció frissítése (ha létezik)
    if (this.timerBackground && this.uiElements.timerText) {
      this.updateTimerPosition(gameWidth);
    }



    // Utasítás szöveg (lent középen)
    if (this.uiElements.instructionText) {
      this.uiElements.instructionText.setPosition(gameWidth / 2, gameHeight - UIConstants.positions.instructionOffset);
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
    
    // Timer méretének és pozíciójának frissítése - csak ha háttér is létezik
    if (this.uiElements.timerText && this.timerBackground) {
      this.updateTimerUI(); // Ez már tartalmazza az arányosítást
      this.updateTimerPosition(gameWidth); // És a pozíciót is frissíti
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