class ScoreScene extends Phaser.Scene {
  constructor() {
    super('ScoreScene');
  }

  create() {
    this.cameras.main.fadeIn(2000);
    this.cameras.main.setBackgroundColor('#606060');
    this.add.image(400, 40, 'gui', 'heroes').setOrigin(0.5);
    this.add.text(470, 45, 'Brave heroes', {
      fontFamily: 'font',
      fontSize: '16px',
      fill: '#000000'
    }).setOrigin(0.5);
    GJAPI.ScoreFetch(0, GJAPI.SCORE_ALL, 20, function (pResponse) {
      if (!pResponse.scores) {
        return;
      }
      let names = '';
      let scores = '';
      for (let i = 0; i < pResponse.scores.length; i += 1) {
        let pScore = pResponse.scores[i];
        names += (pScore.user ? pScore.user : pScore.guest) + '\n';
        scores += pScore.score + '\n';
      }
      this.add.text(380, 70, names, {
        fontFamily: 'font',
        fontSize: '16px',
        fill: '#000000'
      });
      this.add.text(590, 70, scores, {
        fontFamily: 'font',
        fontSize: '16px',
        fill: '#000000'
      });
    }.bind(this));
    this.input.on('pointerup', function () {
      this.scene.start('MenuScene');
    }, this);
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