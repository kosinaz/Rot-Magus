import LoadScene from './loadScene.js';
import MenuScene from './menuScene.js';

const game = new Phaser.Game({
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
    MenuScene,
    // SettingScene,
    // GameScene,
    // GUIScene,
    // DeathScene,
    // LoseScene,
    // ScoreScene,
    // SeedBrowserScene,
  ],
});
game.speed = 3;
