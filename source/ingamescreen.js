/*global RM*/
RM.IngameScreen = function (background) {
  'use strict';
  this.background = RM.ingame;
  this.uiObjects = [
    new RM.Bar(28, 9, 96, 21,
      function () {
        return RM.currentHero.xp;
      },
      function () {
        return 50 * Math.pow(2, RM.currentHero.level);
      },
      '#e3e300'),
    new RM.Bar(28, 30, 96, 21,
      function () {
        return Math.floor(RM.currentHero.health);
      },
      function () {
        return RM.currentHero.maxHealth;
      },
      '#00e300'),
    new RM.Bar(28, 51, 96, 21,
      function () {
        return RM.currentHero.mana;
      },
      function () {
        return RM.currentHero.maxMana;
      },
      '#4261e7'),
    new RM.Bar(28, 72, 96, 21,
      function () {
        return RM.currentHero.burden;
      },
      function () {
        return RM.currentHero.strength;
      },
      '#844121'),
    new RM.Label(28, 114, 24, 21,
      function () {
        return RM.currentHero.strength;
      },
      '#000'),
    new RM.Label(52, 114, 24, 21,
      function () {
        return RM.currentHero.wisdom;
      },
      '#000'),
    new RM.Label(76, 114, 24, 21,
      function () {
        return RM.currentHero.agility;
      },
      '#000'),
    new RM.Label(100, 114, 24, 21,
      function () {
        return RM.currentHero.precision;
      },
      '#000'),
    new RM.Frame(128, 9, 504, 441,
      function () {
        return RM.currentHero.fov;
      },
      function (x, y) {
        RM.currentHero.order({
          x: x - 10 + RM.currentHero.x,
          y: y - 10 + RM.currentHero.y
        });
      }),
    new RM.Frame(4, 230, 120, 105,
      function () {
        return RM.currentHero.visibleItems;
      },
      function (x, y) {

      })
  ];
};
