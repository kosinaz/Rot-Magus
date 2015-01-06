/*global RM*/
RM.GUI = function () {
  'use strict';
  RM.c.drawImage(RM.hud, 0, 0);
  this.xp = new RM.Bar(40, 9, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.health = new RM.Bar(40, 30, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.mana = new RM.Bar(40, 51, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.burden = new RM.Bar(40, 72, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.strength = new RM.Label(16, 114, 24, 21);
  this.wisdom = new RM.Label(40, 114, 24, 21);
  this.agility = new RM.Label(64, 114, 24, 21);
  this.precision = new RM.Label(88, 114, 24, 21);
  this.map = new RM.Frame(128, 9, 504, 441, {
    map: RM.map,
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    empty: RM.terrains.invisible
  });
  this.inventory = new RM.Frame(16, 135, 96, 168, {
    map: RM.map.getActor(0, 0).inventory,
    x: 0,
    y: 0,
    width: 4,
    height: 8,
    empty: RM.items.empty
  });
  this.ground = new RM.Frame(16, 345, 96, 84, {
    x: 0,
    y: 0,
    width: 4,
    height: 4,
    empty: RM.items.empty
  });
  this.log = new RM.Label(16, 455, 608, 21, 'left');
};
