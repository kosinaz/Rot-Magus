function Game() {

  'use strict';

  this.display = new ROT.Display({
    width: 21,
    height: 21
  });
  document.body.appendChild(this.display.getContainer());

  this.terrain = {};
  var cellular = new ROT.Map.Cellular(100, 100, {
    born: [],
    survive: [0, 1, 2]
  });
  cellular.randomize(0.4);
  cellular.create(function(x, y, value) {
    if(value) {
      this.terrain[x + ',' + y] = {
        char: '#',
        transparent: false,
        passable: false
      };
    }
  }.bind(this));

  var scheduler = new ROT.Scheduler.Action();
  this.engine = new ROT.Engine(scheduler);

  this.actors = {};
  var i, adventurer, monster;
  for (i = 0; i < 1; i += 1) {
    adventurer = new Adventurer(this);
    this.actors[adventurer.x + ',' + adventurer.y] = adventurer;
    scheduler.add(adventurer, true);
  }
  for (i = 0; i < 3; i += 1) {
    monster = new Monster(this);
    this.actors[monster.x + ',' + monster.y] = monster;
    scheduler.add(monster, true);
  }

  this.engine.start();

}
