/*global RM*/
RM.TitleScreen = function (background) {
  'use strict';
  this.background = RM.title;
  this.uiObjects = [
    new RM.Label(250, 40, 140, 21, '#000', RM.VERSION, '#616161'),
    new RM.Button(250, 440, 140, 28,
      new RM.Image(0, 21, 140, 28, RM.uiObjectsImage), 'Start Game', RM.start)
  ];
};
