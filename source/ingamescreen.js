/*global RM*/
RM.IngameScreen = function (background) {
  'use strict';
  var barBackground = new RM.Image(96, 0, 72, 21, RM.uiObjectsImage);
  this.background = RM.ingame;
  this.uiObjects = [
    new RM.Bar(40, 9, 72, 21, barBackground,
      function () {
        return RM.currentHero.xp;
      },
      function () {
        return 50 * Math.pow(2, RM.currentHero.level);
      },
      '#e3e300'),
    new RM.Bar(40, 30, 72, 21, barBackground,
      function () {
        return Math.floor(RM.currentHero.health);
      },
      function () {
        return RM.currentHero.maxHealth;
      },
      '#00e300'),
    new RM.Bar(40, 51, 72, 21, barBackground,
      function () {
        return RM.currentHero.mana;
      },
      function () {
        return RM.currentHero.maxMana;
      },
      '#4261e7'),
    new RM.Bar(40, 72, 72, 21, barBackground,
      function () {
        return RM.currentHero.burden;
      },
      function () {
        return RM.currentHero.strength;
      },
      '#844121'),
    new RM.Label(16, 114, 24, 21, '#616161',
      function () {
        return RM.currentHero.strength;
      },
      '#000'),
    new RM.Label(40, 114, 24, 21, '#616161',
      function () {
        return RM.currentHero.wisdom;
      },
      '#000'),
    new RM.Label(64, 114, 24, 21, '#616161',
      function () {
        return RM.currentHero.agility;
      },
      '#000'),
    new RM.Label(88, 114, 24, 21, '#616161',
      function () {
        return RM.currentHero.precision;
      },
      '#000'),
    new RM.Frame(128, 9, 504, 441, '#000',
      function () {
        return RM.currentHero.fov;
      },
      function (x, y) {
        RM.currentHero.order({
          x: x - 10 + RM.currentHero.x,
          y: y - 10 + RM.currentHero.y
        });
      }),
    new RM.Frame(41, 261, 72, 84,
      new RM.Image(0, 49, 72, 84, RM.uiObjectsImage),
      function () {
        return RM.currentHero.visibleItems;
      },
      function (x, y) {

      })
  ];
};
