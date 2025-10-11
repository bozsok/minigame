/**
 * Objektum pool generikus implementáció
 * Segít csökkenteni a garbage collection terhelést
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 50
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Előre létrehozzuk a kezdeti objektumokat
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Objektum kérése a pool-ból
   */
  public get(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.resetFn(obj);
      return obj;
    }

    // Ha nincs szabad objektum, újat hozunk létre
    return this.createFn();
  }

  /**
   * Objektum visszaadása a pool-ba
   */
  public release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
    // Ha elértük a max méretet, egyszerűen eldobjuk az objektumot
  }

  /**
   * Pool mérete
   */
  public size(): number {
    return this.pool.length;
  }

  /**
   * Pool kiürítése
   */
  public clear(): void {
    this.pool.length = 0;
  }
}

/**
 * Bean specifikus pool implementáció
 */
export class BeanPool extends ObjectPool<any> {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, initialSize: number = 20, maxSize: number = 100) {
    super(
      () => scene.add.sprite(0, 0, 'beans').setVisible(false).setActive(false),
      (bean: Phaser.GameObjects.Sprite) => {
        bean.setVisible(false);
        bean.setActive(false);
        bean.setPosition(0, 0);
        bean.setAlpha(1);
        bean.setScale(1);
        bean.clearTint();
      },
      initialSize,
      maxSize
    );

    this.scene = scene;
  }

  /**
   * Bean aktiválása megadott pozícióban
   */
  public spawnBean(x: number, y: number): Phaser.GameObjects.Sprite {
    const bean = this.get();
    bean.setPosition(x, y);
    bean.setVisible(true);
    bean.setActive(true);
    
    // Interakció beállítása - custom cursor megtartása
    bean.setInteractive({ useHandCursor: false });
    
    return bean;
  }

  /**
   * Bean deaktiválása és visszaadása a pool-ba
   */
  public despawnBean(bean: Phaser.GameObjects.Sprite): void {
    bean.removeAllListeners();
    bean.disableInteractive();
    this.release(bean);
  }
}