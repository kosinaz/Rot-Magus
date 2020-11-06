import LoadScene from './loadScene.js';
import WorldScene from './worldScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  roundPixels: true,
  scale: {
    parent: 'game-container',
    mode: Phaser.Scale.FIT,
    width: 1024,
    height: 576,
  },
  scene: [
    LoadScene,
    WorldScene,
  ],
});
