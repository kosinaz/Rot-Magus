/*global RM, ROT*/
RM = {};

RM.init = function () {
  'use strict';
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
  RM.scheduler = new ROT.Scheduler.Action();
};

RM.getTerrainSet = function () {
  'use strict';
  var terrain, i, set;
  set = [];
  for (terrain in RM.terrains) {
    if (RM.terrains.hasOwnProperty(terrain)) {
      for (i = 0; i < RM.terrains.terrain.chance; i += 1) {
        set.push(RM.terrains.terrain);
      }
    }
  }
  return set;
};

RM.getActorSet = function () {
  'use strict';
  var actor, i, set;
  set = [];
  for (actor in RM.actors) {
    if (RM.actors.hasOwnProperty(actor)) {
      for (i = 0; i < RM.actors.actor.chance; i += 1) {
        set.push(RM.actors.actor);
      }
    }
  }
  return set;
};

RM.start = function () {
  'use strict';
  var x, y, actor, i;
  for (x = -50; x < 51; x += 1) {
    RM.map[x] = [];
    for (y = -50; y < 51; y += 1) {
      RM.map[x][y].terrain = RM.terrainSet.random();
      if (ROT.RNG.getPercentage() === 1) {
        RM.map[x][y].actor = new RM.Actor(RM.actorSet.random(), x, y, true);
      }
    }
  }
  for (i = 0; i < 1; i += 1) {
    RM.map[i][0] = {
      terrain: RM.terrains.grass,
      actor: new RM.Actor(RM.actors.elf, i, 0)
    };
  }
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};

RM.getPoint = function (x, y) {
  'use strict';
  return RM.map[x] ? RM.map[x][y] : null;
};

RM.getActor = function (x, y) {
  'use strict';
  var point = RM.getPoint();
  return point ? point.actor : null;
};

RM.isTransparent = function (x, y) {
  'use strict';
  var point = RM.getPoint();
  return point ? point.terrain.transparent : false;
};

RM.isPassable = function (x, y) {
  'use strict';
  var point = RM.getPoint();
  return point ? point.terrain.passable : false;
};
