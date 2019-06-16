const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: "game-container",
  backgroundColor: "#ffffff",
  pixelArt: true,
  roundPixels: true,
  scene: [InfiniteScene, MenuScene, GameScene, GUIScene, DeathScene]
});

game.speed = 2;