import LoadScene from './loadScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  roundPixels: true,
  scale: {
    parent: 'game-container',
    mode: Phaser.Scale.FIT,
    width: 1024,
    height: 576,
  },
  scene: [LoadScene],
});
