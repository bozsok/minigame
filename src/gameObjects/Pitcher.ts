import * as Phaser from 'phaser';

export class Pitcher extends Phaser.GameObjects.Image {
  private dropZone!: Phaser.GameObjects.Zone;
  private jarCount: number = 0; // Hány üveg került bele
  private glowEffect!: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pitcher');
    
    this.setupPitcher();
    this.createGlowEffect();
    this.createDropZone();
    
    scene.add.existing(this);
  }

  private setupPitcher(): void {
    // Pitcher pozicionálása jobb alsó sarokba
    this.setOrigin(1, 1); // Jobb alsó sarok anchor point
    
    // Z-index beállítása - pitcher háttérben legyen
    this.setDepth(10); // Alacsony depth - háttérben
    
    console.log('Pitcher létrehozva pozíción:', this.x, this.y);
  }

  private createGlowEffect(): void {
    // Glow effect kör a pitcher körül
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.setDepth(5); // Pitcher alatt, de háttér felett
    this.glowEffect.setVisible(false); // Kezdetben láthatatlan
    
    // Animált glow rajzolása
    this.updateGlowEffect();
  }

  private updateGlowEffect(): void {
    this.glowEffect.clear();
    
    // Sárga-arany glow színek
    this.glowEffect.lineStyle(8, 0xFFD700, 0.8); // Arany szín, átlátszó
    this.glowEffect.strokeCircle(this.x - this.width/2, this.y - this.height/2, this.width * 0.6);
    
    this.glowEffect.lineStyle(4, 0xFFF700, 0.6); // Világosabb sárga
    this.glowEffect.strokeCircle(this.x - this.width/2, this.y - this.height/2, this.width * 0.7);
  }

  public showGlow(): void {
    if (this.glowEffect.visible) return; // Már be van kapcsolva
    
    this.glowEffect.setVisible(true);
    this.glowEffect.setAlpha(1);
    
    // Pulzáló animáció
    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    console.log('Pitcher glow effect bekapcsolva');
  }

  public hideGlow(): void {
    if (!this.glowEffect.visible) return; // Már ki van kapcsolva
    
    this.glowEffect.setVisible(false);
    this.scene.tweens.killTweensOf(this.glowEffect);
    this.glowEffect.setAlpha(1);
    
    console.log('Pitcher glow effect kikapcsolva');
  }

  private createDropZone(): void {
    // Drop zone létrehozása a pitcher körül (kisebb, pontosabb terület)
    const dropZoneWidth = this.width * 0.8;  // Kisebb, csak a pitcher belseje
    const dropZoneHeight = this.height * 0.6; // Csak a felső rész (szája)
    
    this.dropZone = this.scene.add.zone(
      this.x - this.width / 2, 
      this.y - this.height / 2, 
      dropZoneWidth, 
      dropZoneHeight
    );
    
    this.dropZone.setRectangleDropZone(dropZoneWidth, dropZoneHeight);
    
    // Debug vizualizáció eltávolítva - clean UI

    // Drop zone események
    this.dropZone.on('drop', (pointer: Phaser.Input.Pointer, gameObject: any) => {
      this.handleJarDrop(gameObject);
    });
  }

  public handleJarDrop(jar: any): void {
    // Ellenőrizzük, hogy valóban Jar objektum-e és drag-elhető-e
    if (!jar || typeof jar.getIsDragEnabled !== 'function' || !jar.getIsDragEnabled()) {
      console.log('Pitcher: Helytelen objektum vagy nem drag-elhető jar');
      return;
    }

    // Ellenőrizzük, hogy tele van-e és zárt-e
    if (!jar.getIsFull() || jar.getIsOpen()) {
      console.log('Pitcher: Jar nem tele vagy nyitott - visszahelyezés');
      this.returnJarToOriginalPosition(jar);
      return;
    }

    // Sikeres drop - jar elfogadása
    this.acceptJar(jar);
  }

  private acceptJar(jar: any): void {
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

    console.log(`Pitcher: Jar ${jar.getJarIndex()} elfogadva! Összesen: ${this.jarCount}`);
    
    // Event küldése a GameScene-nek
    this.scene.events.emit('jar-delivered-to-pitcher', {
      jarIndex: jar.getJarIndex(),
      totalJarsInPitcher: this.jarCount
    });

    // Ellenőrizzük, hogy mind az 5 üveg benne van-e
    if (this.jarCount >= 5) {
      this.scene.events.emit('all-jars-delivered');
      console.log('Pitcher: Mind az 5 üveg leadva - játék befejezve!');
    }
  }

  private returnJarToOriginalPosition(jar: any): void {
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

    console.log(`Pitcher: Jar ${jar.getJarIndex()} visszahelyezve eredeti pozícióba`);
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
    console.log('Pitcher: Reset complete');
  }

  /**
   * Drop zone pozíció frissítése (ha a pitcher mozog)
   */
  public updateDropZonePosition(x: number, y: number): void {
    this.setPosition(x, y);
    this.dropZone.setPosition(x - this.width / 2, y - this.height / 2);
    
    // Glow effect pozíció frissítése
    this.updateGlowEffect();
  }

  /**
   * Skálázás és pozíció frissítése egyszerre
   * VALÓS ARÁNYOSÍTÁS: Fullscreen (1.0) vagy valós canvas arány
   */
  public updateScaleAndPosition(gameScale: number, gameWidth: number, gameHeight: number): void {
    const isFullscreen = gameScale >= 1.0;
    console.log(`🍺 Pitcher ${isFullscreen ? 'FULLSCREEN' : 'ABLAKOS'} skálázás: ${gameScale.toFixed(3)}`);
    
    // TELJESEN jobb alsó sarok - nincs offset!
    let newX: number;
    let newY: number;
    
    if (isFullscreen) {
      // Fullscreen: teljesen jobb alsó sarok, natív méret
      newX = gameWidth;
      newY = gameHeight;
      this.setScale(1.0);
    } else {
      // Ablakos: teljesen jobb alsó sarok, valós arányosítás
      newX = gameWidth;
      newY = gameHeight;
      this.setScale(gameScale); // Valós arányosítás használata
    }
    
    // Pozíció frissítése
    this.setPosition(newX, newY);
    this.dropZone.setPosition(newX - this.width / 2, newY - this.height / 2);
    
    // Glow effect frissítése
    this.updateGlowEffect();
    
    console.log(`🍺 Pitcher: ${isFullscreen ? 'nagy' : 'arányos'} méret, pozíció (${newX.toFixed(1)}, ${newY.toFixed(1)})`);
  }
}