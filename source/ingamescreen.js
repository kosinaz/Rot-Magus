/*global RM*/
RM.IngameScreen = function (background) {
  'use strict';
  var barBackground = new RM.Image(96, 0, 72, 21, RM.uiObjectsImage);
  this.background = RM.ingame;
  this.uiObjects = [
    new RM.Bar(40, 9, 72, 21,
      function () {
        return RM.currentActor.xp;
      },
      function () {
        return 50 * Math.pow(2, RM.currentActor.level);
      },
      '#e3e300',
      barBackground),
    new RM.Bar(40, 30, 72, 21,
      function () {
        return Math.floor(RM.currentActor.health);
      },
      function () {
        return RM.currentActor.maxHealth;
      },
      '#00e300',
      barBackground),
    new RM.Bar(40, 51, 72, 21,
      function () {
        return RM.currentActor.mana;
      },
      function () {
        return RM.currentActor.maxMana;
      },
      '#4261e7',
      barBackground),
    new RM.Bar(40, 72, 72, 21,
      function () {
        return RM.currentActor.burden;
      },
      function () {
        return RM.currentActor.strength;
      },
      '#844121',
      barBackground)
  ];
};
