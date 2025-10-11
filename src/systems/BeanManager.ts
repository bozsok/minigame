import { Bean } from '../gameObjects/Bean';
import { BeanConfig, BeanData } from '../types/GameData';
import { BeanSpawnPoint, BeanCollectionEvent, BeanCluster } from '../types/BeanTypes';
import { ObjectPool } from '../utils/ObjectPool';
import { GameBalance } from '../config/GameBalance';

/**
 * BeanManager - A bab gyűjtés rendszer fő kezelője
 * Felelős:
 * - Babok spawn-olása véletlenszerű helyeken
 * - Bab gyűjtés kezelése
 * - Üveg töltés nyomon követése
 * - Teljesítmény optimalizálás objektum pooling-gal
 */
export class BeanManager {
  private scene: Phaser.Scene;
  private beans: Map<string, Bean> = new Map();
  private beanOriginalPositions: Map<string, {x: number, y: number}> = new Map(); // Eredeti pozíciók tárolása
  private originalCanvasWidth: number = 0; // Eredeti canvas szélesség (spawn-kori)
  private originalCanvasHeight: number = 0; // Eredeti canvas magasság (spawn-kori)
  private spawnPoints: BeanSpawnPoint[] = [];
  private config: BeanConfig;
  private lastSpawnTime: number = 0;
  private collectedBeansCount: number = 0;
  private currentJarPhase: number = 0;
  private beansInCurrentJar: number = 0;
  private isGameRunning: boolean = true; // Játék állapot követése

  // Collision map referencia az érvényes spawn pontokhoz
  private collisionMap?: Phaser.GameObjects.Image;
  private collisionData?: ImageData;

  constructor(scene: Phaser.Scene, config?: Partial<BeanConfig>) {
    this.scene = scene;
    
    // Alapértelmezett konfiguráció a GameBalance-ből
    this.config = {
      maxBeansOnScreen: 15,
      spawnInterval: 2000, // 2 másodperc
      beanSize: 32,
      collisionRadius: 16,
      ...config
    };

    this.initialize();
  }

  /**
   * Rendszer inicializálása
   */
  private initialize(): void {
    this.loadCollisionMap();
    this.setupEventListeners();
    
    // BeanManager inicializálva
  }

  /**
   * Collision map betöltése a háttér alapján
   */
  private loadCollisionMap(): void {
    // Collision map betöltése
    
    // A pantry-collision.jpg képet rendereljük egy láthatatlan canvas-ra
    this.collisionMap = this.scene.add.image(0, 0, 'pantry-collision').setVisible(false);
    
    // Pixel adatok kinyerése a textúrából
    this.extractCollisionData();
  }

  /**
   * Pixel adatok kinyerése a collision map-ből
   */
  private extractCollisionData(): void {
    const texture = this.scene.textures.get('pantry-collision');
    if (!texture) {
      console.error('Collision texture nem található!');
      this.generateValidAreas(); // Fallback
      return;
    }

    // Canvas létrehozása a pixel olvasáshoz
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Canvas context nem elérhető!');
      this.generateValidAreas(); // Fallback
      return;
    }

    // Textúra méretének lekérése
    const source = texture.source[0];
    canvas.width = source.width;
    canvas.height = source.height;
    
    // Kép rajzolása a canvas-ra (típus biztonság)
    const image = source.image as HTMLImageElement;
    context.drawImage(image, 0, 0);
    
    // Pixel adatok kinyerése
    this.collisionData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Collision map feldolgozva
    
