import LoadScene from './loadScene.js';
import MenuScene from './menuScene.js';
import SettingScene from './settingScene.js';
import SeedBrowserScene from './seedBrowserScene.js';
import ScoreScene from './scoreScene.js';

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
    SettingScene,
    SeedBrowserScene,
    ScoreScene,
    // GameScene,
    // GUIScene,
    // DeathScene,
    // LoseScene,
  ],
});
game.speed = 3;
