import * as Phaser from 'phaser';
import { Logger } from '../utils/Logger';
import { Jar } from './Jar';

export class Pitcher extends Phaser.GameObjects.Image {
  private dropZone!: Phaser.GameObjects.Zone;
  private jarCount: number = 0; // Hány üveg került bele
  private glowFX: any = null; // PreFX Glow effect referencia
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pitcher');
    
    this.setupPitcher();
    this.setupPreFXGlow();
    this.createDropZone();
    
    scene.add.existing(this);
  }

  private setupPitcher(): void {
    // Pitcher pozicionálása jobb alsó sarokba
    this.setOrigin(1, 1); // Jobb alsó sarok anchor point
    
    // Z-index beállítása - pitcher háttérben legyen
    this.setDepth(10); // Alacsony depth - háttérben
    
    Logger.debug('Pitcher létrehozva pozíción:', this.x, this.y);
  }

  private setupPreFXGlow(): void {
    // PreFX padding beállítása a glow effekt számára
    if (this.preFX) {
      this.preFX.setPadding(32);
    }
  }

  public showGlow(): void {
    if (this.glowFX) return; // Már be van kapcsolva
    
    // PreFX glow hozzáadása
    if (this.preFX) {
      this.glowFX = this.preFX.addGlow();
      
      // KRITIKUS: Kezdeti strength 0-ra állítása a felvillanás elkerülésére
      this.glowFX.outerStrength = 0;
      
      // Smooth fade-in animáció 0-ról 4-re
      this.scene.tweens.add({
        targets: this.glowFX,
        outerStrength: 4,
        duration: 300,
        ease: 'sine.out',
        onComplete: () => {
          // Folyamatos pulzálás
          this.scene.tweens.add({
            targets: this.glowFX,
            outerStrength: 2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inout'
          });
        }
      });
    }
    
    Logger.debug('Pitcher PreFX glow effect bekapcsolva');
  }

  public hideGlow(): void {
    if (!this.glowFX) return; // Már ki van kapcsolva
    
    // Összes tween leállítása
    this.scene.tweens.killTweensOf(this.glowFX);
    
    // Smooth fade out
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
    
    Logger.debug('Pitcher PreFX glow effect kikapcsolva');
  }

  private createDropZone(): void {
    // Drop zone létrehozása a pitcher körül (TELJES KORSÓ BEFOGADÓ TERÜLET)
    const dropZoneWidth = this.width * 1.2;  // Szélesebb befogadás
    const dropZoneHeight = this.height;      // TELJES korsó magasság
    
    // KRITIKUS: Zone középpont számítás - pitcher origin (1,1) jobb alsó sarok!
    const zoneCenterX = this.x - (this.width / 2); // Pitcher közepére
    const zoneCenterY = this.y - (this.height / 2); // Pitcher közepére
    
    this.dropZone = this.scene.add.zone(
      zoneCenterX, 
      zoneCenterY, 
      dropZoneWidth, 
      dropZoneHeight
    );
    
    this.dropZone.setRectangleDropZone(dropZoneWidth, dropZoneHeight);
    
    // Drop zone sikeresen létrehozva - clean UI
    Logger.debug(`🎯 Drop zone létrehozva: center(${zoneCenterX}, ${zoneCenterY}), size(${dropZoneWidth}x${dropZoneHeight})`);

    // Drop zone események
    this.dropZone.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Jar) => {
      this.handleJarDrop(gameObject);
    });
  }

  public handleJarDrop(jar: Jar): void {
    // Ellenőrizzük, hogy valóban Jar objektum-e és drag-elhető-e
    if (!jar || typeof jar.getIsDragEnabled !== 'function' || !jar.getIsDragEnabled()) {
      Logger.debug('Pitcher: Helytelen objektum vagy nem drag-elhető jar');
      return;
    }

    // Ellenőrizzük, hogy tele van-e és zárt-e
    if (!jar.getIsFull() || jar.getIsOpen()) {
      Logger.debug('Pitcher: Jar nem tele vagy nyitott - visszahelyezés');
      this.returnJarToOriginalPosition(jar);
      return;
    }

    // Sikeres drop - jar elfogadása
    this.acceptJar(jar);
  }

  private acceptJar(jar: Jar): void {
    this.jarCount++;
    
    // Jar "esés" animációja a pitcher-be
    this.scene.tweens.add({
      targets: jar,
      y: jar.y + 100,        // Lefelé esés
      scale: 0.7,           // Kicsinyítés (távolodás hatás)
      alpha: 0,             // Eltűnés
      rotation: jar.rotation + 0.5, // Kis forgatás esés közben
      duration: 600,
      ease: 'Power2.easeIn', // Gyorsuló esés
      onComplete: () => {
        jar.destroy();
      }
    });

    Logger.debug(`Pitcher: Jar ${jar.getJarIndex()} elfogadva! Összesen: ${this.jarCount}`);
    
    // Event küldése a GameScene-nek
    this.scene.events.emit('jar-delivered-to-pitcher', {
      jarIndex: jar.getJarIndex(),
      totalJarsInPitcher: this.jarCount
    });

    // Ellenőrizzük, hogy mind az 5 üveg benne van-e
    if (this.jarCount >= 5) {
      this.scene.events.emit('all-jars-delivered');
    Logger.info('Pitcher: Mind az 5 üveg leadva - játék befejezve!');
    }
  }

  private returnJarToOriginalPosition(jar: Jar): void {
    // Jar visszahelyezése az eredeti pozíciójába (JarManager konstansok alapján)
    const originalX = 80 + (jar.getJarIndex() * (60 + 50)); // startX + index * (jarWidth + spacing)
    const originalY = 100;

    this.scene.tweens.add({
      targets: jar,
      x: originalX,
      y: originalY,
      duration: 300,
      ease: 'Power2.easeOut'
    });

    Logger.debug(`Pitcher: Jar ${jar.getJarIndex()} visszahelyezve eredeti pozícióba`);
  }

  /**
   * Pitcher információk
   */
  public getJarCount(): number {
    return this.jarCount;
  }

  public getDropZoneBounds(): Phaser.Geom.Rectangle {
    return this.dropZone.getBounds();
  }

  /**
   * Pitcher reset (új játékhoz)
   */
  public reset(): void {
    this.jarCount = 0;
    Logger.debug('Pitcher: Reset complete');
  }

  /**
   * Drop zone pozíció frissítése (ha a pitcher mozog)
   */
  public updateDropZonePosition(x: number, y: number): void {
    this.setPosition(x, y);
    this.dropZone.setPosition(x - this.width / 2, y - this.height / 2);
    
    // PreFX automatikusan követi a sprite pozíciót
  }

  /**
   * Skálázás és pozíció frissítése egyszerre
   * VALÓS ARÁNYOSÍTÁS: Fullscreen (1.0) vagy valós canvas arány
   */
  public updateScaleAndPosition(gameScale: number, gameWidth: number, gameHeight: number): void {
    // EREDETI pozicionálás: jobb alsó sarok
    const newX = gameWidth;   // Jobb szél
    const newY = gameHeight;  // Alsó szél
    
    // Canvas skálázás számítása
    const baseWidth = 1920;
    const baseHeight = 1080;
    const canvasScale = Math.min(gameWidth / baseWidth, gameHeight / baseHeight);
    
    // Méret skálázás: teljes = zoom kompenzáció, ablakos = canvas skálázás
    const currentZoom = window.devicePixelRatio || 1;
    const zoomCompensation = 1 / currentZoom;
    
    // Ablakos mód észlelése: ha canvas jelentősen kisebb mint design felbontás
    const isWindowedMode = gameWidth < 1200; // 1536-nál kisebb = ablakos
    const finalScale = isWindowedMode ? 
        canvasScale :               // Ablakos: csak canvas skálázás
        zoomCompensation;           // Teljes: csak zoom skálázás
    
    // Pozíció és méret frissítése
    this.setPosition(newX, newY);
    this.setScale(finalScale);
    
    // DropZone frissítése (kombinált skálázással számolva)
    this.dropZone.setPosition(newX - (this.width * finalScale) / 2, newY - (this.height * finalScale) / 2);
    
    // PreFX automatikusan követi a sprite pozíciót és skálázást
  }
}