import { Logger } from '../utils/Logger';

export class Cheese extends Phaser.GameObjects.Image {
  private cheeseType: number; // 1-5
  private currentFrame: number = 0; // 0-4 (5 frame)
  private frameWidth!: number;
  private frameHeight!: number;
  private isEaten: boolean = false;
  private isEating: boolean = false; // Prevents multiple events per right-click
  private glowFX: any = null; // Glow effect referencia
  
  // Frame méretek sajt típusonként
  private static readonly FRAME_SIZES = {
    1: { width: 234, height: 141 },
    2: { width: 412, height: 199 },
    3: { width: 342, height: 104 },
    4: { width: 178, height: 74 },
    5: { width: 214, height: 119 }
  };

  constructor(scene: Phaser.Scene, x: number, y: number, cheeseType: number) {
    // EGYSZERŰ IMAGE - Container nélkül!
    super(scene, x, y, `cheese-${cheeseType}`);
    this.cheeseType = cheeseType;
    
    // Frame méret beállítása
    const frameSize = Cheese.FRAME_SIZES[cheeseType as keyof typeof Cheese.FRAME_SIZES];
    this.frameWidth = frameSize.width;
    this.frameHeight = frameSize.height;
    
    // EGYSZERŰ: Origin bal felső sarok
    this.setOrigin(0, 0);
    
    // Frame beállítása
    this.updateFrame();
    
    // PreFX padding beállítása a glow effekt számára
    if (this.preFX) {
      this.preFX.setPadding(32);
    }
    
    this.setupInteraction();
    
    // Z-index
    this.setDepth(300);
    
    scene.add.existing(this);
    
    // DEBUG
    if (cheeseType === 3) {
      Logger.debug(`🧀 CHEESE-3 EGYSZERŰ IMAGE DEBUG:`);
      Logger.debug(`  Pozíció: (${this.x}, ${this.y})`);
      Logger.debug(`  Origin: (${this.originX}, ${this.originY})`);
      Logger.debug(`  Méret: ${this.frameWidth}x${this.frameHeight}`);
    }
  }



