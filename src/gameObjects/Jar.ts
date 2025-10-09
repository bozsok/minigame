import * as Phaser from 'phaser';
import { GameBalance } from '../config/GameBalance';

export class Jar extends Phaser.GameObjects.Container {
  private jarBody!: Phaser.GameObjects.Image;
  private jarLid!: Phaser.GameObjects.Image;
  private beanGrowth!: Phaser.GameObjects.Image;
  private jarIndex: number;
  private beanCount: number = 0;
  private isOpen: boolean = false;
  private isFull: boolean = false;
  private isDragEnabled: boolean = false;
  
  // Pozíciók - fedő pozíciói
  private lidClosedY: number = -57; // Fedő pozíciója zárt állapotban (üveg tetején)
  private lidOpenX: number = -50;   // Fedő X pozíciója nyitott állapotban (ellentétes oldal)
  private lidOpenY: number = 25;     // Fedő Y pozíciója nyitott állapotban (kicsit lejjebb)
  private lidOpenRotation: number = Math.PI / 2 + 0.3; // 90° + 17° (fedő teteje az üveg felé)

  constructor(scene: Phaser.Scene, x: number, y: number, jarIndex: number) {
    super(scene, x, y);
    this.jarIndex = jarIndex;

    this.createJarComponents();
    this.setupInteraction();
    
    // Z-index beállítása - üvegek előtérben legyenek
    this.setDepth(20); // Magasabb depth - előtérben
    
    scene.add.existing(this);
  }

  private createJarComponents(): void {
    // Üveg test
    this.jarBody = this.scene.add.image(0, 0, 'jar-body');
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
          // Teljes korsó befogadó terület
          const pitcherTopX = pitcher.x - pitcher.width * 0.6;
          const pitcherTopWidth = pitcher.width * 1.2;
          const pitcherTopY = pitcher.y - pitcher.height;
          const pitcherTopHeight = pitcher.height * 0.5;
          
          // Üveg alsó részének koordinátái
          const jarBottomY = this.y + this.jarBody.height * 0.4;
          
          const jarBottomInPitcherTop = (
            this.x >= pitcherTopX && 
            this.x <= pitcherTopX + pitcherTopWidth &&
            jarBottomY >= pitcherTopY && 
            jarBottomY <= pitcherTopY + pitcherTopHeight
          );
          
          if (jarBottomInPitcherTop) {
            pitcher.showGlow();
          } else {
            pitcher.hideGlow();
          }
        }
      }
    });

    this.on('dragstart', () => {
      this.setAlpha(0.8);
      this.setDepth(50); // Drag közben legfelülre
      console.log(`Jar ${this.jarIndex} drag kezdődött`);
    });

    this.on('dragend', () => {
      this.setAlpha(1);
      this.setDepth(20); // Visszaállítás eredeti depth-re
      
      // Pitcher glow kikapcsolása
      const gameScene = this.scene as any;
      if (gameScene.pitcher) {
        gameScene.pitcher.hideGlow();
      }
      
      // Itt ellenőrizzük, hogy a pitcher fölött van-e
      this.checkPitcherDrop();
    });
  }

  private checkPitcherDrop(): void {
    console.log(`Jar ${this.jarIndex} drag befejezve - pitcher drop ellenőrzés`);
    
    // Pitcher pozíció lekérése a GameScene-től
    const gameScene = this.scene as any;
    const pitcher = gameScene.pitcher;
    
    if (!pitcher) {
      console.log('Pitcher nem található');
      return;
    }
    
    // Ugyanaz az ellenőrzés, mint a proximity-nél
    // Teljes korsó befogadó terület (nagyobb és engedékenyebb)
    const pitcherTopX = pitcher.x - pitcher.width * 0.6; // Szélesebb befogadás
    const pitcherTopWidth = pitcher.width * 1.2; // Még szélesebb
    const pitcherTopY = pitcher.y - pitcher.height; // Teljes korsó teteje
    const pitcherTopHeight = pitcher.height * 0.5; // Fél korsó magasság
    
    // Üveg alsó részének koordinátái (üveg alja)
    const jarBottomY = this.y + this.jarBody.height * 0.4; // Üveg alja
    
    const jarBottomInPitcherTop = (
      this.x >= pitcherTopX && 
      this.x <= pitcherTopX + pitcherTopWidth &&
      jarBottomY >= pitcherTopY && 
      jarBottomY <= pitcherTopY + pitcherTopHeight
    );
    
    console.log(`Drop ellenőrzés - üveg alja érinti a korsót: ${jarBottomInPitcherTop}`);
    
    if (jarBottomInPitcherTop) {
      console.log('✅ Bedobás sikeres - üveg alja érinti a korsót!');
      pitcher.handleJarDrop(this);
    } else {
      console.log('❌ Bedobás sikertelen - üveg alja nem érinti a korsót');
    }
  }

  private checkPitcherProximity(): void {
    // Ellenőrizzük, hogy az üveg alja érinti-e a korsó felső részét
    const gameScene = this.scene as any;
    const pitcher = gameScene.pitcher;
    
    if (!pitcher) return;
    
    // Teljes korsó befogadó terület (nagyobb és engedékenyebb)
    const pitcherTopX = pitcher.x - pitcher.width * 0.6; // Szélesebb befogadás
    const pitcherTopWidth = pitcher.width * 1.2; // Még szélesebb
    const pitcherTopY = pitcher.y - pitcher.height; // Teljes korsó teteje
    const pitcherTopHeight = pitcher.height * 0.5; // Fél korsó magasság
    
    // Üveg alsó részének koordinátái (üveg alja)
    const jarBottomY = this.y + this.jarBody.height * 0.4; // Üveg alja
    
    // Üveg alja érinti-e a korsó felső területét
    const jarBottomInPitcherTop = (
      this.x >= pitcherTopX && 
      this.x <= pitcherTopX + pitcherTopWidth &&
      jarBottomY >= pitcherTopY && 
      jarBottomY <= pitcherTopY + pitcherTopHeight
    );
    
    console.log(`Jar pozíció: (${this.x.toFixed(1)}, ${this.y.toFixed(1)}), jar bottom: ${jarBottomY.toFixed(1)}`);
    console.log(`Pitcher area: x(${pitcherTopX.toFixed(1)}-${(pitcherTopX + pitcherTopWidth).toFixed(1)}), y(${pitcherTopY.toFixed(1)}-${(pitcherTopY + pitcherTopHeight).toFixed(1)})`);
    console.log(`Jar bottom in pitcher: ${jarBottomInPitcherTop}`);
    
    if (jarBottomInPitcherTop) {
      pitcher.showGlow();
      console.log('Glow bekapcsolva - üveg alja érinti a korsót');
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

  /**
   * Üveg villogtatása (figyelem felhívás)
   */
  public startBlinking(): void {
    // Villogtatás animáció - 3x villog
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 5, // 3x villog (6 fázis: le-fel-le-fel-le-fel)
      ease: 'Power2.easeInOut',
      onComplete: () => {
        this.setAlpha(1); // Eredeti átlátszóság visszaállítása
      }
    });

    console.log(`Jar ${this.jarIndex} villogtatás elindítva`);
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
    
    // Fedő visszaállítása eredeti pozícióba
    this.jarLid.setPosition(0, this.lidClosedY);
    this.jarLid.setRotation(0);
    this.jarLid.setAlpha(1);
    
    this.setAlpha(1);
    
    // Drag & drop letiltása
    this.scene.input.setDraggable(this, false);
  }
}