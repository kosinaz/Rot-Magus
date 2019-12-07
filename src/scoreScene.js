import TextButton from './gui/textButton.js';
/**
 * Represents the scene that display the high scores.
 *
 * @export
 * @class ScoreScene
 * @extends {Phaser.Scene}
 */
export default class ScoreScene extends Phaser.Scene {
  /**
   * Creates an instance of ScoreScene.
   * @memberof ScoreScene
   */
  constructor() {
    super('ScoreScene');
  }

  /**
   * Creates the content of the scene.
   *
   * @memberof ScoreScene
   */
  create() {
    this.cameras.main.fadeIn(2000);
    this.cameras.main.setBackgroundColor('#606060');
    this.add.image(400, 40, 'gui', 'heroes').setOrigin(0.5);
    this.add.text(485, 43, 'Brave heroes', {
      fontFamily: 'font',
      fontSize: '24px',
      fill: '#000000',
    }).setOrigin(0.5);
    // eslint-disable-next-line new-cap
    GJAPI.ScoreFetch(0, GJAPI.SCORE_ALL, 20, (pResponse) => {
      if (!pResponse.scores) {
        return;
      }
      let scores = '';
      for (let i = 0; i < pResponse.scores.length; i += 1) {
        const pScore = pResponse.scores[i];
        scores += (pScore.user ? pScore.user : pScore.guest) + ' - ' +
        pScore.score + ' ' + pScore.stored + '\n';
      }
      this.add.text(300, 70, scores, {
        fontFamily: 'font',
        fontSize: '16px',
        fill: '#000000',
      });
    });
    this.input.on('pointerup', () => {
      this.scene.start('MenuScene');
    }, this);
    new TextButton({
      onPointerUp: () => {
        this.scene.start('MenuScene');
        this.scale.off('leavefullscreen');
      },
      origin: 0.5,
      scene: this,
      text: 'Back to main menu',
      x: 512,
      y: 540,
    });
  }
}
