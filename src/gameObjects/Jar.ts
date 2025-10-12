import * as Phaser from 'phaser';
import { GameBalance } from '../config/GameBalance';
import { Logger } from '../utils/Logger';

export class Jar extends Phaser.GameObjects.Container {
  private jarBody!: Phaser.GameObjects.Image;
  private jarLid!: Phaser.GameObjects.Image;
  private beanGrowth!: Phaser.GameObjects.Image;
  private jarIndex: number;
  private beanCount: number = 0;
  private isOpen: boolean = false;
  private isFull: boolean = false;
  private isDragEnabled: boolean = false;
  private originalX: number = 0; // Eredeti X pozíció
  private originalY: number = 0; // Eredeti Y pozíció
  private isDragging: boolean = false; // Drag állapot figyelése
  private gameActive: boolean = true; // Játék interakció állapot
  private blinkingTween: Phaser.Tweens.Tween | null = null; // Villogó animáció referenciája
  
  // Pozíciók - fedő pozíciói
  private lidClosedY: number = -57; // Fedő pozíciója zárt állapotban (üveg tetején)
  private lidOpenX: number = -50;   // Fedő X pozíciója nyitott állapotban (ellentétes oldal)
  private lidOpenY: number = 25;     // Fedő Y pozíciója nyitott állapotban (kicsit lejjebb)
  private lidOpenRotation: number = Math.PI / 2 + 0.3; // 90° + 17° (fedő teteje az üveg felé)

  constructor(scene: Phaser.Scene, x: number, y: number, jarIndex: number) {
    super(scene, x, y);
    this.jarIndex = jarIndex;
    
    // Eredeti pozíció mentése
    this.originalX = x;
    this.originalY = y;

    this.createJarComponents();
    this.setupInteraction();
    
    // Z-index beállítása - üvegek babok felett legyenek
    this.setDepth(500); // Magas depth - babok felett
    
    scene.add.existing(this);
  }

  private createJarComponents(): void {
    // Üveg test
    this.jarBody = this.scene.add.image(0, 0, 'jar-body');
    
    // PreFX padding beállítása a glow effekt számára
    if (this.jarBody.preFX) {
      this.jarBody.preFX.setPadding(32);
    }
    
    this.add(this.jarBody);

    // Üveg fedő (kezdetben zárt pozícióban - üveg tetején)
    this.jarLid = this.scene.add.image(0, this.lidClosedY, 'jar-lid');
    this.add(this.jarLid);

    // Bean growth sprite (az üveg belsejében, középen) - 68x92px eredeti méret
    this.beanGrowth = this.scene.add.image(0, 10, 'bean-growth');
    this.beanGrowth.setVisible(false);
    this.beanGrowth.setFrame(0); // Kezdő fázis
    // Nincs scale - eredeti 68x92px méret, üveg méretéhez készítve
    this.add(this.beanGrowth);
  }

  private setupInteraction(): void {
    // Dupla klikk interakció beállítása
    this.setSize(this.jarBody.width, this.jarBody.height);
    this.setInteractive();

    let clickCount = 0;
    let clickTimer: Phaser.Time.TimerEvent | null = null;

    this.on('pointerdown', () => {
      clickCount++;

      if (clickCount === 1) {
        // Első klikk - timer indítása dupla klikk detektálásához
        clickTimer = this.scene.time.delayedCall(300, () => {
          // Ha 300ms múlva még nincs második klikk, akkor egyszeres klikk volt
          clickCount = 0;
        });
      } else if (clickCount === 2) {
        // GAME ACTIVE ELLENŐRZÉS - dupla klikk előtt
        if (!this.gameActive) {
          console.log(`🚫 Jar ${this.jarIndex} dupla-klikk TILTVA - játék inaktív`);
          clickCount = 0;
          if (clickTimer) {
            clickTimer.destroy();
            clickTimer = null;
          }
          return;
        }

        // Dupla klikk detektálva
        if (clickTimer) {
          clickTimer.destroy();
          clickTimer = null;
        }
        clickCount = 0;
        this.handleDoubleClick();
      }
    });
  }

