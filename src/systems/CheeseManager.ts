import { Cheese } from '../gameObjects/Cheese';
import { Logger } from '../utils/Logger';

export class CheeseManager {
  private scene: Phaser.Scene;
  private cheeses: Map<number, Cheese> = new Map();
  private devMode: boolean = false;
  private originalPositions: Map<number, {x: number, y: number}> = new Map();
  private gameActive: boolean = true; // Játék interakció állapot
  
  // Responsive scaling támogatás
  private originalCanvasWidth: number = 1920;
  private originalCanvasHeight: number = 1080;
  
  // Egyszerű, biztos pozíciók (ablakos 860x484 mérethez)
  private static readonly CHEESE_POSITIONS = {
    1: { x: 150, y: 100 },  // bal felső
    2: { x: 700, y: 100 },  // jobb felső
    3: { x: 150, y: 350 },  // bal alsó
    4: { x: 700, y: 350 },  // jobb alsó
    5: { x: 430, y: 220 }   // középen
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupDevModeControls();
  }

  public spawnCheeses(): void {
    // CHEESE-1 → MENTETT POZÍCIÓ (147, 461) - KÉSZ!
    const cheese1 = new Cheese(this.scene, 147, 461, 1);
    this.cheeses.set(1, cheese1);
    this.originalPositions.set(1, {x: 147, y: 461});
    
    // CHEESE-2 → MENTETT POZÍCIÓ (83, 805) - KÉSZ!
    const cheese2 = new Cheese(this.scene, 83, 805, 2);
    this.cheeses.set(2, cheese2);
    this.originalPositions.set(2, {x: 83, y: 805});
    
    // CHEESE-3 → MENTETT POZÍCIÓ (954, 612) - KÉSZ!
    const cheese3 = new Cheese(this.scene, 954, 612, 3);
    this.cheeses.set(3, cheese3);
    this.originalPositions.set(3, {x: 954, y: 612});
    
    // CHEESE-4 → MENTETT POZÍCIÓ (1197, 366) - KÉSZ!
    const cheese4 = new Cheese(this.scene, 1197, 366, 4);
    this.cheeses.set(4, cheese4);
    this.originalPositions.set(4, {x: 1197, y: 366});
    
    // CHEESE-5 → MENTETT POZÍCIÓ (1705, 720) - KÉSZ!
    const cheese5 = new Cheese(this.scene, 1706, 720, 5);
    this.cheeses.set(5, cheese5);
    this.originalPositions.set(5, {x: 1705, y: 720});
    
    console.log(`🧀 CHEESE-1 létrehozva: (147, 461) - KÉSZ! ✅`);
    console.log(`🧀 CHEESE-2 létrehozva: (83, 805) - KÉSZ! ✅`);
    console.log(`🧀 CHEESE-3 létrehozva: (954, 612) - KÉSZ! ✅`);
    console.log(`🧀 CHEESE-4 létrehozva: (1197, 366) - KÉSZ! ✅`);
    console.log(`🧀 CHEESE-5 létrehozva: (1705, 720) - KÉSZ! ✅`);
    console.log(`� MINDEN SAJT POZICIONÁLVA! JÁTÉK KÉSZ! 🎉`);
  }

