import * as Phaser from 'phaser';
import { Jar } from '../gameObjects/Jar';

export class JarManager {
  private scene: Phaser.Scene;
  private jars: Jar[] = [];
  private currentActiveJarIndex: number = 0; // Melyik üvegbe gyűjtjük jelenleg
  private gameActive: boolean = true; // Játék interakció állapot
  
  // UI pozíciók
  private startX: number = 80;  // Bal felső sarok X koordináta (távolabb a széltől)
  private startY: number = 100; // Bal felső sarok Y koordináta (lejjebb, hogy ne lógjon ki)
  private jarSpacing: number = 50; // 20px jar + 30px távolság = 50px spacing
  private jarWidth: number = 60; // Becsült üveg szélesség (sprite függő)

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createJars();
    this.setupEventListeners();
  }

  private createJars(): void {
    // 5 üveg létrehozása egymás mellett
    for (let i = 0; i < 5; i++) {
      const x = this.startX + (i * (this.jarWidth + this.jarSpacing));
      const y = this.startY;
      
      const jar = new Jar(this.scene, x, y, i);
      this.jars.push(jar);
    }

    console.log('JarManager: 5 üveg létrehozva');
  }

  private setupEventListeners(): void {
    // Event listener már nem szükséges - direct method call használunk
    // A BeanManager közvetlenül hívja a tryCollectBean() metódust
  }

  /**
   * Bab gyűjtés megkísérlése - visszaadja, hogy sikerült-e
   */
  public tryCollectBean(): boolean {
    console.log('=== JAR MANAGER TRY COLLECT ===');
    
    // Először ellenőrizzük, hogy az aktív üveg használható-e
    let activeJar = this.getCurrentActiveJar();
    
    if (!activeJar) {
      console.log('JarManager: Nincs aktív üveg!');
      return false;
    }

    // Ha az aktív üveg tele van, automatikusan váltunk a következőre
    if (activeJar.getIsFull()) {
      console.log(`Aktív üveg ${activeJar.getJarIndex()} tele - automatikus váltás következőre`);
      this.switchToNextJar();
      activeJar = this.getCurrentActiveJar();
      
      if (!activeJar) {
        console.log('JarManager: Minden üveg tele!');
        return false;
      }
    }

    console.log(`Aktív üveg: ${activeJar.getJarIndex()}, nyitott: ${activeJar.getIsOpen()}, tele: ${activeJar.getIsFull()}`);
    
    // Megpróbáljuk hozzáadni a babot az aktív üveghez
    const success = activeJar.addBean();
    console.log(`addBean() eredménye: ${success}`);
    
    if (!success) {
      console.log(`JarManager: Nem sikerült bab hozzáadás - Jar ${activeJar.getJarIndex()} (nyitott: ${activeJar.getIsOpen()}, tele: ${activeJar.getIsFull()})`);
      
      // Ha az üveg zárt, következő nyitott üveget keressük és villogtatjuk
      if (!activeJar.getIsOpen() && !activeJar.getIsFull()) {
        console.log('Következő nyitott üveg keresése...');
        this.highlightNextAvailableJar();
      }
      
      return false; // Bab nem lett elfogyasztva
    }

    // Ha most lett tele az üveg, jelezzük de NEM váltunk automatikusan
    // (a játékos dönti el, hogy lezárja-e vagy sem)
    if (activeJar.getIsFull()) {
      console.log(`Jar ${activeJar.getJarIndex()} most lett tele!`);
    }

    // UI frissítés
    this.updateUI();
    return true; // Bab sikeresen elfogyasztva
  }

  private handleBeanCollection(): boolean {
    // Ez a metódus már nem használatos - tryCollectBean() helyettesíti
    return this.tryCollectBean();
  }

  private getCurrentActiveJar(): Jar | null {
    if (this.currentActiveJarIndex >= this.jars.length) {
      return null; // Minden üveg tele
    }

    return this.jars[this.currentActiveJarIndex];
  }

  private switchToNextJar(): void {
    this.currentActiveJarIndex++;
    
    if (this.currentActiveJarIndex >= this.jars.length) {
      console.log('JarManager: Minden üveg megtelt!');
      this.scene.events.emit('all-jars-full');
      return;
    }

    console.log(`JarManager: Átváltás következő üvegre: ${this.currentActiveJarIndex}`);
  }

  private highlightNextAvailableJar(): void {
    console.log('Következő elérhető üveg keresése...');
    
    // Először keresünk nyitott, nem teli üveget
    for (let i = 0; i < this.jars.length; i++) {
      const jar = this.jars[i];
      if (jar.getIsOpen() && !jar.getIsFull()) {
        jar.startBlinking();
        console.log(`JarManager: Jar ${i} villogtatás - már nyitott és használható`);
        
        this.scene.events.emit('jar-highlight', {
          jarIndex: i,
          message: `Üveg ${i + 1} készen áll a babokra!`
        });
        return;
      }
    }
    
    // Ha nincs nyitott üveg, akkor az első nem teli üveget jelezzük (nyitásra)
    for (let i = 0; i < this.jars.length; i++) {
      const jar = this.jars[i];
      if (!jar.getIsFull()) {
        jar.startBlinking();
        console.log(`JarManager: Jar ${i} villogtatás - dupla klikkel nyisd ki!`);
        
        this.scene.events.emit('jar-highlight', {
          jarIndex: i,
          message: `Dupla klikk: nyisd ki az ${i + 1}. üveget!`
        });
        return;
      }
    }
    
    console.log('JarManager: Minden üveg tele van!');
  }

  private updateUI(): void {
    const activeJar = this.getCurrentActiveJar();
    const totalBeans = this.getTotalBeanCount();
    
    // UI adatok küldése a GameScene-nek
    this.scene.events.emit('jar-ui-update', {
      currentJarIndex: this.currentActiveJarIndex,
      currentJarBeans: activeJar ? activeJar.getBeanCount() : 0,
      totalBeans: totalBeans,
      allJarsFull: this.currentActiveJarIndex >= this.jars.length
    });
  }

  /**
   * Összes bab számának lekérdezése
   */
  public getTotalBeanCount(): number {
    return this.jars.reduce((total, jar) => total + jar.getBeanCount(), 0);
  }

  /**
   * Aktív üveg információk
   */
  public getActiveJarInfo(): { index: number; beanCount: number; isOpen: boolean; isFull: boolean } | null {
    const activeJar = this.getCurrentActiveJar();
    
    if (!activeJar) {
      return null;
    }

    return {
      index: activeJar.getJarIndex(),
      beanCount: activeJar.getBeanCount(),
      isOpen: activeJar.getIsOpen(),
      isFull: activeJar.getIsFull()
    };
  }

  /**
   * Összes üveg információ
   */
  public getAllJarsInfo(): Array<{ index: number; beanCount: number; isOpen: boolean; isFull: boolean; isDragEnabled: boolean }> {
    return this.jars.map(jar => ({
      index: jar.getJarIndex(),
      beanCount: jar.getBeanCount(),
      isOpen: jar.getIsOpen(),
      isFull: jar.getIsFull(),
      isDragEnabled: jar.getIsDragEnabled()
    }));
  }

  /**
   * Specific jar manipulation
   */
  public openJar(jarIndex: number): boolean {
    if (jarIndex < 0 || jarIndex >= this.jars.length) {
      return false;
    }

    const jar = this.jars[jarIndex];
    if (!jar.getIsOpen() && !jar.getIsFull()) {
      // A Jar osztály automatikusan kezeli a dupla klikket
      return true;
    }

    return false;
  }

  /**
   * Játék reset
   */
  public reset(): void {
    this.jars.forEach(jar => jar.reset());
    this.currentActiveJarIndex = 0;
    console.log('JarManager: Reset complete');
  }

  /**
   * Üvegek láthatóságának beállítása
   */
  public setVisible(visible: boolean): void {
    this.jars.forEach(jar => jar.setVisible(visible));
    console.log(`JarManager: Üvegek láthatósága beállítva: ${visible}`);
  }

  /**
   * Üvegek skálázása és újrapozícionálása
   * VALÓS ARÁNYOSÍTÁS: Fullscreen (1.0) vagy valós canvas arány
   */
  public updateScale(gameScale: number, gameWidth: number, gameHeight: number): void {
    const isFullscreen = gameScale >= 1.0;
    
    this.jars.forEach((jar, index) => {
      if (isFullscreen) {
        // Fullscreen: eredeti pozíciók és natív méret
        const newX = this.startX + (index * (this.jarWidth + this.jarSpacing));
        const newY = this.startY;
        jar.setScale(1.0);
        jar.setPosition(newX, newY);
      } else {
        // Ablakos: valós arányosítás alapján
        const scaledStartX = this.startX * gameScale;
        const scaledStartY = this.startY * gameScale;
        const scaledSpacing = this.jarSpacing * gameScale;
        const scaledJarWidth = this.jarWidth * gameScale;
        
        const newX = scaledStartX + (index * (scaledJarWidth + scaledSpacing));
        const newY = scaledStartY;
        jar.setScale(gameScale);
        jar.setPosition(newX, newY);
      }
    });
  }

  /**
   * Debug információk
   */
  public getDebugInfo(): string {
    const activeJar = this.getCurrentActiveJar();
    const jarsStatus = this.jars.map(jar => 
      `Jar ${jar.getJarIndex()}: ${jar.getBeanCount()} bab (${jar.getIsOpen() ? 'nyitott' : 'zárt'}, ${jar.getIsFull() ? 'tele' : 'nem tele'})`
    ).join(' | ');

    return `Aktív üveg: ${activeJar ? activeJar.getJarIndex() : 'nincs'} | ${jarsStatus}`;
  }

  /**
   * Játék interakció állapot beállítása
   */
  public setGameActive(active: boolean): void {
    this.gameActive = active;
    
    // Minden jar-ra alkalmazzuk a tiltást
    this.jars.forEach(jar => {
      jar.setGameActive(active);
    });
  }

  /**
   * Játék interakció állapot lekérdezése  
   */
  public isGameActive(): boolean {
    return this.gameActive;
  }
}