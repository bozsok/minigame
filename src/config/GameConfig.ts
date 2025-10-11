export const GameConfig: Phaser.Types.Core.GameConfig & { fx?: any } = {
  type: Phaser.AUTO,
  width: 860,
  height: 484,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
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