  private handleDoubleClick(): void {
    if (!this.isFull && !this.isOpen) {
      // Üveg kinyitása (ha még nem tele és nem nyitott)
      this.openJar();
    } else if (this.isFull && this.isOpen) {
      // Üveg lezárása (ha tele van és nyitott)
      this.closeJar();
    }
  }

  private openJar(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    
    // VILLOGÁS LEÁLLÍTÁSA - az üveg kinyitásakor
    this.stopBlinking();
    
    // Fedő animálása: előbb felfelé eltűnik, majd oldalt megjelenik
    const lid = this.jarLid;
    
    // 1. fázis: Fedő eltűnése felfelé
    this.scene.tweens.add({
      targets: lid,
      y: this.lidClosedY - 30, // Még fentebb eltűnés
      alpha: 0,
      duration: 200,
      ease: 'Power2.easeIn',
      onComplete: () => {
        // 2. fázis: Fedő megjelenése az ellentétes oldalon
        lid.setPosition(this.lidOpenX, this.lidOpenY);
        lid.setRotation(this.lidOpenRotation); // Kicsit megdöntve az üveg felé
        
        this.scene.tweens.add({
          targets: lid,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      }
    });

    console.log(`Jar ${this.jarIndex} kinyitva - fedő oldalra`);
  }

  private closeJar(): void {
    if (!this.isOpen || !this.isFull) return;

    this.isOpen = false;
    this.isDragEnabled = true; // Teli és zárt üveg drag-elhető
    
    // Fedő animálása: oldalról vissza a tetejére
    const lid = this.jarLid;
    
    // 1. fázis: Fedő eltűnése az oldalról
    this.scene.tweens.add({
      targets: lid,
      alpha: 0,
      duration: 200,
      ease: 'Power2.easeIn',
      onComplete: () => {
        // 2. fázis: Fedő visszahelyezése a tetejére
        lid.setPosition(0, this.lidClosedY - 30); // Fentről indulás
        lid.setRotation(0); // Eredeti forgatás visszaállítása
        
        this.scene.tweens.add({
          targets: lid,
          y: this.lidClosedY,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut',
          onComplete: () => {
            this.enableDragAndDrop();
          }
        });
      }
    });

    console.log(`Jar ${this.jarIndex} lezárva - fedő visszahelyezve tetejére`);
  }

  private enableDragAndDrop(): void {
    if (!this.isDragEnabled) return;

    // Drag & drop beállítása
    this.scene.input.setDraggable(this);

    // Cursor kezelés hover-re
    this.on('pointerover', () => {
      if (this.isDragEnabled && !this.isDragging && this.gameActive) {
        const canvas = this.scene.game.canvas;
        if (canvas) {
          canvas.style.cursor = 'grab';
        }
      }
    });

    this.on('pointerout', () => {
      if (!this.isDragging) {
        const canvas = this.scene.game.canvas;
        if (canvas) {
          canvas.style.cursor = 'default';
        }
      }
    });
    
    this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      this.setPosition(dragX, dragY);
      
      // Valós idejű pitcher közelség ellenőrzése (minden 10. frame-en)
      if (Math.random() < 0.1) { // Csak 10%-ban logoljon
        this.checkPitcherProximity();
      } else {
        // Csendes proximity check - ugyanazzal a logikával
        const gameScene = this.scene as any;
        const pitcher = gameScene.pitcher;
        if (pitcher) {
          // TELJES KORSÓ BEFOGADÓ TERÜLET - KONZISZTENS A ZONE-NAL
          const dropZoneWidth = pitcher.width * 1.2;  
          const dropZoneHeight = pitcher.height;      
          
          // Zone középpont számítás - pitcher origin (1,1) jobb alsó sarok!
          const zoneCenterX = pitcher.x - (pitcher.width / 2); 
          const zoneCenterY = pitcher.y - (pitcher.height / 2); 
          
          // Zone határok számítása
          const zoneLeft = zoneCenterX - dropZoneWidth/2;
          const zoneRight = zoneCenterX + dropZoneWidth/2;
          const zoneTop = zoneCenterY - dropZoneHeight/2;
          const zoneBottom = zoneCenterY + dropZoneHeight/2;
          
          const jarInZone = (
            this.x >= zoneLeft && 
            this.x <= zoneRight &&
            this.y >= zoneTop && 
            this.y <= zoneBottom
          );
          
          // Csak akkor változtassuk a glow-t, ha NEM drag állapotban vagyunk
          if (!this.isDragging) {
            if (jarInZone) {
              pitcher.showGlow();
            } else {
              pitcher.hideGlow();
            }
          }
          // Drag közben a glow végig BE marad (dragstart-ban bekapcsolt)
        }
      }
    });

    this.on('dragstart', () => {
      // GAME ACTIVE ELLENŐRZÉS - drag kezdés előtt
      if (!this.gameActive) {
        console.log(`🚫 Jar ${this.jarIndex} drag TILTVA - játék inaktív`);
        return;
      }

      this.isDragging = true; // Drag állapot bekapcsolása
      this.setAlpha(0.8);
      this.setDepth(1000); // Drag közben legfelülre
      
      // Grabbing cursor drag közben
      const canvas = this.scene.game.canvas;
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }
      
      // Pitcher glow bekapcsolása, hogy jelezzük hová kell húzni
      const gameScene = this.scene as any;
      if (gameScene.pitcher) {
        gameScene.pitcher.showGlow();
      }
      
      // Eredeti pozíció mentése a visszatéréshez
      this.saveOriginalPosition();
      
      console.log(`Jar ${this.jarIndex} drag kezdődött - pitcher glow bekapcsolva és védve`);
    });

