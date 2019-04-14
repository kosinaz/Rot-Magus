const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: "game-container",
  pixelArt: true,
  roundPixels: true,
  scene: [MenuScene, GameScene, GUIScene, DeathScene]
});
