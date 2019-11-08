class SettingScene extends Phaser.Scene {
  constructor() {
    super('SettingScene');
  }
  create() {
    this.cameras.main.setBackgroundColor('#616161');
    let fullscreenButton = new TextButton({
      onPointerUp: function () {
        this.scene.scale.toggleFullscreen(); 
      },
      origin: 0.5,
      scene: this,
      text: 'Screen: ' + (this.scale.isFullscreen ? 'Fullscreen' : 'Windowed'),
      x: 512,
      y: 200
    });
    this.scale.on('enterfullscreen', function () {
      fullscreenButton.text = 'Screen: Fullscreen';
    });
    this.scale.on('leavefullscreen', function () {
      fullscreenButton.text = 'Screen: Windowed';
    });
    new TextButton({
      onPointerUp: function () {
        game.speed = game.speed === 5 ? 1 : game.speed + 1;
        this.text = 'Game speed: ' + game.speed;
      },
      origin: 0.5,
      scene: this,
      text: 'Game speed: ' + game.speed,
      x: 512,
      y: 250
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.scene.start('MenuScene');
        this.scene.scale.off('leavefullscreen');
      },
      origin: 0.5,
      scene: this,
      text: 'Back to main menu',
      x: 512,
      y: 540
    });
  }
}