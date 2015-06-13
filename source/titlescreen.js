/*global RM*/
RM.TitleScreen = function (background) {
  'use strict';
  this.background = RM.title;
  this.uiObjects = [
    new RM.Label(250, 40, 140, 21, RM.VERSION, '#616161'),
    new RM.Button(250, 440, 140, 28, 'Start Game', RM.start)
  ];
};
