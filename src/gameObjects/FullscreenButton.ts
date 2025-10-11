/**
 * FullscreenButton - Teljesképernyős mód váltás kezelése
 * tm.png (Teljes Mód) és em.png (Eredeti Méretre) képek közötti váltás
 */
export class FullscreenButton extends Phaser.GameObjects.Image {
  private isFullscreen: boolean = false;
  private gameConfig: { width: number; height: number };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'tm'); // Kezdetben tm.png (Teljes Mód)

    // Hozzáadjuk a scene-hez
    scene.add.existing(this);

    // Eredeti játék méret mentése
    this.gameConfig = {
      width: scene.scale.width,
      height: scene.scale.height
    };

    this.setupInteraction();
    this.setupFullscreenListeners();
  }

  /**
   * Interakció beállítása
   */
  private setupInteraction(): void {
    this.setInteractive({ useHandCursor: false }); // Egységes custom cursor
    
    // Hover effekt
    this.on('pointerover', () => {
      this.setTint(0xcccccc);
      this.setScale(1.1);
    });

    this.on('pointerout', () => {
      this.clearTint();
      this.setScale(1.0);
    });

    // Kattintás kezelés
    this.on('pointerdown', () => {
      this.toggleFullscreen();
    });
  }

  /**
   * Böngésző fullscreen eseményeinek figyelése
   */
  private setupFullscreenListeners(): void {
    // Böngésző fullscreen változás figyelése
    document.addEventListener('fullscreenchange', () => {
      this.handleFullscreenChange();
    });

    document.addEventListener('webkitfullscreenchange', () => {
      this.handleFullscreenChange();
    });

    document.addEventListener('mozfullscreenchange', () => {
      this.handleFullscreenChange();
    });

    document.addEventListener('MSFullscreenChange', () => {
      this.handleFullscreenChange();
    });

    // ESC billentyű kezelése
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        console.log('ESC billentyű lenyomva - fullscreen check...');
        // Kis késleltetés hogy a böngésző feldolgozza az ESC-et
        setTimeout(() => {
          this.handleFullscreenChange();
        }, 100);
      }
    });
  }

  /**
   * Teljesképernyős mód váltása
   */
  private async toggleFullscreen(): Promise<void> {
    try {
      // Aktuális állapot ellenőrzése a DOM-ból
      const currentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      console.log(`Toggle fullscreen: jelenlegi állapot=${currentlyFullscreen}`);

      if (!currentlyFullscreen) {
        // Teljesképernyős módba váltás
        console.log('Belépés teljesképernyős módba...');
        await this.enterFullscreen();
      } else {
        // Kilépés a teljesképernyős módból
        console.log('Kilépés teljesképernyős módból...');
        await this.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen váltás hiba:', error);
    }
  }

  /**
   * Belépés teljesképernyős módba
   */
  private async enterFullscreen(): Promise<void> {
    // Megpróbáljuk a game container-t teljesképernyőssé tenni
    const gameContainer = document.getElementById('game-container');
    const element = gameContainer || document.documentElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }
  }

  /**
   * Kilépés teljesképernyős módból
   */
  private async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }
  }

  /**
   * Fullscreen állapot változás kezelése
   */
  private handleFullscreenChange(): void {
    // Ellenőrizzük hogy a gomb még létezik és aktív scene-ben van
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) {
      console.log('FullscreenButton: Scene nem aktív, kihagyás...');
      return;
    }

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    this.isFullscreen = isCurrentlyFullscreen;

    // Ikon váltása és méretezés
    try {
      if (this.isFullscreen) {
        this.setTexture('em'); // Exit Mód (em.png)
        // Kis késleltetés hogy a böngésző befejezze a fullscreen váltást
        setTimeout(() => {
          this.scaleToFullscreen();
        }, 100);
      } else {
        this.setTexture('tm'); // Teljes Mód (tm.png)
        setTimeout(() => {
          this.scaleToOriginal();
        }, 100);
      }

    } catch (error) {
      console.log('FullscreenButton texture update hiba:', error);
    }
  }

  /**
   * Játék skálázása teljesképernyős módra
   */
  private scaleToFullscreen(): void {
    // Teljes képernyő méret lekérése
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Canvas teljesképernyős méretre állítása
    const canvas = this.scene.scale.canvas;
    if (canvas) {
      canvas.style.width = `${screenWidth}px`;
      canvas.style.height = `${screenHeight}px`;
      canvas.style.position = 'absolute';
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.borderRadius = '0px'; // Teljesképernyőn nincs lekerekítés
    }

    // Phaser scale manager használata
    this.scene.scale.setGameSize(screenWidth, screenHeight);
    
    // Gomb pozíció frissítése (jobb felső sarok)
    this.setPosition(screenWidth - 40, 40);

    // GameScene handleResize direkt hívása AZONNAL
    if ((this.scene as any).handleResize) {
      (this.scene as any).handleResize(screenWidth, screenHeight);
    } else {
      // Alternatíva: próbáljuk meg közvetlenül a háttér frissítést
      if ((this.scene as any).background && (this.scene as any).updateBackgroundSizeWithDimensions) {
        console.log('Alternatív háttér frissítés...');
        (this.scene as any).updateBackgroundSizeWithDimensions((this.scene as any).background, screenWidth, screenHeight);
      }
    }

    // Scene resize esemény trigger is
    this.scene.events.emit('resize', { width: screenWidth, height: screenHeight });

    // Még egy próbálkozás 50ms múlva
    setTimeout(() => {
      if ((this.scene as any).handleResize) {
        (this.scene as any).handleResize(screenWidth, screenHeight);
      }
    }, 50);
  }

  /**
   * Játék visszaskálázása eredeti méretre
   */
  private scaleToOriginal(): void {
    // Canvas eredeti méretre állítása
    const canvas = this.scene.scale.canvas;
    if (canvas) {
      canvas.style.width = `${this.gameConfig.width}px`;
      canvas.style.height = `${this.gameConfig.height}px`;
      canvas.style.position = 'absolute';
      canvas.style.top = '0px';
      canvas.style.left = '0px';
      canvas.style.borderRadius = '15px';
    }

    // Phaser scale manager használata
    this.scene.scale.setGameSize(this.gameConfig.width, this.gameConfig.height);

    // Gomb pozíció visszaállítása
    this.setPosition(this.gameConfig.width - 40, 40);

    // GameScene handleResize direkt hívása AZONNAL
    if ((this.scene as any).handleResize) {
      (this.scene as any).handleResize(this.gameConfig.width, this.gameConfig.height);
    } else {
      // Alternatíva: próbáljuk meg közvetlenül a háttér frissítést
      if ((this.scene as any).background && (this.scene as any).updateBackgroundSizeWithDimensions) {
        (this.scene as any).updateBackgroundSizeWithDimensions((this.scene as any).background, this.gameConfig.width, this.gameConfig.height);
      }
    }

    // Scene resize esemény trigger is
    this.scene.events.emit('resize', { width: this.gameConfig.width, height: this.gameConfig.height });

    // Még egy próbálkozás 50ms múlva
    setTimeout(() => {
      console.log('Késleltetett eredeti méret resize trigger...');
      if ((this.scene as any).handleResize) {
        (this.scene as any).handleResize(this.gameConfig.width, this.gameConfig.height);
      }
    }, 50);
  }

  /**
   * Gomb pozíciójának frissítése (pl. ablakméret változás esetén)
   */
  public updatePosition(): void {
    const currentWidth = this.scene.scale.width;
    this.setPosition(currentWidth - 40, 40);
  }

  /**
   * Cleanup az objektum megsemmisítésekor
   */
  public destroy(): void {
    // Esemény figyelők eltávolítása
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    super.destroy();
  }
}