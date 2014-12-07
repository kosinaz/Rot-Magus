/*global ROT, ROTMAGUS*/
function ROTMAGUS() {
  'use strict';

  var map, view;
  map = new ROTMAGUS.Map();
  view = new ROTMAGUS.View();
  map.addObserver(view);

  var scheduler = new ROT.Scheduler.Action();
  this.engine = new ROT.Engine(scheduler);

  for (i = 0; i < 1; i += 1) {
    adventurer = new Adventurer(this);
    this.map[x + ',' + y].actor = new Actor();
    scheduler.add(adventurer, true);
  }
  for (i = 0; i < 3; i += 1) {
    monster = new Monster(this);
    this.actors[monster.x + ',' + monster.y] = monster;
    scheduler.add(monster, true);
  }

  this.engine.start();

}