    this.on('dragend', () => {
      this.isDragging = false; // Drag állapot kikapcsolása
      this.setAlpha(1);
      this.setDepth(500); // Visszaállítás eredeti depth-re
      
      // Vissza default cursor-ra (dragend után)
      const canvas = this.scene.game.canvas;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
      
      // Pitcher glow kikapcsolása
      const gameScene = this.scene as any;
      if (gameScene.pitcher) {
        gameScene.pitcher.hideGlow();
      }
      
      // Ellenőrizzük, hogy a pitcher fölött van-e
      const pitcherDropSuccess = this.checkPitcherDrop();
      
      // Ha nem került be a pitcher-be, visszatérés eredeti pozícióba
      if (!pitcherDropSuccess) {
        this.returnToOriginalPosition();
      }
    });
  }

  private checkPitcherDrop(): boolean {
    console.log(`Jar ${this.jarIndex} drag befejezve - pitcher drop ellenőrzés`);
    
    // Pitcher pozíció lekérése a GameScene-től
    const gameScene = this.scene as any;
    const pitcher = gameScene.pitcher;
    
    if (!pitcher) {
      console.log('Pitcher nem található');
      return false;
    }
    
    // TELJES KORSÓ BEFOGADÓ TERÜLET - KONZISZTENS A ZONE-NAL
    const dropZoneWidth = pitcher.width * 1.2;  
    const dropZoneHeight = pitcher.height;      
    
    // Zone középpont számítás - pitcher origin (1,1) jobb alsó sarok!
    const zoneCenterX = pitcher.x - (pitcher.width / 2); 
    const zoneCenterY = pitcher.y - (pitcher.height / 2); 
    
    // Zone határok számítása
    const zoneLeft = zoneCenterX - dropZoneWidth/2;
    const zoneRight = zoneCenterX + dropZoneWidth/2;
    const zoneTop = zoneCenterY - dropZoneHeight/2;
    const zoneBottom = zoneCenterY + dropZoneHeight/2;
    
    // Üveg pozíció ellenőrzése (üveg közepe)
    const jarBottomInPitcher = (
      this.x >= zoneLeft && 
      this.x <= zoneRight &&
      this.y >= zoneTop && 
      this.y <= zoneBottom
    );
    
    console.log(`🎯 Drop ellenőrzés:`);
    console.log(`  Üveg: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`);
    console.log(`  Zone: left=${zoneLeft.toFixed(1)}, right=${zoneRight.toFixed(1)}, top=${zoneTop.toFixed(1)}, bottom=${zoneBottom.toFixed(1)}`);
    console.log(`  Pitcher: (${pitcher.x.toFixed(1)}, ${pitcher.y.toFixed(1)}) origin(1,1)`);
    console.log(`  ÜvegInZone: ${jarBottomInPitcher}`);
    
    if (jarBottomInPitcher) {
      console.log('✅ Bedobás sikeres - üveg alja érinti a korsót!');
      pitcher.handleJarDrop(this);
      return true;
    } else {
      console.log('❌ Bedobás sikertelen - üveg alja nem érinti a korsót');
      return false;
    }
  }

  private checkPitcherProximity(): void {
    // Ellenőrizzük, hogy az üveg alja érinti-e a teljes korsót
    const gameScene = this.scene as any;
    const pitcher = gameScene.pitcher;
    
    if (!pitcher) return;
    
    // Ha éppen drag-elünk, ne változtassuk a pitcher glow-t
    if (this.isDragging) return;
    
    // TELJES KORSÓ BEFOGADÓ TERÜLET - KONZISZTENS A ZONE-NAL  
    const dropZoneWidth = pitcher.width * 1.2;  
    const dropZoneHeight = pitcher.height;      
    
    // Zone középpont számítás - pitcher origin (1,1) jobb alsó sarok!
    const zoneCenterX = pitcher.x - (pitcher.width / 2); 
    const zoneCenterY = pitcher.y - (pitcher.height / 2); 
    
    // Zone határok számítása
    const zoneLeft = zoneCenterX - dropZoneWidth/2;
    const zoneRight = zoneCenterX + dropZoneWidth/2;
    const zoneTop = zoneCenterY - dropZoneHeight/2;
    const zoneBottom = zoneCenterY + dropZoneHeight/2;
    
    // Üveg pozíció ellenőrzése (üveg közepe)
    const jarInZone = (
      this.x >= zoneLeft && 
      this.x <= zoneRight &&
      this.y >= zoneTop && 
      this.y <= zoneBottom
    );
    
    console.log(`🎯 Proximity check:`);
    console.log(`  Üveg: (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`);
    console.log(`  Zone: left=${zoneLeft.toFixed(1)}, right=${zoneRight.toFixed(1)}, top=${zoneTop.toFixed(1)}, bottom=${zoneBottom.toFixed(1)}`);
    console.log(`  ÜvegInZone: ${jarInZone}`);
    
    if (jarInZone) {
      pitcher.showGlow();
      console.log('Glow bekapcsolva - üveg a drop zone-ban');
    } else {
      pitcher.hideGlow();
    }
  }

  /**
   * Bab hozzáadása az üveghez (csak ha nyitott)
   */
  public addBean(): boolean {
    if (!this.isOpen || this.isFull) {
      return false; // Nem lehet bab hozzáadni
    }

    this.beanCount++;
    this.updateBeanGrowthVisual();

    // Ellenőrizzük, hogy tele van-e
    if (this.beanCount >= GameBalance.jar.beansPerJar) {
      this.isFull = true;
      console.log(`Jar ${this.jarIndex} megtelt! (${this.beanCount} bab)`);
    }

    return true; // Sikeresen hozzáadva
  }

  private updateBeanGrowthVisual(): void {
    // Fázis számítása (0-4) - csak 10 bab után jelenjen meg
    if (this.beanCount < GameBalance.jar.beansPerPhase) {
      // Még nincs 10 bab - láthatatlan
      this.beanGrowth.setVisible(false);
      return;
    }

    // 10+ bab esetén megjelenítjük a megfelelő fázist
    const phase = Math.min(4, Math.floor(this.beanCount / GameBalance.jar.beansPerPhase) - 1);
    this.beanGrowth.setVisible(true);
    this.beanGrowth.setFrame(phase);

    console.log(`Jar ${this.jarIndex}: ${this.beanCount} bab, fázis ${phase} (${phase + 1}. sprite frame)`);
  }

  /**
   * Getters
   */
  public getBeanCount(): number {
    return this.beanCount;
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public getIsFull(): boolean {
    return this.isFull;
  }

  public getJarIndex(): number {
    return this.jarIndex;
  }

  public getIsDragEnabled(): boolean {
    return this.isDragEnabled;
  }

  private saveOriginalPosition(): void {
    // Aktuális pozíció mentése (ha mozgatták már drag nélkül)
    this.originalX = this.x;
    this.originalY = this.y;
  }

  private returnToOriginalPosition(): void {
    // Smooth animáció vissza az eredeti pozícióhoz
    this.scene.tweens.add({
      targets: this,
      x: this.originalX,
      y: this.originalY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    console.log(`Jar ${this.jarIndex} visszatér eredeti pozícióba: (${this.originalX}, ${this.originalY})`);
  }

  /**
   * Üveg villogtatása (figyelem felhívás)
   */
  public startBlinking(): void {
    // ELŐZŐ VILLOGÁS LEÁLLÍTÁSA - ha már villogott
    this.stopBlinking();
    
    // Villogtatás animáció - folyamatos, amíg le nem állítják
    this.blinkingTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: -1, // Végtelen ismétlés
      ease: 'Power2.easeInOut'
    });

    console.log(`Jar ${this.jarIndex} villogtatás elindítva`);
  }
  
  /**
   * Üveg villogtatásának leállítása
   */
  public stopBlinking(): void {
    if (this.blinkingTween) {
      this.blinkingTween.stop();
      this.blinkingTween = null;
    }
    this.setAlpha(1); // Eredeti átlátszóság visszaállítása
    console.log(`Jar ${this.jarIndex} villogítás leállítva`);
  }

  /**
   * Jar reset (új játékhoz)
   */
  public reset(): void {
    this.beanCount = 0;
    this.isOpen = false;
    this.isFull = false;
    this.isDragEnabled = false;
    this.beanGrowth.setVisible(false);
    
    // VILLOGÁS LEÁLLÍTÁSA reset-nél
    this.stopBlinking();
    
    // Fedő visszaállítása eredeti pozícióba
    this.jarLid.setPosition(0, this.lidClosedY);
    this.jarLid.setRotation(0);
    this.jarLid.setAlpha(1);
    
    this.setAlpha(1);
    
    // Drag & drop letiltása
    this.scene.input.setDraggable(this, false);
  }

  /**
   * Játék interakció állapot beállítása
   */
  public setGameActive(active: boolean): void {
    this.gameActive = active;
    
    // Ha a játék inaktív, tiltjuk le az összes interakciót
    if (!active) {
      // Drag & drop teljes letiltása
      if (this.scene && this.scene.input) {
        this.scene.input.setDraggable(this, false);
      }
      
      // Cursor visszaállítása default-ra
      const canvas = this.scene.game.canvas;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
      
      // Villogás leállítása
      this.stopBlinking();
      
      console.log(`🚫 Jar ${this.jarIndex} összes interakció LETILTVA - játék vége`);
    } else {
      // Ha a játék aktív és az üveg drag-elhető, visszakapcsoljuk a drag-et
      if (this.isDragEnabled) {
        this.enableDragAndDrop();
      }
      
      console.log(`✅ Jar ${this.jarIndex} interakciók VISSZAKAPCSOLVA`);
    }
  }

  /**
   * Játék interakció állapot lekérdezése
   */
  public isGameActive(): boolean {
    return this.gameActive;
  }

  /**
   * JarBody elérhetővé tétele a JarManager számára (glow effekt alkalmazásához)
   */
  public getJarBody(): Phaser.GameObjects.Image {
    return this.jarBody;
  }
}