    // Érvényes területek generálása a pixel adatok alapján
    this.generateValidAreasFromPixels();
  }

  /**
   * Érvényes területek generálása
   */
  private generateValidAreas(): void {
    // Egyszerűsített verzió - a teljes játékterület középső részét használjuk
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    
    const margin = 50;
    const areaWidth = gameWidth - (margin * 2);
    const areaHeight = gameHeight - (margin * 2);
    
    // Grid alapú spawn pontok generálása
    const gridSize = 60;
    const pointsX = Math.floor(areaWidth / gridSize);
    const pointsY = Math.floor(areaHeight / gridSize);
    
    for (let x = 0; x < pointsX; x++) {
      for (let y = 0; y < pointsY; y++) {
        const worldX = margin + (x * gridSize) + (gridSize / 2);
        const worldY = margin + (y * gridSize) + (gridSize / 2);
        
        // Egyszerű ellenőrzés - kerüljük a széleket és a középső üveg területet
        if (this.isValidSpawnPoint(worldX, worldY)) {
          this.spawnPoints.push({
            x: worldX,
            y: worldY,
            isValid: true,
            lastSpawnTime: 0
          });
        }
      }
    }
  }

  /**
   * Érvényes területek generálása pixel adatok alapján
   */
  private generateValidAreasFromPixels(): void {
    if (!this.collisionData) {
      console.warn('Collision data nem elérhető, fallback használata...');
      this.generateValidAreas();
      return;
    }

    // AKTUÁLIS képernyőméret használata (teljesképernyős esetén is)
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    const collisionWidth = this.collisionData.width;
    const collisionHeight = this.collisionData.height;

    // Spawn generálás

    // Kisebb grid hogy több spawn pont legyen 250 babhoz
    const gridSize = 25; // Még sűrűbb grid
    const pointsX = Math.floor(gameWidth / gridSize);
    const pointsY = Math.floor(gameHeight / gridSize);

    let validPoints = 0;

    for (let x = 0; x < pointsX; x++) {
      for (let y = 0; y < pointsY; y++) {
        const worldX = (x * gridSize) + (gridSize / 2);
        const worldY = (y * gridSize) + (gridSize / 2);
        
        // Koordináta átváltás AKTUÁLIS játék területről collision map-re
        const collisionX = Math.floor((worldX / gameWidth) * collisionWidth);
        const collisionY = Math.floor((worldY / gameHeight) * collisionHeight);
        
        // Pixel szín ellenőrzése (fehér = spawn engedélyezett)
        if (this.isPixelWhite(collisionX, collisionY)) {
          this.spawnPoints.push({
            x: worldX,
            y: worldY,
            isValid: true,
            lastSpawnTime: 0
          });
          validPoints++;
        }
      }
    }

    // Spawn pontok generálva
  }

  /**
   * Pixel fehérségének ellenőrzése
   */
  private isPixelWhite(x: number, y: number): boolean {
    if (!this.collisionData || x < 0 || y < 0 || x >= this.collisionData.width || y >= this.collisionData.height) {
      return false;
    }

    const pixelIndex = (y * this.collisionData.width + x) * 4;
    const r = this.collisionData.data[pixelIndex];     // Red
    const g = this.collisionData.data[pixelIndex + 1]; // Green  
    const b = this.collisionData.data[pixelIndex + 2]; // Blue
    
    // Fehér vagy világos szürke threshold (>200 mindhárom csatornán)
    const threshold = 200;
    return r > threshold && g > threshold && b > threshold;
  }

  /**
   * Spawn pont érvényességének ellenőrzése
   */
  private isValidSpawnPoint(x: number, y: number): boolean {
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    
    // Kerüljük a középső területet (üveg helye)
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;
    const centerRadius = 80;
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    
    return distanceFromCenter > centerRadius;
  }

  /**
   * Esemény figyelők beállítása
   */
  private setupEventListeners(): void {
    // Bean gyűjtés esemény
    this.scene.events.on('bean-collected', (event: BeanCollectionEvent) => {
      this.handleBeanCollection(event);
    });
    
    // Scene shutdown esemény
    this.scene.events.once('shutdown', () => {
      this.cleanup();
    });
  }

  /**
   * Fő update ciklus - scene update-jéből hívandó
   */
  public update(delta: number): void {
    // NINCS automatikus spawn-olás! 
    // Minden bab egyszerre került ki a spawnAllBeans() metódussal
    
    // Meglévő babok frissítése
    this.beans.forEach(bean => {
      bean.update(delta);
    });
  }

  /**
   * Új bab spawn-olása
   */
  private spawnBean(): Bean | null {
    const availableSpawnPoints = this.spawnPoints.filter(point => 
      point.isValid && 
      Date.now() - point.lastSpawnTime > 5000 // 5 másodperc cooldown
    );
    
    if (availableSpawnPoints.length === 0) {
      return null;
    }
    
    // Véletlenszerű spawn pont kiválasztása
    const spawnPoint = availableSpawnPoints[
      Math.floor(Math.random() * availableSpawnPoints.length)
    ];
    
    // Bab létrehozása megfelelő skálával
    const bean = new Bean(this.scene, spawnPoint.x, spawnPoint.y);
    bean.setScale(this.getCurrentScale()); // Automatikus skálázás
    this.beans.set(bean.getBeanData().id, bean);
    
    // Eredeti pozíció tárolása (fullscreen koordináták)
    this.beanOriginalPositions.set(bean.getBeanData().id, {x: spawnPoint.x, y: spawnPoint.y});
    
    // Spawn pont frissítése
    spawnPoint.lastSpawnTime = Date.now();
    
    // Bab spawn-olva
    return bean;
  }

  /**
   * Mind a 250 bab egyszerre spawn-ja teljesképernyős módban
   * Klaszter-alapú természetes eloszlással, üres zónák hagyásával
   */
  public spawnAllBeans(): void {
    // 250 BAB TERMÉSZETES KLASZTER SPAWN
    
    // Aktuális képernyő méret lekérése
    const gameWidth = this.scene.scale.width;
    const gameHeight = this.scene.scale.height;
    
    // Aktuális játék méret
    
    // Eredeti canvas méret tárolása (spawn-kori méret)
    this.originalCanvasWidth = gameWidth;
    this.originalCanvasHeight = gameHeight;
    // Eredeti canvas méret tárolva
    
    // Collision map újragenerálása aktuális méretek alapján
    this.regenerateSpawnPointsForCurrentSize();
    
    const totalBeansNeeded = 250; // 5 üveg × 50 bab
    let beansSpawned = 0;
    const spawnedPositions: { x: number, y: number }[] = [];
    
    // Spawn pontok rendelkezésre állnak
    
    // Klaszter-alapú spawn algoritmus
    const clusters = this.generateBeanClusters(totalBeansNeeded, gameWidth, gameHeight);
    
    for (const cluster of clusters) {
      for (const position of cluster.positions) {
        if (beansSpawned >= totalBeansNeeded) break;
        
        // Collision map ellenőrzés
        if (this.isPositionOnCollisionMap(position.x, position.y, gameWidth, gameHeight)) {
          // Bab létrehozása növekvő depth-tel és megfelelő skálával
          const bean = new Bean(this.scene, position.x, position.y);
          bean.setDepth(10 + beansSpawned); // Alacsonyabb depth - üvegek alatt
          bean.setScale(this.getCurrentScale()); // Automatikus skálázás
          
          this.beans.set(bean.getBeanData().id, bean);
          
          // Eredeti pozíció tárolása (fullscreen koordináták)
          this.beanOriginalPositions.set(bean.getBeanData().id, {x: position.x, y: position.y});
          spawnedPositions.push(position);
          beansSpawned++;
          
          if (beansSpawned % 50 === 0) {
            // Spawn progress
          }
        }
      }
      if (beansSpawned >= totalBeansNeeded) break;
    }
    
    // Spawn befejezve
  }

  /**
   * Egér gyakorlásra optimalizált bab eloszlás generálása
   * Minden bab külön helyen, minimum távolsággal egymástól
   */
  private generateBeanClusters(totalBeans: number, gameWidth: number, gameHeight: number): BeanCluster[] {
    const positions: { x: number, y: number }[] = [];
    const minDistance = 80; // Minimum 80px távolság babok között
    const maxAttempts = 1000;
    
    // Bab generálás egér gyakorláshoz
    
    for (let i = 0; i < totalBeans; i++) {
      let attempts = 0;
      let validPosition: { x: number, y: number } | null = null;
      
      while (!validPosition && attempts < maxAttempts) {
        // Teljesen random pozíció
        const candidate = this.getRandomValidPosition(gameWidth, gameHeight);
        
        if (candidate) {
          // Ellenőrizzük a minimum távolságot minden meglévő babtól
          let tooClose = false;
          
          for (const existingPos of positions) {
            const distance = Math.sqrt(
              Math.pow(candidate.x - existingPos.x, 2) + 
              Math.pow(candidate.y - existingPos.y, 2)
            );
            
            if (distance < minDistance) {
              tooClose = true;
              break;
            }
          }
          
          if (!tooClose) {
            validPosition = candidate;
            positions.push(validPosition);
          }
        }
        attempts++;
      }
      
      // Ha nem találunk helyet, lazítsunk a szabályokon
      if (!validPosition && attempts >= maxAttempts) {
        const fallbackPosition = this.getRandomValidPosition(gameWidth, gameHeight);
        if (fallbackPosition) {
          positions.push(fallbackPosition);
        }
      }
    }
    
    // Egy "klaszter" az összes pozícióval (régi API megtartása)
    return [{
      center: { x: gameWidth/2, y: gameHeight/2 },
      radius: Math.max(gameWidth, gameHeight),
      positions: positions
    }];
  }

  /**
   * Véletlenszerű érvényes pozíció lekérése collision map alapján
   */
  private getRandomValidPosition(gameWidth: number, gameHeight: number): { x: number, y: number } | null {
    const maxAttempts = 100;
    
    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.random() * gameWidth;
      const y = Math.random() * gameHeight;
      
      // Collision map ellenőrzése
      if (this.isPositionOnCollisionMap(x, y, gameWidth, gameHeight)) {
        return { x, y };
      }
    }
    
    // Ha nincs érvényes pozíció, használjunk egy spawn pontot
    if (this.spawnPoints.length > 0) {
      const randomSpawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
      return { x: randomSpawnPoint.x, y: randomSpawnPoint.y };
    }
    
    return null;
  }

  /**
   * Pozíció ellenőrzése collision map-en (fehér pixel)
   */
  private isPositionOnCollisionMap(x: number, y: number, gameWidth: number, gameHeight: number): boolean {
    if (!this.collisionData) return true; // Ha nincs collision data, minden pozíció OK
    
    // Koordináta átváltás
    const collisionX = Math.floor((x / gameWidth) * this.collisionData.width);
    const collisionY = Math.floor((y / gameHeight) * this.collisionData.height);
    
    return this.isPixelWhite(collisionX, collisionY);
  }

  /**
   * Pozíció érvényességének ellenőrzése 30% átfedéssel
   */
  private isPositionValidWithOverlap(newPos: { x: number, y: number }, existingPositions: { x: number, y: number }[]): boolean {
    const beanRadius = 16; // 32x20px bab fél-szélessége
    const maxOverlap = 0.3; // 30% átfedés
    
    for (const existingPos of existingPositions) {
      const distance = Math.sqrt(
        Math.pow(newPos.x - existingPos.x, 2) + 
        Math.pow(newPos.y - existingPos.y, 2)
      );
      
      // Minimum távolság 30% átfedéssel
      const minDistance = beanRadius * 2 * (1 - maxOverlap);
      
      if (distance < minDistance) {
        return false; // Túl közel van
      }
    }
    
    return true; // Pozíció megfelelő
  }

  /**
   * Spawn pontok újragenerálása aktuális képernyő mérethez
   */
  private regenerateSpawnPointsForCurrentSize(): void {
    // Spawn pontok újragenerálása
    
    // Korábbi spawn pontok törlése
    this.spawnPoints = [];
    
    // Újragenerálás aktuális méretekkel
    if (this.collisionData) {
      this.generateValidAreasFromPixels();
    } else {
      this.generateValidAreas();
    }
    
    // Spawn pontok újragenerálva
  }

  /**
   * Bab gyűjtés kezelése
   */
  private handleBeanCollection(event: BeanCollectionEvent): void {
    const bean = this.beans.get(event.beanId);
    if (!bean) return;
    
    // Bean collection debug
    
    // Közvetlenül kérjük meg a JarManager-től, hogy fogadja el a babot
    const gameScene = this.scene as any; // GameScene típus cast
    
    if (!gameScene.jarManager) {
      // ERROR: JarManager nem található
      return;
    }
    
    const jarAccepted = gameScene.jarManager.tryCollectBean();
    // Jar elfogadta a babot
    
    if (!jarAccepted) {
      // Bab nem lett elfogadva - üveg zárt vagy tele
      return; // Bab megmarad
    }
    
    console.log('Bab elfogadva - tényleges gyűjtés indítása');
    
    // Bean tényleges gyűjtésének elindítása
    bean.performCollection();
    
    // Bean eltávolítása a listából (csak ha elfogadva)
    this.beans.delete(event.beanId);
    
    // Számláló növelése
    this.collectedBeansCount++;
    this.beansInCurrentJar++;
    
    console.log(`Bab összegyűjtve! Összesen: ${this.collectedBeansCount}`);
    
    // Üveg fázis ellenőrzése
    this.checkJarPhaseCompletion();
    
    // Esemény küldése a UI-nak
    this.scene.events.emit('bean-count-updated', {
      totalBeans: this.collectedBeansCount,
      beansInJar: this.beansInCurrentJar,
      jarPhase: this.currentJarPhase
    });
  }

  /**
   * Üveg fázis befejezésének ellenőrzése
   */
  private checkJarPhaseCompletion(): void {
    const beansPerPhase = GameBalance.jar.beansPerPhase;
    
    if (this.beansInCurrentJar >= beansPerPhase) {
      this.currentJarPhase++;
      this.beansInCurrentJar = 0;
      
      console.log(`Üveg fázis befejezve! Új fázis: ${this.currentJarPhase}`);
      
      // Esemény küldése az üveg kezelőnek
      this.scene.events.emit('jar-phase-completed', {
        phase: this.currentJarPhase,
        totalPhases: GameBalance.jar.phasesPerJar
      });
      
      // Ha az üveg tele, új üveg kezdése
      if (this.currentJarPhase >= GameBalance.jar.phasesPerJar) {
        this.completeJar();
      }
    }
  }

  /**
   * Üveg befejezése
   */
  private completeJar(): void {
    this.currentJarPhase = 0;
    
    console.log('Üveg befejezve!');
    
    // Esemény küldése a játék kezelőnek
    this.scene.events.emit('jar-completed', {
      totalBeansCollected: this.collectedBeansCount
    });
  }

  /**
   * Getter-ek az aktuális állapothoz
   */
  public getCollectedBeansCount(): number {
    return this.collectedBeansCount;
  }

  public getCurrentJarPhase(): number {
    return this.currentJarPhase;
  }

  public getBeansInCurrentJar(): number {
    return this.beansInCurrentJar;
  }

  public getActiveBeanCount(): number {
    return this.beans.size;
  }

  /**
   * Manuális bab spawn (teszteléshez)
   */
  public spawnBeanAt(x: number, y: number): Bean | null {
    if (this.beans.size >= this.config.maxBeansOnScreen) {
      return null;
    }
    
    const bean = new Bean(this.scene, x, y);
    bean.setScale(this.getCurrentScale()); // Automatikus skálázás
    this.beans.set(bean.getBeanData().id, bean);
    
    // Eredeti pozíció tárolása (fullscreen koordináták)
    this.beanOriginalPositions.set(bean.getBeanData().id, {x: x, y: y});
    
    return bean;
  }

  /**
   * Összes bab eltávolítása
   */
  public clearAllBeans(): void {
    this.beans.forEach(bean => {
      bean.destroy();
    });
    this.beans.clear();
  }

  /**
   * Játék leállítása (victory esetén)
   */
  public stopGame(): void {
    console.log('BeanManager: Játék leállítva');
    // Minden további bean spawn letiltása
    this.isGameRunning = false;
    
    // Aktív babok letiltása (nem gyűjthetők)
    this.beans.forEach(bean => {
      bean.disableInteractive();
    });
  }

  /**
   * Jelenlegi skála meghatározása a játékméret alapján
   * FONTOS: Fullscreen-ben is csak 70% (eredeti beállítás)
   */
  private getCurrentScale(): number {
    const gameWidth = this.scene.scale.width;
    const isFullscreen = gameWidth > 1200;
    return isFullscreen ? 0.7 : 0.175; // 0.7 és 0.7*0.25 = 0.175
  }

  /**
   * Eredeti canvas méret getterek (GameScene számára)
   */
  public getOriginalCanvasWidth(): number {
    return this.originalCanvasWidth || this.scene.scale.width;
  }

  public getOriginalCanvasHeight(): number {
    return this.originalCanvasHeight || this.scene.scale.height;
  }

  /**
   * Babok skálázása
   * HUSZÁRVÁGÁS: Fullscreen (1.0) vagy Ablakos (0.25)
   */
  public updateScale(gameScale: number, gameWidth: number, gameHeight: number): void {
    const isFullscreen = gameScale >= 1.0;
    
    // Minden aktív bab skálázása ÉS pozíció arányosítása
    this.beans.forEach((bean) => {
      const beanId = bean.getBeanData().id;
      const originalPos = this.beanOriginalPositions.get(beanId);
      
      if (!originalPos) {
        console.warn(`Nincs eredeti pozíció tárolva a bab számára: ${beanId}`);
        return;
      }
      
      if (isFullscreen) {
        // Fullscreen: 70% méret és eredeti pozíció
        bean.setScale(0.7);
        bean.setPosition(originalPos.x, originalPos.y);
      } else {
        // Ablakos: 17.5% méret és valós canvas arányosítás
        bean.setScale(0.175);
        
        // Valós arányosítás: fullscreen → ablakos canvas méret szerint
        // originalPos alapja a spawn-kori canvas méret (pl. 1920x1080)
        // Most át kell számolni 860x484-re
        const scaleX = gameWidth / this.originalCanvasWidth;
        const scaleY = gameHeight / this.originalCanvasHeight;
        
        const scaledX = originalPos.x * scaleX;
        const scaledY = originalPos.y * scaleY;
        
        bean.setPosition(scaledX, scaledY);
      }
    });
  }

  /**
   * Összes bab elrejtése (dev mode-hoz)
   */
  public hideAllBeans(): void {
    this.beans.forEach((bean) => {
      bean.setVisible(false);
    });
  }

  /**
   * Összes bab megjelenítése (dev mode kikapcsolásához)
   */
  public showAllBeans(): void {
    this.beans.forEach((bean) => {
      bean.setVisible(true);
    });
  }

  /**
   * Rendszer leállítása és cleanup
   */
  public cleanup(): void {
    this.clearAllBeans();
    this.beanOriginalPositions.clear();
    this.scene.events.off('bean-collected');
    console.log('BeanManager cleanup befejezve');
  }
}