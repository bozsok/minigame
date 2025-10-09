import { BeanData, BeanState } from '../types/GameData';
import { BeanAnimationState } from '../types/BeanTypes';

/**
 * Bean játékobjektum osztály
 * Felelős egy bab sprite-ért, animációjáért és interakciójáért
 */
export class Bean extends Phaser.GameObjects.Sprite {
  private beanData: BeanData;
  private beanState: BeanState; // átnevezve state-ről hogy ne ütközzön
  private animationState: BeanAnimationState;
  private isCollectable: boolean;
  private spawnAnimation?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'beans'
  ) {
    // Véletlenszerű frame kiválasztása (0, 1, vagy 2)
    const randomFrame = Math.floor(Math.random() * 3);
    super(scene, x, y, texture, randomFrame);

    // Hozzáadjuk a scene-hez
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Bab méret 30%-kal kisebb (70% scale)
    this.setScale(0.7);

    // Debug információk
    console.log(`Bean létrehozva: (${x}, ${y}) textúra: ${texture}, frame: ${randomFrame}, scale: 70%`);
    console.log(`Bean méret: ${this.width}x${this.height} (70% scale)`);
    console.log(`Bean látható: ${this.visible}, alpha: ${this.alpha}`);
    console.log(`Bean depth: ${this.depth}, scale: ${this.scaleX}x${this.scaleY}`);

    // Inicializáljuk a bab adatait
    this.beanData = {
      id: `bean_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      collected: false,
      spawnTime: Date.now()
    };

    this.beanState = BeanState.SPAWNED;
    this.animationState = BeanAnimationState.IDLE;
    this.isCollectable = true;

    this.setupPhysics();
    this.setupInteraction();
    this.playSpawnAnimation();
  }

  /**
   * Fizika beállítása
   */
  private setupPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCircle(11); // 70% of 16px = ~11px sugár
      body.setImmovable(true);
      body.setCollideWorldBounds(false);
    }
  }

  /**
   * Interakció beállítása (klikk kezelés)
   */
  private setupInteraction(): void {
    this.setInteractive({ useHandCursor: true });
    
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && this.isCollectable) {
        this.collect();
      }
    });

    // Hover effektek eltávolítva - csak kéz kurzor marad
  }

  /**
   * Spawn animáció lejátszása
   */
  private playSpawnAnimation(): void {
    // Kezdetben láthatatlan és kisebb
    this.setAlpha(0);
    this.setScale(0.35); // 50% of 70% = 35%

    this.spawnAnimation = this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 0.7,  // Végső méret 70%
      scaleY: 0.7,  // Végső méret 70%
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.animationState = BeanAnimationState.IDLE;
      }
    });
  }

  /**
   * Bab begyűjtése
   */
  public collect(): void {
    if (!this.isCollectable || this.beanState === BeanState.COLLECTED) {
      return;
    }

    this.isCollectable = false;
    this.beanState = BeanState.COLLECTED;
    this.animationState = BeanAnimationState.COLLECT;
    this.beanData.collected = true;

    // Egyszerű eltűnés animáció - 0.3mp alatt
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });

    // Esemény küldése a BeanManager-nek
    this.scene.events.emit('bean-collected', {
      beanId: this.beanData.id,
      x: this.x,
      y: this.y,
      timestamp: Date.now()
    });
  }

  /**
   * Bab frissítése minden frame-ben
   */
  public update(delta: number): void {
    // Jelenleg nincs időalapú logika - a babok maradnak amíg össze nem gyűjtjük őket
  }

  /**
   * Fokozatos eltűnés
   */
  private fadeOut(): void {
    if (this.beanState !== BeanState.SPAWNED) return;

    this.beanState = BeanState.DESTROYED;
    this.isCollectable = false;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * Getter-ek
   */
  public getBeanData(): BeanData {
    return { ...this.beanData };
  }

  public getState(): BeanState {
    return this.beanState;
  }

  public isCollectible(): boolean {
    return this.isCollectable && this.beanState === BeanState.SPAWNED;
  }

  /**
   * Cleanup az objektum megsemmisítésekor
   */
  public destroy(): void {
    if (this.spawnAnimation) {
      this.spawnAnimation.destroy();
    }
    super.destroy();
  }
}