  private setupInteraction(): void {
    // PIXEL-PERFECT COLLISION - átlátszó területeken click-through a babokhoz!
    this.setInteractive({ 
      pixelPerfect: true,
      alphaTolerance: 1 // Csak teljesen átlátszatlan pixeleken kattintható
    });

    // Right-click kezelése (csak pointerdown)
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // GAME ACTIVE ELLENŐRZÉS - első prioritás
      const gameScene = this.scene as any;
      if (gameScene.cheeseManager && !gameScene.cheeseManager.isGameActive()) {
        Logger.debug(`🚫 Sajt ${this.cheeseType} evés TILTVA - játék inaktív`);
        return;
      }

      if (pointer.rightButtonDown() && !this.isEating) {
        this.isEating = true;
        Logger.debug(`Right-click sajt ${this.cheeseType}-ra (frame: ${this.currentFrame}) - pixel-perfect hit!`);
        this.eatCheese();
      }
    });

    // Hover effect - Custom cursor + Glow
    this.on('pointerover', () => {
      // GAME ACTIVE ELLENŐRZÉS - cursor és glow tiltása
      const gameScene = this.scene as any;
      if (gameScene.cheeseManager && !gameScene.cheeseManager.isGameActive()) {
        return; // Nem változtatjuk a cursort ha játék inaktív
      }

      // Csak akkor változtassuk a cursort és glow-t, ha a sajt még ehető
      if (!this.isCompletelyEaten()) {
        // Custom egérke száj cursor - eredeti méretben (canvas zoom neutralized)
        const canvas = this.scene.game.canvas;
        if (canvas) {
          // Aktuális játék méretarány lekérdezése
          const gameScale = (this.scene as any).getCurrentGameScale ? (this.scene as any).getCurrentGameScale() : 1.0;
          
          const baseCursorScale = 0.6; // 60% alapméret
          // Canvas zoom neutralizálva van, így eredeti scaling használható
          const finalCursorScale = baseCursorScale * gameScale;
          
          this.setScaledCursor(canvas, 'cursor-eat.png', finalCursorScale);
          console.log(`🖱️ Cursor scale: ${(finalCursorScale * 100).toFixed(1)}% (zoom neutralized canvas)`);
        }
        
        // Glow effekt hozzáadása
        if (this.preFX && !this.glowFX) {
          this.glowFX = this.preFX.addGlow();
          
          // KRITIKUS: Kezdeti strength 0-ra állítása a felvillanás elkerülésére
          this.glowFX.outerStrength = 0;
          
          // Smooth fade-in animáció 0-ról 3-ra
          this.scene.tweens.add({
            targets: this.glowFX,
            outerStrength: 3,
            duration: 300,
            ease: 'sine.out'
          });
        }
        
        Logger.debug(`🖱️✨ Custom cursor + Glow bekapcsolva sajt ${this.cheeseType}-nál (frame: ${this.currentFrame})`);
      } else {
        Logger.debug(`🖱️ Sajt ${this.cheeseType} már teljesen elfogyott - nincs hover effekt`);
      }
    });

    this.on('pointerout', () => {
      // Cursor visszaállítás default-ra
      const canvas = this.scene.game.canvas;
      if (canvas) {
        canvas.style.cursor = 'default';
      }

      // Glow effekt eltávolítása smooth animációval
      if (this.glowFX) {
        this.scene.tweens.add({
          targets: this.glowFX,
          outerStrength: 0,
          duration: 200,
          ease: 'sine.in',
          onComplete: () => {
            if (this.preFX && this.glowFX) {
              this.preFX.remove(this.glowFX);
              this.glowFX = null;
            }
          }
        });
      }

      Logger.debug(`🖱️✨ Custom cursor + Glow kikapcsolva`);
    });

    // Pointer up kezelése - isEating flag reset
    this.on('pointerup', () => {
      this.isEating = false;
    });
  }

  private eatCheese(): void {
    if (this.isEaten) return;
    
    // Ha még nem az utolsó frame (4. frame), akkor továbblépés
    if (this.currentFrame < 4) {
      this.currentFrame++;
      this.updateFrame();
      
      Logger.debug(`Sajt ${this.cheeseType} evés: ${this.currentFrame}/4 frame`);
      
      // Esemény küldése a GameScene-nek az energia bonus hozzáadásához
      // Mind a 4 kattintás ad bonust (frame 1-4): 4×30px = 120px = teljes energia csík
      if (this.currentFrame <= 4) {
        Logger.info(`🧀 SAJT EVÉS EVENT: ${this.cheeseType} sajt, ${this.currentFrame}/4 frame - ENERGIA BONUS KÜLDÉS!`);
        this.scene.events.emit('cheese-eaten', {
          cheeseId: `cheese-${this.cheeseType}-${this.x}-${this.y}`,
          cheeseType: this.cheeseType.toString(),
          currentFrame: this.currentFrame,
          energyBonus: 30 // 30px bonus a GameBalance alapján
        });
      } else {
        Logger.debug(`🧀 Sajt ${this.cheeseType} már teljesen elfogyott (${this.currentFrame}) - nincs további bonus`);
      }
      
      // Ha elértük az utolsó frame-et (5. fázis)
      if (this.currentFrame === 4) {
        this.isEaten = true;
        Logger.debug(`Sajt ${this.cheeseType} teljesen elfogyott! Morzsák maradnak.`);
        
        // Morzsák normál láthatósággal maradnak
      }
    } else {
      // Ha már az 5. frame-nél vagyunk, nem történik semmi
      Logger.debug(`Sajt ${this.cheeseType} már teljesen elfogyott - nincs több frame!`);
    }
  }

  private updateFrame(): void {
    // SPRITESHEET setFrame használat - pont mint a baboknál!
    this.setFrame(this.currentFrame);
    
    // Origin bal felső sarok
    this.setOrigin(0, 0);
    

    
    // PIXEL-PERFECT collision automatikusan frissül frame váltásnál!
    Logger.debug(`🧀 Sajt ${this.cheeseType} frame váltás: ${this.currentFrame}`);
    Logger.debug(`  pozíció: (${this.x}, ${this.y}) - pixel-perfect collision aktív!`);
  }

  // Getterek
  public getCheeseType(): number {
    return this.cheeseType;
  }

  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  public isCompletelyEaten(): boolean {
    return this.isEaten;
  }

  // Responsive scaling support
  public updateScale(scale: number): void {
    this.setScale(scale);
  }

  // Interakció újra beállítása (dev mode használja)
  public resetInteraction(): void {
    this.setupInteraction();
  }

  /**
   * Méretezett cursor beállítása - 20%-kal kisebb egérke száj
   */
  private setScaledCursor(canvas: HTMLCanvasElement, cursorFileName: string, scale: number): void {
    // Dinamikus canvas cursor készítése a megadott mérettel
    const img = new Image();
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        // Canvas méret beállítása a scale-elt méretre
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        
        // Kép rajzolása scale-elt méretben
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        
        // Cursor beállítása a scale-elt képpel - hotspot középen
        const hotspotX = scaledWidth / 2;  // Középpont X
        const hotspotY = scaledHeight / 2; // Középpont Y
        canvas.style.cursor = `url(${tempCanvas.toDataURL()}) ${hotspotX} ${hotspotY}, auto`;
        
        Logger.debug(`🖱️ Egérke száj cursor méretezve ${(scale * 100).toFixed(1)}%-ra: ${scaledWidth}x${scaledHeight}px`);
      }
    };
    
    img.src = `./minigame/images/${cursorFileName}`;
  }

}