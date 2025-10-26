export const GameConfig: Phaser.Types.Core.GameConfig & { fx?: any } = {
  type: Phaser.AUTO,
  width: 860,
  height: 484,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,               // ✅ FIT mód - helyes arányok, automatikus skálázás
    autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ Középre igazítás
    width: 860,                           // Base felbontás
    height: 484,                          // Base felbontás  
    parent: 'game-container',             // ✅ Explicit parent
    fullscreenTarget: null                // ✅ Fullscreen támogatás
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  backgroundColor: 'transparent',
  fx: {
    glow: {
      distance: 10,
      quality: 0.1
    }
  }
};

/**
 * Responsive game inicializáció zoom kompenzációval
 * Egyszerűsített - csak basic logolás
 */
export function initializeZoomAwareGame(game: Phaser.Game): void {
  console.log(`🎮 ZOOM AWARE: Egyszerűsített zoom támogatás aktív`);
  console.log(`🔍 Window size: ${window.innerWidth}x${window.innerHeight}`);
  console.log(`🔍 Device pixel ratio: ${window.devicePixelRatio}`);
  
  // Window resize listener - csak logolás
  window.addEventListener('resize', () => {
    console.log(`📐 Window resized: ${window.innerWidth}x${window.innerHeight}`);
  });
}