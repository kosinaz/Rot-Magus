/*global RM*/
RM.TitleScreen = function (background) {
  'use strict';
  this.background = RM.title;
  this.uiObjects = [
    new RM.Label(250, 40, 140, 21, RM.VERSION, '#616161', '#000'),
    new RM.Button(250, 440, 140, 28, 'Start Game',
                  new RM.Image(0, 21, 140, 28, RM.uiObjectsImage),
                  RM.changeScreen(new RM.IngameScreen()))
  ];
};
RM.TitleScreen.extend(RM.Screen);
