const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: "game-container",
  backgroundColor: "#ffffff",
  pixelArt: true,
  roundPixels: true,
  scene: [LoadScene, MenuScene, GameScene, GUIScene, DeathScene, SeedBrowserScene]
});

const color = {
  black: 0x000000,
  white: 0xe0e0e0,
  brown: 0x804020,
  orange: 0xe06000,
  yellow: 0xe0e000,
  lightgray: 0x808080,
  blue: 0x4060e0,
  gray: 0x606060,
  green: 0x00e000,
  darkgreen: 0x008000,
  darkbrown: 0x602020,
  red: 0xe00000,
  beige: 0xa08040,
  darkblue: 0x0020e0,
  darkred: 0x800000,
  darkgray: 0x404040
}

game.speed = 2;