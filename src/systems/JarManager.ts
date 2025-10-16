import * as Phaser from 'phaser';
import { Jar } from '../gameObjects/Jar';
import { Logger } from '../utils/Logger';

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

    Logger.debug('JarManager: 5 üveg létrehozva');
  }

  private setupEventListeners(): void {
    // Event listener már nem szükséges - direct method call használunk
    // A BeanManager közvetlenül hívja a tryCollectBean() metódust
  }

  /**
   * Bab gyűjtés megkísérlése - visszaadja, hogy sikerült-e
   * JAVÍTOTT VERZIÓ: Bármely nyitott üvegbe mehet a bab, nem csak az aktívba
   */
  public tryCollectBean(): boolean {
    Logger.debug('=== JAR MANAGER TRY COLLECT ===');
    
    // JAVÍTÁS: Először keresünk BÁRMELY nyitott, nem teli üveget
    let targetJar: Jar | null = null;
    
    // 1. Próbáljuk az aktív üveget (ha van és használható)
    const activeJar = this.getCurrentActiveJar();
    if (activeJar && activeJar.getIsOpen() && !activeJar.getIsFull()) {
      targetJar = activeJar;
      Logger.debug(`Aktív üveg ${activeJar.getJarIndex()} használható - ide megy a bab`);
    }
    
    // 2. Ha az aktív üveg nem jó, keresünk BÁRMELY nyitott üveget
    if (!targetJar) {
      Logger.debug('Aktív üveg nem megfelelő, keresés bármely nyitott üvegben...');
      for (let i = 0; i < this.jars.length; i++) {
        const jar = this.jars[i];
        if (jar.getIsOpen() && !jar.getIsFull()) {
          targetJar = jar;
          Logger.debug(`Talált nyitott üveg: ${i} - ide megy a bab`);
          
          // FONTOS: Aktív index frissítése az új célüvegre
          this.currentActiveJarIndex = i;
          break;
        }
      }
    }
    
    // 3. Ha nincs nyitott üveg, jelezzük és utasítsuk a usert
    if (!targetJar) {
      Logger.debug('JarManager: Nincs nyitott üveg! Villogtatás indítása...');
      this.highlightNextAvailableJar();
      return false;
    }

    Logger.debug(`Cél üveg: ${targetJar.getJarIndex()}, nyitott: ${targetJar.getIsOpen()}, tele: ${targetJar.getIsFull()}`);
    
    // 4. Bab hozzáadása a kiválasztott üveghez
    const success = targetJar.addBean();
    Logger.debug(`addBean() eredménye: ${success}`);
    
    if (!success) {
      Logger.debug(`JarManager: Váratlan hiba - a célüveg mégsem fogadta a babot`);
      return false; // Bab nem lett elfogyasztva
    }

    // Ha most lett tele az üveg, jelezzük de NEM váltunk automatikusan
    // (a játékos dönti el, hogy lezárja-e vagy sem)
    if (targetJar.getIsFull()) {
      Logger.debug(`Jar ${targetJar.getJarIndex()} most lett tele!`);
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
      Logger.debug('JarManager: Minden üveg megtelt!');
      this.scene.events.emit('all-jars-full');
      return;
    }

    Logger.debug(`JarManager: Átváltás következő üvegre: ${this.currentActiveJarIndex}`);
  }

  private highlightNextAvailableJar(): void {
    Logger.debug('Következő elérhető üveg keresése...');
    
    // Először keresünk nyitott, nem teli üveget
    for (let i = 0; i < this.jars.length; i++) {
      const jar = this.jars[i];
      if (jar.getIsOpen() && !jar.getIsFull()) {
        jar.startBlinking();
        Logger.debug(`JarManager: Jar ${i} villogtatás - már nyitott és használható`);
        
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
        Logger.debug(`JarManager: Jar ${i} villogtatás - dupla klikkel nyisd ki!`);
        
        this.scene.events.emit('jar-highlight', {
          jarIndex: i,
          message: `Dupla klikk: nyisd ki az ${i + 1}. üveget!`
        });
        return;
      }
    }
    
    Logger.debug('JarManager: Minden üveg tele van!');
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
    Logger.debug('JarManager: Reset complete');
  }

  /**
   * Üvegek láthatóságának beállítása
   */
  public setVisible(visible: boolean): void {
    this.jars.forEach(jar => jar.setVisible(visible));
    Logger.debug(`JarManager: Üvegek láthatósága beállítva: ${visible}`);
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

  /**
   * Megmaradt üvegek kiemelése piros glow-val (játék vége esetén)
   * Minden látható üveget kiemel - akár tele, akár üres - mert nem lettek leadva
   */
  public highlightRemainingJars(): void {
    Logger.debug(`🔴 Megmaradt üvegek kiemelése piros glow-val`);
    
    let remainingJarsCount = 0;
    
    this.jars.forEach((jar) => {
      // Minden látható üveg (nem lett leadva a pitcher-be)
      if (jar.visible) {
        remainingJarsCount++;
        
        // Ellenőrizzük, hogy már van-e piros glow
        const hasRedGlow = jar.getData('hasRedGlow') || false;
        
        if (!hasRedGlow) {
          // Jar egy Container - a jarBody Image objektumon kell alkalmazni a preFX-et
          const jarBody = jar.getJarBody();
          
          if (jarBody && jarBody.preFX) {
            // PreFX padding már be van állítva a Jar konstruktorban
            
            // Egységes glow API - mint a baboknál
            const redGlowFX = jarBody.preFX.addGlow();
            
            if (redGlowFX) {
              // Piros színű glow beállítása
              redGlowFX.color = 0xff0000; // Piros szín
              redGlowFX.outerStrength = 0; // Kezdeti érték 0
              
              // Smooth fade-in animáció - ugyanannyi mint a baboknál
              this.scene.tweens.add({
                targets: redGlowFX,
                outerStrength: 4, // Ugyanannyi mint a baboknál
                duration: 500,
                ease: 'sine.out'
              });
              
              // Glow referencia tárolása
              jar.setData('redGlowFX', redGlowFX);
              jar.setData('hasRedGlow', true);
              
              const status = jar.getIsFull() ? 'tele, de nem leadva' : 'üres, nem töltöttük meg';
              Logger.debug(`Jar ${jar.getJarIndex()} piros glow hozzáadva - ${status}`);
            }
          } else {
            Logger.warn(`Jar ${jar.getJarIndex()} jarBody preFX nem elérhető`);
          }
        }
      }
    });
    
    Logger.debug(`🔴 ${remainingJarsCount} megmaradt üveg kiemelve piros glow-val`);
  }
}