  private setupDevModeControls(): void {
    // D billentyű lenyomására dev mode aktiválása
    this.scene.input.keyboard?.on('keydown-D', () => {
      this.toggleDevMode();
    });

    // ESC billentyűre dev mode kikapcsolása és koordináták exportálása
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      if (this.devMode) {
        this.exportCoordinates();
        this.disableDevMode();
      }
    });
  }

  private toggleDevMode(): void {
    this.devMode = !this.devMode;
    
    if (this.devMode) {
      this.enableDevMode();
    } else {
      this.disableDevMode();
    }
  }

  private enableDevMode(): void {
    Logger.info('🔧 DEV MODE: CHEESE-1 POZICIONÁLÓ!');
    Logger.info('🎚️ Csak CHEESE-1-et pozícionáld!');
    Logger.info('📝 ESC: koordináták mentése');
    
    // CHEESE-5 DEBUG INFO
    const cheese5 = this.cheeses.get(5);
    if (cheese5) {
      Logger.debug(`🧀 DEV MODE - CHEESE-5 JELENLEGI POZÍCIÓ: (${cheese5.x}, ${cheese5.y})`);
      cheese5.setAlpha(0.8);
      
      Logger.debug(`✅ CHEESE-5 pozíció megmarad: (${cheese5.x}, ${cheese5.y})`);
    }
    
    // Babok elrejtése dev mode alatt
    const gameScene = this.scene as any; // TODO: GameScene interfész - körkörös függőség miatt any
    if (gameScene.beanManager) {
      gameScene.beanManager.hideAllBeans();
    }
    
    // Slider UI létrehozása
    this.createSliderUI();
  }

  private disableDevMode(): void {
    Logger.info('🔧 DEV MODE KIKAPCSOLVA');
    
    // Slider UI eltávolítása
    this.removeSliderUI();
    
    // Babok visszamutatása
    const gameScene = this.scene as any; // TODO: GameScene interfész - körkörös függőség miatt any
    if (gameScene.beanManager) {
      gameScene.beanManager.showAllBeans();
    }
    
    // Mindkét sajt visszaállítása
    this.cheeses.forEach((cheese, id) => {
      cheese.setAlpha(1);
      cheese.resetInteraction();
    });
    
    Logger.debug('✅ Sajtok right-click visszaállítva');
  }

  private exportCoordinates(): void {
    const cheese5 = this.cheeses.get(5);
    if (cheese5) {
      const x = Math.round(cheese5.x);
      const y = Math.round(cheese5.y);
      
      Logger.info('🎚️ SLIDER POZICIONÁLÁS VÉGE!');
      Logger.info('📊 CHEESE-5 VÉGSŐ KOORDINÁTÁI:');
      Logger.info(`🎯 X: ${x}, Y: ${y}`);
      Logger.info('');
      Logger.info('📋 FRISSÍTSD A KÓDOT:');
      Logger.info(`const cheese5 = new Cheese(this.scene, ${x}, ${y}, 5);`);
      Logger.info('');
      
      // Pozíció mentése
      this.originalPositions.set(5, {x, y});
      Logger.debug('✅ CHEESE-5 pozíció elmentve! Dev mode kikapcsolva.');
    }
  }

  // VALÓS ARÁNYOSÍTÁS - Fullscreen (1.0) vagy canvas arányosítás
  public updateScale(gameScale: number, gameWidth: number, gameHeight: number): void {
    // Dev mode-ban nincs scaling
    if (this.devMode) {
      Logger.debug('🧀 CheeseManager: Dev mode aktív - scaling letiltva');
      return;
    }
    
    const isFullscreen = gameScale >= 1.0;
    Logger.debug(`🧀 CheeseManager ${isFullscreen ? 'FULLSCREEN' : 'ABLAKOS'} skálázás: ${gameScale.toFixed(3)}`);
    
    this.cheeses.forEach((cheese, cheeseId) => {
      const originalPos = this.originalPositions.get(cheeseId);
      
      if (!originalPos) {
        Logger.warn(`Nincs eredeti pozíció tárolva a sajt számára: ${cheeseId}`);
        return;
      }
      
      if (isFullscreen) {
        // Fullscreen: eredeti pozíciók és natív méret
        cheese.setScale(1.0);
        cheese.setPosition(originalPos.x, originalPos.y);
        Logger.debug(`🧀 CHEESE-${cheeseId} fullscreen: (${originalPos.x}, ${originalPos.y}) scale: 1.0`);
      } else {
        // Ablakos: valós arányosítás alapján
        const scaledX = originalPos.x * gameScale;
        const scaledY = originalPos.y * gameScale;
        
        cheese.setScale(gameScale);
        cheese.setPosition(scaledX, scaledY);
        Logger.debug(`🧀 CHEESE-${cheeseId} ablakos: (${Math.round(scaledX)}, ${Math.round(scaledY)}) scale: ${gameScale.toFixed(3)}`);
      }
    });
    
    Logger.debug(`🧀 CheeseManager: ${this.cheeses.size} sajt újrapozícionálva (${isFullscreen ? 'nagy' : 'arányos'} méret)`);
  }

  private createSliderUI(): void {
    Logger.debug('🎯 VALÓS TELJES KÉPERNYŐ ALAPÚ SLIDER');
    
    // VALÓS KÉPERNYŐ MÉRETEK - DINAMIKUS!
    const gameScene = this.scene as any; // TODO: GameScene interfész - körkörös függőség miatt any
    const CANVAS_WIDTH = gameScene.scale.width;   // Valós teljes képernyő szélesség
    const CANVAS_HEIGHT = gameScene.scale.height; // Valós teljes képernyő magasság
    const CANVAS_CENTER_X = Math.round(CANVAS_WIDTH / 2);  // Valós közepe X
    const CANVAS_CENTER_Y = Math.round(CANVAS_HEIGHT / 2); // Valós közepe Y
    
    Logger.debug(`📐 VALÓS KÉPERNYŐ: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}, KÖZÉP: (${CANVAS_CENTER_X}, ${CANVAS_CENTER_Y})`);
    
    // Slider UI konstansok
    const SLIDER_START = 100;
    const SLIDER_LENGTH = 300;
    const SLIDER_END = SLIDER_START + SLIDER_LENGTH; // 400
    const SLIDER_CENTER = SLIDER_START + (SLIDER_LENGTH / 2); // 250 (slider közepe)
    
    // UI háttér - TELJES KÉPERNYŐ TETEJÉN KÖZÉPEN!
    const sliderCenterX = CANVAS_CENTER_X;  // Képernyő vízszintes közepe
    const sliderY = 100;  // Felül
    
    const bg = this.scene.add.rectangle(sliderCenterX, sliderY + 50, 400, 150, 0x000000, 0.9).setDepth(9999);
    const title = this.scene.add.text(sliderCenterX, sliderY, 'CHEESE-5 POZÍCIÓ', { 
      fontSize: '18px', color: '#fff' 
    }).setOrigin(0.5).setDepth(9999);
    
    // X Slider - KÉPERNYŐ KÖZEPÉN
    const xBg = this.scene.add.rectangle(sliderCenterX, sliderY + 30, SLIDER_LENGTH, 20, 0x444444).setDepth(9999);
    const xHandle = this.scene.add.circle(sliderCenterX, sliderY + 30, 10, 0x00ff00).setDepth(10000).setInteractive();
    const xText = this.scene.add.text(sliderCenterX + 170, sliderY + 30, `X: ${CANVAS_CENTER_X}`, { fontSize: '14px', color: '#fff' }).setDepth(9999);
    
    // Y Slider - KÉPERNYŐ KÖZEPÉN
    const yBg = this.scene.add.rectangle(sliderCenterX, sliderY + 70, SLIDER_LENGTH, 20, 0x444444).setDepth(9999);
    const yHandle = this.scene.add.circle(sliderCenterX, sliderY + 70, 10, 0x00ff00).setDepth(10000).setInteractive();
    const yText = this.scene.add.text(sliderCenterX + 170, sliderY + 70, `Y: ${CANVAS_CENTER_Y}`, { fontSize: '14px', color: '#fff' }).setDepth(9999);
    
    // Kész gomb - KÉPERNYŐ KÖZEPÉN
    const doneBtn = this.scene.add.rectangle(sliderCenterX, sliderY + 110, 80, 30, 0x006600).setDepth(9999).setInteractive();
    const doneText = this.scene.add.text(sliderCenterX, sliderY + 110, 'KÉSZ', { fontSize: '14px', color: '#fff' }).setOrigin(0.5).setDepth(9999);
    
    // CHEESE-1 AKTUÁLIS CANVAS POZÍCIÓJA → SLIDER POZÍCIÓ
    const cheese5 = this.cheeses.get(5);
    if (cheese5) {
      const currentCanvasX = cheese5.x;  // Pl: 0
      const currentCanvasY = cheese5.y;  // Pl: 0
      
      // Canvas koordináta → Slider handle pozíció
      const xHandlePos = sliderCenterX - (SLIDER_LENGTH / 2) + (currentCanvasX / CANVAS_WIDTH) * SLIDER_LENGTH;
      const yHandlePos = sliderCenterX - (SLIDER_LENGTH / 2) + (currentCanvasY / CANVAS_HEIGHT) * SLIDER_LENGTH;
      
      xHandle.x = xHandlePos;
      yHandle.x = yHandlePos;
      xText.setText(`X: ${Math.round(currentCanvasX)}`);
      yText.setText(`Y: ${Math.round(currentCanvasY)}`);
      
      Logger.debug(`🧀 CHEESE-5 Canvas pozíció: (${currentCanvasX}, ${currentCanvasY})`);
      Logger.debug(`🎚️ Slider handle → bal szélre (canvas 0,0 miatt)`);
      Logger.debug(`🎚️ Handle pozíciók: X=${Math.round(xHandlePos)}, Y=${Math.round(yHandlePos)}`);
    }
    
    // Drag rendszer
    let activeSlider: 'x' | 'y' | null = null;
    
    xHandle.on('pointerdown', () => activeSlider = 'x');
    yHandle.on('pointerdown', () => activeSlider = 'y');
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (activeSlider === 'x') {
        // JAVÍTOTT: Pointer pozíció → Slider pozíció → Canvas koordináta
        const sliderMin = sliderCenterX - (SLIDER_LENGTH / 2);
        const sliderMax = sliderCenterX + (SLIDER_LENGTH / 2);
        const clampedSliderX = Math.max(sliderMin, Math.min(sliderMax, pointer.x));
        xHandle.x = clampedSliderX;
        
        const normalizedPos = (clampedSliderX - sliderMin) / SLIDER_LENGTH;
        const canvasX = Math.round(normalizedPos * CANVAS_WIDTH);
        xText.setText(`X: ${canvasX}`);
        
        // Y koordináta számítása
        const yNormalizedPos = (yHandle.x - sliderMin) / SLIDER_LENGTH;
        const currentCanvasY = Math.round(yNormalizedPos * CANVAS_HEIGHT);
        this.moveCheeseToCanvas(5, canvasX, currentCanvasY);
      } 
      else if (activeSlider === 'y') {
        // JAVÍTOTT: Pointer pozíció → Slider pozíció → Canvas koordináta
        const sliderMin = sliderCenterX - (SLIDER_LENGTH / 2);
        const sliderMax = sliderCenterX + (SLIDER_LENGTH / 2);
        const clampedSliderX = Math.max(sliderMin, Math.min(sliderMax, pointer.x));
        yHandle.x = clampedSliderX;
        
        const normalizedPos = (clampedSliderX - sliderMin) / SLIDER_LENGTH;
        const canvasY = Math.round(normalizedPos * CANVAS_HEIGHT);
        yText.setText(`Y: ${canvasY}`);
        
        // X koordináta számítása
        const xNormalizedPos = (xHandle.x - sliderMin) / SLIDER_LENGTH;
        const currentCanvasX = Math.round(xNormalizedPos * CANVAS_WIDTH);
        this.moveCheeseToCanvas(5, currentCanvasX, canvasY);
      }
    });
    
    this.scene.input.on('pointerup', () => activeSlider = null);
    
    // Kész gomb
    doneBtn.on('pointerdown', () => {
      this.exportCoordinates();
      this.disableDevMode();
    });
    
    // UI elemek tárolása cleanup-hoz
    (this as any).sliderElements = [bg, title, xBg, xHandle, xText, yBg, yHandle, yText, doneBtn, doneText];
    
    Logger.debug('✅ Canvas koordináta alapú slider kész!');
  }

  private moveCheeseToCanvas(cheeseId: number, canvasX: number, canvasY: number): void {
    const cheese = this.cheeses.get(cheeseId);
    if (cheese) {
      // Canvas koordinátára helyezzük - PONT!
      cheese.setPosition(canvasX, canvasY);
      Logger.debug(`🧀 CHEESE-${cheeseId} → setPosition(${canvasX}, ${canvasY})`);
      Logger.debug(`🎯 Ellenőrzés - tényleges pozíció: (${cheese.x}, ${cheese.y})`);
    }
  }



  private removeSliderUI(): void {
    // Phaser UI elemek eltávolítása
    const elements = (this as any).sliderElements;
    if (elements) {
      elements.forEach((element: any) => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
      (this as any).sliderElements = null;
      Logger.debug('🎚️ Phaser Slider UI eltávolítva');
    }
  }



  // Getterek
  public getCheeses(): Map<number, Cheese> {
    return this.cheeses;
  }

  public getCheeseCount(): number {
    return this.cheeses.size;
  }

  public getEatenCheeseCount(): number {
    let count = 0;
    this.cheeses.forEach((cheese) => {
      if (cheese.isCompletelyEaten()) {
        count++;
      }
    });
    return count;
  }

  /**
   * Dev mode állapot lekérdezése (GameScene számára)  
   */
  public isDevMode(): boolean {
    return this.devMode;
  }

  /**
   * Eredeti canvas méret lekérdezése (responsive scaling számára)
   */
  public getOriginalCanvasWidth(): number {
    return this.originalCanvasWidth;
  }

  public getOriginalCanvasHeight(): number {
    return this.originalCanvasHeight;
  }

  /**
   * Játék interakció állapot beállítása
   */
  public setGameActive(active: boolean): void {
    this.gameActive = active;
  }

  /**
   * Játék interakció állapot lekérdezése
   */
  public isGameActive(): boolean {
    return this.gameActive;
  }
}