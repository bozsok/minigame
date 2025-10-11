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
  private countdownTime: number = 20; // TESZT: 20 másodperc (eredetileg 5 * 60)
  private timerStarted: boolean = false; // Timer csak babok betöltése után indul
  private timerBackground!: Phaser.GameObjects.Graphics;
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
    this.timerStarted = false; // Timer még nem indult el

    // Natív cursor használata
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.style.cursor = 'default';
    }

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

    console.log('GameScene létrehozva - Várakozás Play gomb megnyomására!');
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
    
    // Időszámláló azonnal létrehozása REJTVE - betűtípus betöltéséhez
    this.createHiddenTimerElements();
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
    const baseFontSize = 42;
    const baseStrokeThickness = 4;
    const fontSize = Math.round(baseFontSize * gameScale);
    const strokeThickness = Math.round(baseStrokeThickness * gameScale);
    
    // Időszámláló szöveg létrehozása REJTVE - BBH Sans Hegarty már elérhető
    this.uiElements.timerText = this.add.text(0, 0, '05:00', {
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontFamily: '"BBH Sans Hegarty", "Berlin Sans FB Demi", "Arial Black", Arial, sans-serif',
      stroke: '#333333',
      strokeThickness: strokeThickness
    }).setOrigin(0.5, 0.5);

    // Időszámláló háttér létrehozása REJTVE
    this.createTimerBackground();
    
    // REJTÉS - nem látható amíg a Play gomb meg nem nyomva
    this.uiElements.timerText.setVisible(false);
    this.timerBackground.setVisible(false);
    
    console.log('⏰ Rejtett időszámláló elemek létrehozva - BBH Sans Hegarty (PreloadScene-ben előbetöltött)');
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
      this.countdownTime = 20; // TESZT: 20 másodperc (eredetileg 5 * 60)
      
      // AZONNAL beállítjuk a kezdő szöveget
      this.updateTimerUI();
      
      // Pozíció újraszámítása
      this.updateTimerPosition(this.scale.width);
      
      console.log('⏰ Időszámláló megjelenítve és elindítva - azonnal 05:00 szöveggel');
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
    const baseTimerWidth = 175;  // Eredeti design méret
    const baseTimerHeight = 75;  // Eredeti design méret
    const timerWidth = baseTimerWidth * gameScale;
    const timerHeight = baseTimerHeight * gameScale;
    
    const fullscreenButtonX = gameWidth - 40; // FullscreenButton pozíciója
    const timerX = fullscreenButtonX - 40 - timerWidth - 10; // 40px gomb szélesség + 10px távolság
    const timerY = 20;

    // Graphics objektum létrehozása
    this.timerBackground = this.add.graphics();
    
    // Border és lekerekítés arányosítása
    const baseBorderWidth = 6;    // Eredeti border vastagság
    const baseCornerRadius = 20;  // Eredeti lekerekítés
    const borderWidth = Math.round(baseBorderWidth * gameScale);
    const cornerRadius = Math.round(baseCornerRadius * gameScale);
    
    // Border rajzolása (#3ba4c2 szín, arányosított vastagság)
    this.timerBackground.lineStyle(borderWidth, 0x3ba4c2);
    this.timerBackground.fillStyle(0x000000); // Fekete kitöltés
    
    // Lekerekített téglalap - arányosított lekerekítés
    this.timerBackground.fillRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);
    this.timerBackground.strokeRoundedRect(timerX, timerY, timerWidth, timerHeight, cornerRadius);

    // Timer szöveg pozícionálása a téglalap közepére
    if (this.uiElements.timerText) {
      this.uiElements.timerText.setPosition(timerX + timerWidth / 2, timerY + timerHeight / 2);
      console.log(`⏰ Timer szöveg pozícionálva: (${timerX + timerWidth / 2}, ${timerY + timerHeight / 2})`);
    }
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
    const baseTimerWidth = 175;  // Eredeti design méret
    const baseTimerHeight = 75;  // Eredeti design méret
    const timerWidth = baseTimerWidth * gameScale;
    const timerHeight = baseTimerHeight * gameScale;
    
    const fullscreenButtonX = gameWidth - 40;
    const timerX = fullscreenButtonX - 40 - timerWidth - 10;
    const timerY = 20;

    // Graphics háttér frissítése
    if (this.timerBackground) {
      this.timerBackground.clear();
      
      // Border és lekerekítés arányosítása
      const baseBorderWidth = 6;    // Eredeti border vastagság
      const baseCornerRadius = 20;  // Eredeti lekerekítés
      const borderWidth = Math.round(baseBorderWidth * gameScale);
      const cornerRadius = Math.round(baseCornerRadius * gameScale);
      
      this.timerBackground.lineStyle(borderWidth, 0x3ba4c2);
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
            console.log('⏰ BBH Sans Hegarty font specifikusan betöltve és elérhető');
            resolve();
          } else {
            console.log('⏰ BBH Sans Hegarty még nem elérhető, újrapróbálkozás...');
            setTimeout(checkFont, 100); // 100ms-enként ellenőrzés
          }
        };
        
        // Első ellenőrzés
        checkFont();
        
        // Biztonsági timeout 2 másodperc után
        setTimeout(() => {
          console.log('⏰ Font timeout - folytatás fallback fonttal');
          resolve();
        }, 2000);
      } else {
        // Fallback - 800ms várakozás
        setTimeout(() => {
          console.log('⏰ Font várakozás fallback (800ms)');
          resolve();
        }, 800);
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
        stroke: '#333333',
        strokeThickness: 4
      });
      
      // Kényszerített szöveg frissítés a font alkalmazásához
      const currentText = this.uiElements.timerText.text;
      this.uiElements.timerText.setText('');
      this.uiElements.timerText.setText(currentText);
      
      console.log('⏰ Font explicit beállítás és szöveg frissítés végrehajtva');
    }
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
  public startGame(): void {
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
      
      // IDŐSZÁMLÁLÓ MEGJELENÍTÉSE ÉS INDÍTÁSA - babok betöltése után
      console.log('⏰ Időszámláló megjelenítése és indítása - 5 perc visszaszámlálás!');
      this.showTimerElements();
      
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

    // Időszámláló logika frissítése - csak ha elindult
    if (this.timerStarted && this.uiElements.timerText) {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - this.gameStartTime) / 1000);
      const newCountdownTime = Math.max(0, 20 - elapsedSeconds); // TESZT: 20 másodperc (eredetileg 5 * 60)
      
      // Timer UI frissítése ha változott az idő
      if (newCountdownTime !== this.countdownTime) {
        this.countdownTime = newCountdownTime;
        this.updateTimerUI();
        
        // Debug minden másodpercben
        console.log(`⏰ Timer update: ${this.countdownTime}s (elapsed: ${elapsedSeconds}s)`);
      }
      
      // Időtúllépés ellenőrzés (game over) - csak egyszer hívjuk meg
      if (this.countdownTime <= 0 && this.timerStarted) {
        this.timerStarted = false; // Leállítjuk a timer logikáját
        this.handleTimeUp();
      }
    }
    

    
    // Egyéb UI frissítése
    const currentTime = Date.now();
    const elapsedSeconds = Math.floor((currentTime - this.gameStartTime) / 1000);
    this.updateEnergyUI(elapsedSeconds);
  }

  /**
   * Időszámláló UI frissítése (MM:SS formátum)
   */
  private updateTimerUI(): void {
    if (!this.uiElements.timerText) {
      console.log('⚠️ Timer text nem létezik - skipeljük frissítést!');
      return;
    }
    
    // EXTRA VÉDELEM: Ellenőrizzük, hogy a Phaser objektum valóban működőképes-e
    try {
      // Teszteljük, hogy az objektum még mindig valid-e
      if (!this.uiElements.timerText.scene || this.uiElements.timerText.scene !== this) {
        console.log('⚠️ Timer text scene invalid - újralétrehozzuk!');
        this.createHiddenTimerElements();
        return;
      }
    } catch (error) {
      console.log('⚠️ Timer text corrupt, újralétrehozzuk:', error);
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
    const baseFontSize = 42;
    const baseStrokeThickness = 4;
    const fontSize = Math.round(baseFontSize * gameScale);
    const strokeThickness = Math.round(baseStrokeThickness * gameScale);
    
    // BIZTONSÁGOS szöveg és stílus beállítása try-catch-el
    try {
      this.uiElements.timerText.setText(timeString);
      this.uiElements.timerText.setStyle({
        fontSize: `${fontSize}px`,
        fontFamily: '"BBH Sans Hegarty", "Berlin Sans FB Demi", "Arial Black", Arial, sans-serif',
        stroke: '#333333',
        strokeThickness: strokeThickness
      });
      
      // Egyszerű színbeállítás
      if (this.countdownTime <= 30) {
        this.uiElements.timerText.setColor('#ff0000'); // Piros 30 másodpercnél
      } else if (this.countdownTime <= 120) {
        this.uiElements.timerText.setColor('#ffaa00'); // Narancssárga 2 percnél
      } else {
        this.uiElements.timerText.setColor('#ffffff'); // Fehér
      }
    } catch (error) {
      console.log('⚠️ KRITIKUS: Timer text frissítés hiba - újralétrehozzuk!', error);
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
    if (this.countdownTime >= 290) { // Első 10 mp (300-290)
      console.log(`⏰ Timer frissítve: "${timeString}" (${this.countdownTime}s maradt)`);
      console.log(`⏰ Text pos: (${this.uiElements.timerText.x}, ${this.uiElements.timerText.y})`);
      console.log(`⏰ Text visible: ${this.uiElements.timerText.visible}, alpha: ${this.uiElements.timerText.alpha}`);
    }
  }

  /**
   * Időtúllépés kezelése
   */
  private handleTimeUp(): void {
    console.log('⏰ IDŐ LEJÁRT! Játék megáll, elemek látva maradnak!');
    
    // Játék logika leállítása (de elemek látva maradnak)
    this.beanManager.stopGame();
    
    // Piros körvonal hozzáadása a maradék babokhoz
    this.beanManager.highlightRemainingBeans();
    
    // Timer 00:00-n marad, semmi nem tűnik el
    // Játékos szabadon nézheti a maradék elemeket
    // Visszatérés: ablakos mód gomb → MenuScene
    console.log('⏰ Játék befagyasztva - ablakos mód gombbal lehet visszatérni');
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
    // Bean count már nem jelenik meg a UI-on
    // Csak az időszámláló látható
  }

  private updateJarUI(data: any): void {
    // Jar UI frissítés már nem szükséges - vizuálisan látható az üvegeken
  }

  private handleAllJarsFull(): void {
    console.log('GameScene: Minden üveg megtelt!');
    // A vizuális feedback már az üvegeken látható
  }

  private handleJarDelivered(data: any): void {
    const { jarIndex, totalJarsInPitcher } = data;
    console.log(`GameScene: Jar ${jarIndex} leadva! Összesen: ${totalJarsInPitcher}/5`);
    // A leadott üvegek száma vizuálisan követhető
  }

  private handleJarHighlight(data: any): void {
    const { jarIndex, message } = data;
    console.log(`GameScene: Jar ${jarIndex} highlight - ${message}`);
    
    // Csak console log - nincs UI üzenet változtatás
    // A villogás elég vizuális feedback
  }

  private handleGameComplete(): void {
    console.log('🎉 JÁTÉK BEFEJEZVE! Mind az 5 üveg leadva!');
    
    // Timer megállítása - győzelem esetén nincs időkorlát
    this.timerStarted = false;
    
    // Játék logika leállítása
    this.beanManager.stopGame();
    
    // TODO: Victory screen vagy restart opció
  }

  private updateJarPhaseUI(data: any): void {
    // Jar phase UI már nem szükséges - vizuálisan látható

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
      console.log('HIBA: Háttér objektum nem található!');
    }
    
    // UI elemek pozíciójának frissítése
    this.updateUIPositionsWithDimensions(gameWidth, gameHeight);
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
    // Energia kijelző (bal felső sarok) 
    if (this.uiElements.energyText) {
      this.uiElements.energyText.setPosition(20, 20);
    }

    // Időszámláló pozíció frissítése (ha létezik)
    if (this.timerBackground && this.uiElements.timerText) {
      this.updateTimerPosition(gameWidth);
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